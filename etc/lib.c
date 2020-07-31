#include <math.h>
#include <time.h>
#include <stdio.h>
#include <assert.h>
#include <threads.h>

typedef double f64;
typedef unsigned long long i64;
typedef i64* p64;
typedef i64 (*fun)(i64, i64, ...);

static i64 rax;
static i64 rbx;
static i64 rcx;
static i64 rdx;

static i64 rsi;
static i64 rdi;
static i64 rbp;
static i64 rsp;

// NaN (64 bit):
// |----NaNs----|
// 1111-1111 1111-QTTT FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF
// Q = quite? (1 bit), T = type? (3 bit), F = index? (48 bit)
//         index -----VVVVVVVVVVVV
//          type ---V
//           nan VVV
#define IS_FUN 0xFFF1000000000000
#define IS_VAR 0xFFF2000000000000 // true/false/null
#define IS_STR 0xFFF3000000000000 // char < 256 < string
#define IS_OBJ 0xFFF4000000000000 // type > 3

#define TO_TAG 0xFFFF000000000000
#define TO_VAL 0x0000FFFFFFFFFFFF

#define int_to_flt(a) (*(f64*)a)
#define flt_to_int(a) (*(i64*)a)

#define any_to_tag(a) (a & TO_TAG)
#define any_to_val(a) (a & TO_VAL)

#define var_to_any(a) (TO_VAR | a)
#define fun_to_any(a) (IS_FUN | a)
#define str_to_any(a) (IS_STR | a)
#define obj_to_any(a) (IS_OBJ | a)

#define any_is_var(a) (any_to_tag(a) == IS_VAR)
#define any_is_fun(a) (any_to_tag(a) == IS_FUN)
#define any_is_str(a) (any_to_tag(a) == IS_STR)
#define any_is_obj(a) (any_to_tag(a) == IS_OBJ)
#define any_is_flt(a) (int_to_flt(a) == int_to_flt(a))

#define any_to_obj(a) (any_is_obj(a) ? (p64)any_to_val(a) : (p64)any_to_box(a))

#define ops_2620402760(a, b) { rax = a = b; }
#define ops_1675434630(a, b) { rax = a == b || any_is_str(a) && any_is_str(b) && str_to_cmp(a, b); }
#define ops_2620402776(a, b) { rax = flt_to_int(int_to_flt(a) - int_to_flt(b)); }
#define ops_2620402779(a, b) { rax = ftl_to_int(int_to_flt(a) * int_to_flt(b)); }
#define ops_2620402774(a, b) { rax = flt_to_int(int_to_flt(a) / int_to_flt(b)); }
#define ops_2620402778(a, b) { rax = any_is_flt(a) && any_is_flt(b) ? flt_to_int(int_to_flt(a) + int_to_flt(b)) : any_to_str(a, b); }
#define ops_2620402775(a, b) { static i64 i; p64 j = any_to_obj(a); if (b != j[i]) { i = obj_to_idx(j, b, i); } rax = &(j[i + 1]); }

#include <math.h>
#include <time.h>
#include <stdio.h>
#include <assert.h>
#include <threads.h>

typedef void* p64;
typedef double f64;
typedef unsigned long long i64;
typedef union {i64 bit; f64 flt;} u64;
typedef u64 (*fun)(i64, ...);

static u64 l64;
static u64 r64;

// NaN (64 bit):
// |----NaNs----|
// 1111-1111 1111-QTTT FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF
// Q = quite? (1 bit), T = type? (3 bit), F = index? (48 bit)
//                  index ------VVVVVVVVVVVV
//                   type -----V
//                    nan --VVV
static const i64 IS_NIL = 0xFFF0000000000000ULL;
static const i64 IS_VAR = 0xFFF1000000000000ULL;
static const i64 IS_TAG = 0xFFF2000000000000ULL;
static const i64 IS_FUN = 0xFFF3000000000000ULL;
static const i64 IS_STR = 0xFFF4000000000000ULL;
static const i64 IS_OBJ = 0xFFF5000000000000ULL;

static const i64 TO_NAN = 0xFFF0000000000000ULL;
static const i64 TO_TAG = 0xFFFF000000000000ULL;
static const i64 TO_BIT = 0x0000FFFFFFFFFFFFULL;

static inline i64 var_is_nan (u64 value) { return (value.bit & TO_NAN) == TO_NAN; }
static inline i64 var_is_nil (u64 value) { return (value.bit & TO_TAG) == IS_NIL; }
static inline i64 var_is_tag (u64 value) { return (value.bit & TO_TAG) == IS_TAG; }
static inline i64 var_is_fun (u64 value) { return (value.bit & TO_TAG) == IS_FUN; }
static inline i64 var_is_str (u64 value) { return (value.bit & TO_TAG) == IS_STR; }
static inline i64 var_is_obj (u64 value) { return (value.bit & TO_TAG) == IS_OBJ; }

static inline u64 nil_to_var (i64 value) { return (u64){.bit = IS_NIL | value}; }
static inline u64 var_to_var (i64 value) { return (u64){.bit = IS_VAR | value}; }
static inline u64 tag_to_var (i64 value) { return (u64){.bit = IS_TAG | value}; }
static inline u64 fun_to_var (i64 value) { return (u64){.bit = IS_FUN | value}; }
static inline u64 str_to_var (i64 value) { return (u64){.bit = IS_STR | value}; }
static inline u64 obj_to_var (i64 value) { return (u64){.bit = IS_OBJ | value}; }
static inline u64 bit_to_var (i64 value) { return (u64){.bit = value}; }
static inline u64 flt_to_var (f64 value) { return (u64){.flt = value}; }

static inline i64 var_to_bit (u64 value) { return (i64)(value.bit & TO_BIT); }
static inline i64 var_to_tag (u64 value) { return (i64)(value.bit & TO_TAG); }

#define op2620402760(a,b){bit_to_var(a.bit = b.bit)}
#define op2620402778(a,b){flt_to_var(a.flt + b.flt)}
#define op2620402776(a,b){flt_to_var(a.flt - b.flt)}
#define op2620402779(a,b){flt_to_var(a.flt * b.flt)}
#define op2620402774(a,b){flt_to_var(a.flt / b.flt)}
#define op2620402775(a,b){static i64 i=obj_to_idx(a, b);obj_to_get(a, i);}

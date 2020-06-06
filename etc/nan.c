#include <math.h>

// assignment
#define op2620402760(a,b)(bit_to_var(a.bit = b.bit))

typedef void* p64;
typedef double f64;
typedef long long i64;
typedef union {i64 bit; f64 num;} var;
typedef var (*fun)(var);

static var rdx;
static var rax;

// NaN (64 bit):
// |----NaNs----|
// 1111-1111 1111-QTTT FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF
// Q = quite? (1 bit), T = type? (3 bit), F = index? (48 bit)
//     index ------VVVVVVVVVVVV
//      type -----V
//       nan --VVV
static const i64 IS_NIL = 0xFFF0000000000000ULL;
static const i64 IS_VAL = 0xFFF1000000000000ULL;
static const i64 IS_TAG = 0xFFF2000000000000ULL;
static const i64 IS_FUN = 0xFFF3000000000000ULL;
static const i64 IS_STR = 0xFFF4000000000000ULL;
static const i64 IS_OBJ = 0xFFF5000000000000ULL;

static const i64 TO_NAN = 0xFFF0000000000000ULL;
static const i64 TO_TAG = 0xFFFF000000000000ULL;
static const i64 TO_BIT = 0x0000FFFFFFFFFFFFULL;

static inline var val_to_var (i64 value) { return (var){.bit = IS_VAL | value}; }
static inline var tag_to_var (i64 value) { return (var){.bit = IS_TAG | value}; }
static inline var fun_to_var (i64 value) { return (var){.bit = IS_FUN | value}; }
static inline var str_to_var (i64 value) { return (var){.bit = IS_STR | value}; }
static inline var obj_to_var (i64 value) { return (var){.bit = IS_OBJ | value}; }

static inline var bit_to_var (i64 value) { return (var){.bit = value}; }
static inline var num_to_var (f64 value) { return (var){.num = value}; }

static inline i64 var_to_bit (var value) { return (i64)(value.bit & TO_BIT); }
static inline i64 var_to_tag (var value) { return (i64)(value.bit & TO_TAG); }

static inline i64 var_is_nan (var value) { return (value.bit & TO_NAN) == TO_NAN; }
static inline i64 var_is_nil (var value) { return (value.bit & TO_TAG) == IS_NIL; }
static inline i64 var_is_tag (var value) { return (value.bit & TO_TAG) == IS_TAG; }
static inline i64 var_is_fun (var value) { return (value.bit & TO_TAG) == IS_FUN; }
static inline i64 var_is_str (var value) { return (value.bit & TO_TAG) == IS_STR; }
static inline i64 var_is_obj (var value) { return (value.bit & TO_TAG) == IS_OBJ; }

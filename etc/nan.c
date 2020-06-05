#include <math.h>

typedef void* p64;
typedef double f64;
typedef long long i64;
typedef f64 var;
typedef var (*fun)(var);
f64 rdx;
f64 rax;

// NaN (64 bit):
// |-nan--------|             |-type-|  |-index--------------------------|
// 11111111 1111Q000 00000000 TTTTTTTT 0FFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
// Q = quite?, T = type?, F = index? (31 bits)
//    index -----------VVVVVVVV
//     type -------VVVV
//      nan ---VVVV
f64 IS_NIL = 0xFFF0000100000000LL;
f64 IS_TAG = 0xFFF0000200000000LL;
f64 IS_FUN = 0xFFF0000300000000LL;
f64 IS_STR = 0xFFF0000400000000LL;
f64 IS_OBJ = 0xFFF0000500000000LL;
f64 TO_TAG = 0xFFFFFFFF00000000LL;
f64 TO_IDX = 0x00000000FFFFFFFFLL;

f64 obj_to_nan (i64 value) { return (f64)(IS_OBJ | value); }
i64 nan_to_idx (f64 value) { return (i64)(value & TO_IDX); }
i64 nan_is_fun (f64 value) { return (value & TO_TAG) == IS_FUN; }
i64 nan_is_str (f64 value) { return (value & TO_TAG) == IS_STR; }
i64 nan_is_obj (f64 value) { return (value & TO_TAG) == IS_OBJ; }
i64 nan_is_obj (f64 value) { return (value & TO_TAG) == IS_TAG; }

i64 idx = 0;
i64 len = 32;
i64 mem = 1024;

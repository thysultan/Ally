#include <math.h>

typedef double var;
typedef void * obj;

// NaN (64 bit):
// |-nan--------|             |-type--|  |-index--------------------------|
// 11111111 1111Q000 00000000 TTTT_TTTT 0FFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
// Q = quite?, T = type?, F = index? (31 bits)
//    index -----------VVVVVVVV
//     type -------VVVV
//      nan ---VVVV
var IS_NIL = 0xFFF0000100000000LL;
var IS_FUN = 0xFFF0000200000000LL;
var IS_STR = 0xFFF0000300000000LL;
var IS_OBJ = 0xFFF0000400000000LL;
var IS_TAG = 0xFFF0000500000000LL;
var TO_TAG = 0xFFFFFFFF00000000LL;
var TO_IDX = 0x00000000FFFFFFFFLL;

var obj_to_nan (int index) { return (double)(IS_OBJ | index); }
int nan_to_idx (var value) { return (int)(value & TO_IDX); }
int nan_is_fun (var value) { return (value & TO_TAG) == IS_FUN; }
int nan_is_str (var value) { return (value & TO_TAG) == IS_STR; }
int nan_is_obj (var value) { return (value & TO_TAG) == IS_OBJ; }
int nan_is_obj (var value) { return (value & TO_TAG) == IS_TAG; }

int idx = 0;
int len = 32;
int mem = 1024;

// -Wno-int-conversion
// -Wno-unused-value

#include <math.h>
#include <uchar.h>
#include <wchar.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef char i08; // 1 byte
typedef char* p08; // 1 byte pointer
typedef short i16; // 2 byte
typedef char32_t i32; // 4 byte
typedef char32_t* p32; // 4 byte pointer
typedef long long i64; // 8 byte
typedef double f64; // 8 byte
typedef i64* p64; // 8 byte pointer
typedef f64* d64; // 8 byte pointer
typedef void* v64; // 8 byte pointer
typedef i64 (*x64)(i64, ...); // 8 byte pointer

// flagging
static i64 zfg = 0; // zero flag
static i64 sfg = 0; // sign flag
static i64 cfg = 0; // case flag
static i64 tfg = 0; // trap flag

static i64 dfg = 0; // direction flag
static i64 ofg = 0; // overflows flag
static i64 ifg = 0; // interrupt flag
static i64 afg = 0; // auxiliary flag

// special
static i64 rsi = 0;
static i64 rdi = 0;
static p64 rsp = 0;
static p64 rbp = 0;
static p64 rip = 0;

// general
static i64 rax = 0;
static i64 rbx = 0;
static p64 rcx = 0;
static p64 rdx = 0;

// floats
static f64 fax = 0;
static f64 fbx = 0;

// noop
static i64 nop = 0;

// arguments
static i64 arc = 0; // arg count
static p64 arv = 0; // arg vector
static p64 are = 0; // arg enviroment
static p64 arg = 0; // arg global
static p64 ars = 0; // arg super

// constant variables
static i64 null = 0xFFF1000000000001;
static i64 true = 0xFFF1000000000002;
static i64 false = 0xFFF1000000000003;
static i64 undefined = 0xFFF1000000000004;

// nan boxing (64 bit):
// |----NaNs----|
// S111-1111 1111-QTTT FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF
// S = sign? (1 bit) Q = quite? (1 bit), T = tag? (3 bit), F = val? (48 bit)
//           val -----VVVVVVVVVVVV
//           tag ---V
//           sig V
//           nan VVV
#define IS_VAR 0x0001000000000000 // null/true/false
#define IS_FUN 0x0002000000000000 // function/definite
#define IS_STR 0x0003000000000000 // string/character
#define IS_MEM 0x0004000000000000 // membership(array)
#define IS_SUB 0x0005000000000000 // subroutine(object)
#define IS_ALT 0x7000000000000000 // alternate

#define TO_VAR 0xFFF1000000000000
#define TO_FUN 0xFFF2000000000000
#define TO_STR 0xFFF3000000000000
#define TO_MEM 0xFFF4000000000000
#define TO_SUB 0xFFF5000000000000
#define TO_ALT 0x7FFFFFFFFFFFFFFF

#define TO_BIT 0xF000000000000000
#define TO_NAN 0xFFF0000000000000
#define TO_TAG 0x000F000000000000
#define TO_VAL 0x0000FFFFFFFFFFFF

// decode number
#define flt_in_int(a) ((f64)(*(d64)(a)))
#define int_in_flt(a) ((i64)(*(p64)(a)))

#define any_to_int(a) ((i64)(a))
#define any_to_flt(a) ((f64)(a))
#define any_to_alt(a) ((i64)(TO_ALT&(i64)(a)))

// decode object
#define any_to_bit(a) ((i64)((a)&TO_BIT))
#define any_to_tag(a) ((i64)((a)&TO_TAG))
#define any_to_val(a) ((i64)((a)&TO_VAL))

// decode nanbox
#define any_is_nan(a) (isnan(int_in_flt(a)))
#define any_is_qaq(a) (((a)>>52)&1)

// decode header
#define any_is_flt(a) (!any_is_nan(a)||any_is_qaq(a))
#define any_is_alt(a) (any_to_bit(a)==IS_ALT)
#define any_is_obj(a) (any_is_nan(a)&&!any_is_qaq(a))

// decode typeof
#define any_is_var(a) (any_to_tag(a)==IS_VAR)
#define any_is_fun(a) (any_to_tag(a)==IS_FUN)
#define any_is_str(a) (any_to_tag(a)==IS_STR)
#define any_is_mem(a) (any_to_tag(a)==IS_MEM)
#define any_is_sub(a) (any_to_tag(a)==IS_SUB)

// encode values
#define var_to_any(a) (TO_VAR|(i64)(a))
#define fun_to_any(a) (TO_FUN|(i64)(a))
#define str_to_any(a) (TO_STR|(i64)(a))
#define mem_to_any(a) (TO_MEM|(i64)(a))
#define sub_to_any(a) (TO_SUB|(i64)(a))

// memory setter
#define pre_to_set(a,b) ((p64)(a)[0]=(i64)(b))
#define cap_to_set(a,b) ((p64)(a)[1]=(i64)(b))
// memory getter
#define pre_to_get(a,b) ((b)(p64)(a)[0])
#define cap_to_get(a,b) ((b)(p64)(a)[1])
// object setter
#define len_to_set(a,b) ((p64)(a)[0]=(i64)(b))
#define fun_to_set(a,b) ((p64)(a)[1]=(i64)(b))
#define env_to_set(a,b) ((p64)(a)[2]=(i64)(b))
#define mem_to_set(a,b) ((p64)(a)[3]=(i64)(b))

// object getter
#define len_to_get(a,b) ((b)(p64)(a)[0])
#define fun_to_get(a,b) ((b)(p64)(a)[1])
#define env_to_get(a,b) ((b)(p64)(a)[2])
#define mem_to_get(a,b) ((b)(p64)(a)[3])

// separate
#define str_to_sep(a) separate((p64)(a),IS_STR)
#define mem_to_sep(a) separate((p64)(a),IS_MEM)
#define sub_to_sep(a) separate((p64)(a),IS_SUB)

// allocate
#define mem_to_new(a) allocate_object(a,IS_MEM) // allocate mem object
#define sub_to_new(a) allocate_object(a,IS_SUB) // allocate sub object
// delocate
#define mem_to_del(a) delocate_object(a,IS_MEM) // delocate mem object
#define sub_to_del(a) delocate_object(a,IS_SUB) // delocate sub object

// iteration
#define key_in_sub(a,b) () // get key in for in operation
#define val_in_sub(a,b) () // get val in for in operation
#define key_of_sub(a,b) () // get key in for of operation
#define val_of_sub(a,b) () // get val in for of operation

static i64 any_to_int (i64 rax) {
	return 0;
}

static p64 any_to_str (i64 rax) {
	return 0;
}

static p64 any_to_obj (i64 rax) {
	i64 tag = any_to_tag(rax);
	i64 val = any_to_val(rax);

	switch (tag) {
		case IS_STR:
			if (!any_is_alt(rax)) {
				break
			}
		case IS_VAR: return any_to_box(val, tag);
	}

	return len_to_get(val, i64) < 0 ? separate(val, tag) : val;
}

static p64 any_to_box (i64 rax, i64 rbx) {
	static i64 obj[4];
	static i64 fun;
	static i64 mem;

	switch (rbx) {
		case IS_STR: fun = &string;
			break
		case IS_VAR: fun = &object;
			break
	}

	mem = rax;

	len_to_set(obj, 1);
	mem_to_set(obj, &mem);
	env_to_set(obj, rbx);
	fun_to_set(obj, fun);

	return obj;
}

static i64 any_to_cmp (i64 rax, i64 rbx) {
	if (rax == rbx) {
		return 1;
	}

	if (any_to_tag(rax) != any_to_tag(rbx)) {
		return 0;
	}

	p64 rcx = any_to_obj(rax);
	p64 rdx = any_to_obj(rbx);

	if (rcx == rdx) {
		return 1;
	}

	i64 rsi = len_to_get(rcx);
	i64 rdi = len_to_get(rdx);

	if (rsi != rdi) {
		return 0;
	}

	switch (any_to_tag(rax)) {
		case IS_STR:
			p32 rsp = mem_to_get(rcx, p32);
			p32 rbp = mem_to_get(rdx, p32);

			if (rsp != rbp) {
				while (--rdi > -1) {
					i64 a = rsp[rdi];
					i64 b = rbp[rdi];

					if (a != b) {
						return 0;
					}
				}
			}
			break;
		case IS_MEM:
			p64 rsp = mem_to_get(rcx, p64);
			p64 rbp = mem_to_get(rdx, p64);

			if (rsp != rbp) {
				while (--rdi > -1) {
					i64 a = rsp[rdi];
					i64 b = rbp[rdi];

					if (a != b && (any_is_flt(a) || any_is_flt(b) || !any_to_cmp(a, b))) {
						return 0;
					}
				}
			}
			break;
		case IS_SUB:
			p64 rsp = mem_to_get(rcx, p64);
			p64 rbp = mem_to_get(rdx, p64);

			if (rsp != rbp) {
				while (--rdi < -1) {
					i64 a = rsp[1 + rdi - rsi];
					i64 b = any_in_sub(a, rbx, &rax, rbp, 0, rbp);

					if (rax == undefined) {
						return 0;
					}

					if (a != b && (any_is_flt(a) || any_is_flt(b) || !any_to_cmp(a, b))) {
						return 0;
					}
				}
			}
			break;
		case IS_VAR:
		case IS_FUN:
			return 0;
	}

	return 1;
}

static i64 any_in_mem (i64 rax, i64 rbx, p64 rcx, p64 rdx) {
	i64 len = len_to_get(rdx, i64);
	p64 obj = mem_to_get(rdx, p64);

	if (rax < len) {
		switch (any_to_tag(rbx)) {
			case IS_STR:
				return any_to_alt(str_to_any((p32)obj[rax]));
			case IS_MEM:
				return *(*rcx = &obj[rax]);
			case IS_SUB:
				break;
		}
	}

	return null;
}

static i64 any_in_sub (i64 rax, i64 rbx, p64 rcx, p64 rdx, i64 rsi, p64 rdi) {
	i64 len = len_to_get(rdx, i64);
	p64 obj = mem_to_get(rdx, p64);

	switch (any_to_tag(rbx)) {
		case IS_STR:
			break;
		case IS_MEM:
			break;
		case IS_SUB:
			if (obj[(rsi = rsi < len ? rsi : 0) + len] != rax) {
				for (rsi = 0; rsi < len; ++rsi) {
					if (obj[rsi + len] == rax) {
						break;
					}
				}
			}

			if (rsi == len) {
				*rcx = undefined;
			} else {
				return *(*rcx = &obj[*rdi = rsi]);
			}
	}

	return null;
}

static i64 separate (i64 rax, i64 rbx) {
	return 0;
}
static i64 sequence (i64 rax, i64 rbx) {
	return 0;
}

static i64 await (i64 rax) {}
static i64 yield (i64 rax) {}
static i64 types (i64 rax) {}
static p64 clone (i64 rax, i64 rbx, p64 rcx) {}

// heap
static p64 free[10];
static p64 used[10];
static p64 page[10];
static i64 head[10];
static i64 size;

static i64 allocate_length (i64 rax) {
	rax -= 1;
  rax |= rax >> 1;
  rax |= rax >> 2;
  rax |= rax >> 4;
  rax |= rax >> 8;
  rax |= rax >> 16;
  rax += 1;

  return rax;
}

static i64 allocate_offset (i64 rax) {
	switch (rax) {
		case 8: return 0;
		case 16: return 1;
		case 32: return 2;
		case 64: return 3;
		case 128: return 4;
		case 256: return 5;
		case 512: return 6;
		case 1024: return 7;
		case 2048: return 8;
		case 4096: return 9;
	}

	return 10;
}

static p64 allocate_memory (i64 rax, i64 rbx) {
	i64 align = allocate_length(rax + 8);
	i64 index = allocate_offset(align);
	i64 count = align * rbx + 16;
	p64 taken = used[index];
	p64 empty = free[index];

	if (!empty) {
		p08 paper = page[index];
		p08 caret = head[index];
		p08 blank;

		if (caret - count < paper + 16) {
			if (blank = malloc(index = allocate_length(1024 * 64 + count + 16))) {
				pre_to_set(blank, paper);
				cap_to_set(blank, index);

				paper = page[index] = blank;
				caret = blank + index;
			} else {
				fault(0);
			}
		}

		empty = head[index] = caret - count;
	}

	used[index] = empty;
	free[index] = pre_to_get(empty, i64);

	pre_to_set(empty, taken);

	return empty + 8;
}

static p64 allocate_object (i64 rax, i64 rbx) {
	p64 obj = allocate_memory(0, 8);

	if (rax) {
		switch (rbx) {
			case IS_STR: mem_to_set(obj, allocate_memory(8 + rax * 1, 4));
				break;
			case IS_MEM: mem_to_set(obj, allocate_memory(8 + rax * 1, 8));
				break;
			case IS_SUB: mem_to_set(obj, allocate_memory(8 + rax * 2, 8));
				break;
		}
	}

	return obj;
}

// string callable
static i64 string (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

// number callable
static i64 number (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

// object callable
static i64 object (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

// member callable
static i64 member (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

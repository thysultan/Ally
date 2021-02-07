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

// iterate
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

// args
static i64 arc = 0; // arg count
static p64 arv = 0; // arg vector
static p64 are = 0; // arg enviroment
static p64 arg = 0; // arg global
static p64 ars = 0; // arg super

// constant strings
static p32 str_null = U"null";
static p32 str_true = U"true";
static p32 str_false = U"false";
static p32 str_array = U"array";
static p32 str_object = U"object";
static p32 str_string = U"string";
static p32 str_number = U"number";
static p32 str_boolean = U"boolean";
static p32 str_function = U"function";

// constant values
#define null var_to_any(str_null)
#define true var_to_any(str_true)
#define false var_to_any(str_false)

// nan boxing (64 bit):
// |----NaNs----|
// S111-1111 1111-QTTT FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF
// S = sign? (1 bit) Q = quite? (1 bit), T = tag? (3 bit), F = val? (48 bit)
//           val -----VVVVVVVVVVVV
//           tag ---V
//           sig V
//           nan VVV
#define IS_VAR 0x0000000000000000 // null/true/false
#define IS_FUN 0x0001000000000000 // function/definite
#define IS_STR 0x0002000000000000 // string/character
#define IS_MEM 0x0003000000000000 // membership(array)
#define IS_SUB 0x0004000000000000 // subroutine(object)
#define IS_ALT 0x7000000000000000 // alternate

#define TO_VAR 0xFFF1000000000000
#define TO_FUN 0xFFF2000000000000
#define TO_STR 0xFFF3000000000000
#define TO_MEM 0xFFF4000000000000
#define TO_SUB 0xFFF5000000000000
#define TO_ALT 0x7FFFFFFFFFFFFFFF

#define TO_NAN 0xFFF0000000000000
#define TO_BIT 0xF000000000000000
#define TO_TAG 0x000F000000000000
#define TO_VAL 0x0000FFFFFFFFFFFF

// decode number
#define flt_in_int(a) ((f64)(*(d64)(a)))
#define int_in_flt(a) ((i64)(*(p64)(a)))
// encode number
#define any_to_int(a) ((i64)(a))
#define any_to_flt(a) ((f64)(a))
#define any_to_alt(a) ((i64)(TO_ALT&(i64)(a)))
// decode object
#define any_to_ptr(a) ((p64)(a))
#define any_to_str(a) ((p64)(a))
#define any_to_nan(a) ((i64)((a)&TO_NAN))
#define any_to_bit(a) ((i64)((a)&TO_BIT))
#define any_to_tag(a) ((i64)((a)&TO_TAG))
#define any_to_val(a) ((i64)((a)&TO_VAL))
// decode nanbox
#define any_is_qaq(a) (((a)>>52)&1)
#define any_is_nan(a) (any_to_nan(a)==TO_NAN)
// decode header
#define any_is_alt(a) (any_to_bit(a)==IS_ALT)
#define any_is_flt(a) (!any_is_nan(a)||any_is_qaq(a))
#define any_is_ptr(a) (any_is_nan(a)&&!any_is_qaq(a))

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
// encode/decode
#define tag_to_any(a,b) (a|(i64)(b))

// memory setter
#define pre_to_set(a,b) ((p64)(a)[-2]=(i64)(b))
#define cap_to_set(a,b) ((p64)(a)[-1]=(i64)(b))
// memory getter
#define pre_to_get(a,b) ((b)(p64)(a)[-2])
#define cap_to_get(a,b) ((b)(p64)(a)[-1])
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

// allocate/delocate
#define obj_to_new(a,b) allocate_memory(a,b) // allocate object
#define mem_to_new(a,b) allocate_memory(a,b) // allocate memory
#define obj_to_del(a,b) delocate_memory(a,b) // delocate object
#define mem_to_del(a,b) delocate_memory(a,b) // delocate memory

#define mem_to_cpy(a,b,c) memcpy(a,b,(c)*sizeof(b))

// iteration
#define key_in_sub(a,b) () // get key in for in operation
#define val_in_sub(a,b) () // get val in for in operation
#define key_of_sub(a,b) () // get key in for of operation
#define val_of_sub(a,b) () // get val in for of operation

static i64 any_to_num (i64 rax) {
	if (any_is_ptr(rax)) {
		switch (any_to_tag(rax)) {
			case IS_VAR:
				return rax == true;
			case IS_STR:
				return len_to_get(any_to_obj(rax), i64);
		}
	}

	return rax;
}

static i64 any_to_str (i64 rax) {
	p64 obj = 0;

	if (any_is_ptr(rax)) {
		switch (any_to_tag(rax)) {
			case IS_VAR:
				len_to_set(obj = obj_to_new(0, i64), wcslen(any_to_str(mem_to_set(obj, any_to_val(rax)))));
			case IS_STR:
				return rax;
			case IS_MEM:
			case IS_SUB:
				return rax;
		}
	} else {
		len_to_set(obj = obj_to_new(0, i64), swprintf(mem_to_set(obj, mem_to_new(30, IS_STR)), 30, "%g", rax));
	}

	return str_to_any(obj);
}

static p64 any_to_obj (i64 rax) {
	i64 tag = any_to_tag(rax);
	i64 val = any_to_val(rax);

	switch (tag) {
		case IS_STR:
			if (!any_is_alt(rax)) {
				break;
			}
		case IS_VAR: return any_to_box(val, tag);
	}

	return len_to_get(val, i64) < 0 ? any_to_sep(val, tag) : val;
}

static p64 any_to_box (i64 rax, i64 rbx) {
	static i64 obj[4];
	static i64 fun;
	static i64 mem;

	switch (rbx) {
		case IS_STR: fun = &string;
			break;
		case IS_VAR: fun = &object;
			break;
	}

	mem = rax;

	len_to_set(obj, 1);
	mem_to_set(obj, &mem);
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
					i32 a = rsp[rdi];
					i32 b = rbp[rdi];

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
					i64 idx = 0;
					i64 key = rsp[rdi + rsi];
					i64 val = any_in_sub(key, rbx, &nop, rdx, 0, &idx);

					if (idx == -1) {
						return 0;
					}

					i64 a = rsp[rdi];
					i64 b = rbp[rdi];

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

static i64 any_to_seq (i64 rax, i64 rbx) {
	return 0;
}

static p64 any_to_sep (i64 rax, i64 rbx, p64 rcx, p64 rdx, i64 rsi, i64 rdi, p64 rsp) {
	switch (rbx) {
		case IS_MEM:
			for (i64 i = rbx = 0; i < rsi; ++i) {
				mem_to_cpy(rdx, rcx, rbx = rsp[i]);

				p64 obj = any_to_obj(rax = rcx[rbx]);
				i64 len = len_to_get(obj, i64);
				p64 mem = mem_to_get(obj, p64);

				switch (any_to_tag(rax)) {
					case IS_STR:
						for (i64 i = 0; i < len; ++i) {
							rdx[rbx + i] = any_to_chr(any_to_str(mem)[i]);
						}
						break;
					case IS_MEM:
						for (i64 i = 0; i < len; ++i) {
							rdx[rbx + i] = mem[i];
						}
						break;
				}

				rdx = rdx + rbx;
			}

			return mem_to_cpy(rdx, rcx, len_to_set(rcx, rdi) - rbx);
		case IS_SUB:
			i64 arc = len_to_get(rcx, i64);
			i64 arv[rdi * 2];

			for (i64 i = rbx = 0; i < rsi; ++i) {
				mem_to_cpy(arv, rcx, rbx = rsp[i]);
				mem_to_cpy(arv + rdi, rcx + len_to_get(rcx, i64), rbx = rsp[i]);

				p64 obj = any_to_obj(rax = rcx[rbx]);
				p64 mem = mem_to_get(obj, p64);
				i64 len = len_to_get(obj, i64);

				for (i64 i = 0; i < len; ++i) {
					i64 idx = 0;
					i64 key = mem[i + len];
					i64 val = mem[i];

					any_in_sub(key, rax, &nop, rcx, 0, &idx);

					if (idx == -1) {
						arv[arc + rdi] = key
						arv[arc++] = val;
					} else {
						arv[idx + rdi] = key;
						arv[idx] = val;
					}
				}
			}

			return mem_to_cpy(mem_to_cpy(rdx = mem_to_new(arc, i64), arv, arc) + arc, arv + rdi, len_to_set(rcx, arc));
	}

	return rdx;
}

static i64 any_in_sub (i64 rax, i64 rbx, p64 rcx, p64 rdx, i64 rsi, p64 rdi) {
	i64 len = len_to_get(rdx, i64);
	p64 mem = mem_to_get(rdx, p64);

	switch (any_to_tag(rbx)) {
		case IS_STR:
			break;
		case IS_MEM:
			break;
		case IS_SUB:
			if (mem[(rsi = rsi > -1 && rsi < len ? rsi : 0) + len] != rax) {
				for (rsi = 0; rsi < len; ++rsi) {
					if (mem[rsi + len] == rax) {
						break;
					}
				}
			}

			if (rsi != len) {
				return *(*rcx = &mem[*rdi = rsi]);
			} else {
				*rdi = -1;
			}
	}

	return null;
}

static i64 any_in_mem (i64 rax, i64 rbx, p64 rcx, p64 rdx) {
	i64 len = len_to_get(rdx, i64);
	p64 mem = mem_to_get(rdx, p64);

	if (rax < len) {
		switch (any_to_tag(rbx)) {
			case IS_STR:
				return str_to_any((p32)mem[rax]);
			case IS_MEM:
				return *(*rcx = &mem[rax]);
			case IS_SUB:
				break;
		}
	}

	return null;
}

static i64 await (i64 rax) {}
static i64 yield (i64 rax) {}

static i64 types (i64 rax) {
	i64 len = 0;
	p64 obj = 0;
	p32 mem = 0;

	switch (any_to_tag(rax)) {
		case IS_VAR:
			if (rax == null) {
				static rsp[4];
				{
					len = 4;
					obj = rsp;
					mem = str_null;
				}
			} else {
				static rsp[4];
				{
					len = 8;
					obj = rsp;
					mem = str_boolean;
				}
			}
			break;
		case IS_FUN: static rsp[4];
			len = 8;
			obj = rsp;
			mem = str_function;
			break;
		case IS_STR: static rsp[4];
			len = 5;
			obj = rsp;
			mem = str_string;
			break;
		case IS_MEM: static rsp[4];
			len = 5;
			obj = rsp;
			mem = str_array;
			break;
		case IS_SUB: static rsp[4];
			len = 6;
			obj = rsp;
			mem = str_object;
			break;
	}

	len_to_set(obj, len);
	mem_to_set(obj, mem);
	fun_to_set(obj, &string);

	return str_to_any(rax);
}

static p64 clone (i64 rax, i64 rbx, p64 rcx) {
	i64 tag = any_to_tag(rax);

	if (tag < IS_MEM) {
		return rax;
	}

	i64 len = len_to_get(rcx = any_to_val(rax), i64);
	p64 obj = obj_to_new(0, tag);
	p64 new = mem_to_set(obj, mem_to_new(len, tag));
	p64 old = mem_to_get(rcx, p64);

	while (--len) {
		new[len] = old[len];
	}

	return tag_to_any(tag, obj);
}

static p64 slice (i64 rax, i64 rbx, p64 rcx) {
	return 0;
}

// heap
static p64 free[16];
static p64 used[16];
static p64 page[16];
static i64 head[16];
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
		case 4: return 0;
		case 8: return 1;
		case 16: return 2;
		case 32: return 3;
		case 64: return 4;
		case 128: return 5;
		case 256: return 6;
		case 512: return 7;
		case 1024: return 8;
		case 2048: return 9;
		case 4096: return 10;
	}

	return 11;
}

static p64 allocate_memory (i64 rax, i64 rbx) {
	i64 align = allocate_length(rax + 4);
	i64 index = allocate_offset(align);
	i64 count = align * rbx + 16;
	p64 taken = used[index];
	p64 empty = free[index];

	if (!empty) {
		p08 paper = page[index];
		p08 caret = head[index];
		p08 blank = NULL;

		if (caret - count < paper + 16) {
			if (blank = malloc(index = allocate_length(1024 * 16 + count + 16))) {
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

static i64 delocate_memory (i64 rax, i64 rbx) {
	return 0;
}

static p64 organize_memory (i64 rax, i64 rbx) {
	return 0;
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

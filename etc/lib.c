// -Wno-int-conversion
// -Wno-unused-value

#include <math.h>
#include <time.h>
#include <stdio.h>
#include <uchar.h>
#include <wchar.h>
#include <string.h>
#include <assert.h>
#include <threads.h>
#include <sys/mman.h>

// typings definitions
typedef char i08;
typedef char* u08;
typedef char32_t i32;
typedef char32_t* u32;
typedef long long i64;
typedef double f64;
typedef i64* p64;
typedef f64* d64;
typedef i64 (*x64)(i64, ...);

// bytes
static i64 b01 = sizeof(i08) * 1;
static i64 b04 = sizeof(i32) * 1;
static i64 b08 = sizeof(i64) * 1;
static i64 b16 = sizeof(i64) * 2;

// flagging
static i64 cfg = 0;
static i64 zfg = 0;
static i64 sfg = 0;
static i64 ofg = 0;

// address
static i64 rip = 0;

// general
static i64 rax = 0;
static i64 rbx = 0;
static p64 rcx = 0;
static p64 rdx = 0;

static f64 eax = 0;
static f64 ebx = 0;
static d64 ecx = 0;
static d64 edx = 0;

// special
static i64 rsi = 0;
static i64 rdi = 0;
static p64 rsp = 0;
static p64 rbp = 0;

static i64 esi = 0;
static i64 edi = 0;
static p64 esp = 0;
static p64 ebp = 0;

// arguments
static i64 arc = 0;
static p64 arv = 0;
static p64 are = 0;
static p64 arg = 0;

// constant variables
#define str ((i64)(&string))
#define fun ((i64)(&function))
#define mem ((i64)(&membership))
#define sub ((i64)(&subroutine))

static i64 nil = 0x0000000000000000;
static i64 nop = 0x0000000000000000;
static i64 null = 0xFFF1000000000001;
static i64 true = 0xFFF1000000000002;
static i64 false = 0xFFF1000000000003;

// nan boxing (64 bit):
// |----NaNs----|
// S111-1111 1111-QTTT FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF
// S = sign? (1 bit) Q = quite? (1 bit), T = tag? (3 bit), F = val? (48 bit)
//           val -----VVVVVVVVVVVV
//           tag ---V
//           sig V
//           nan VVV
#define IS_ENV 0x0000000000000000
#define IS_BIT 0x7000000000000000 // bit flag

#define IS_VAR 0x0001000000000000 // null/true/false
#define IS_FUN 0x0002000000000000 // function/definition
#define IS_STR 0x0003000000000000 // string/character
#define IS_MEM 0x0004000000000000 // membership(array)
#define IS_SUB 0x0005000000000000 // subroutine(object)

#define TO_VAR 0xFFF1000000000000
#define TO_FUN 0xFFF2000000000000
#define TO_STR 0xFFF3000000000000
#define TO_MEM 0xFFF4000000000000
#define TO_SUB 0xFFF5000000000000

#define TO_BIT 0x7FFFFFFFFFFFFFFF

#define IS_BIT 0xF000000000000000
#define TO_TAG 0x000F000000000000
#define TO_VAL 0x0000FFFFFFFFFFFF

// decode number
#define flt_to_int(a) ((i64)(a))
#define int_to_flt(a) ((f64)(a))
//
#define flt_in_int(a) (*(p64)(a))
#define int_in_flt(a) (*(d64)(a))

// decode object
#define any_to_bit(a) ((a)&IS_BIT)
#define any_to_tag(a) ((a)&TO_TAG)
#define any_to_val(a) ((a)&TO_VAL)

// decode header
#define any_is_bit(a) (any_to_bit(a)==IS_BIT)
#define any_is_obj(a) (any_to_tag(a)>=IS_STR)
#define any_is_flt(a) (int_in_flt(a)==int_in_flt(a))

// decode typeof
#define any_is_var(a) (any_to_tag(a)==IS_VAR)
#define any_is_fun(a) (any_to_tag(a)==IS_FUN)
#define any_is_str(a) (any_to_tag(a)==IS_STR)
#define any_is_mem(a) (any_to_tag(a)==IS_MEM)
#define any_is_sub(a) (any_to_tag(a)==IS_SUB)

// encode any
#define var_to_any(a) (TO_VAR|(a))
#define fun_to_any(a) (TO_FUN|(a))
#define str_to_any(a) (TO_STR|(a))
#define mem_to_any(a) (TO_MEM|(a))
#define sub_to_any(a) (TO_SUB|(a))

// encode bit
#define var_to_bit(a) (TO_BIT&var_to_any(a))
#define fun_to_bit(a) (TO_BIT&fun_to_any(a))
#define str_to_bit(a) (TO_BIT&str_to_any(a))
#define mem_to_bit(a) (TO_BIT&mem_to_any(a))
#define sub_to_bit(a) (TO_BIT&sub_to_any(a))

// header setters
#define tie_to_set(a,b) (((p64)(a))[-2]=(i64)(b))
#define cap_to_set(a,b) (((p64)(a))[-1]=(i64)(b))
// header getters
#define tie_to_get(a,b) ((b)(((p64)(a))[-2]))
#define cap_to_get(a,b) ((b)(((p64)(a))[-1]))

// object setters
#define len_to_set(a,b) (((p64)(a))[0]=((i64)(b)))
#define env_to_set(a,b) (((p64)(a))[1]=((i64)(b)))
#define fun_to_set(a,b) (((p64)(a))[2]=((i64)(b)))
#define mem_to_set(a,b) (((p64)(a))[3]=((i64)(b)))
// object getters
#define len_to_get(a,b) ((b)(((p64)(a))[0]))
#define env_to_get(a,b) ((b)(((p64)(a))[1]))
#define fun_to_get(a,b) ((b)(((p64)(a))[2]))
#define mem_to_get(a,b) ((b)(((p64)(a))[3]))

// allocate
#define env_to_new(a) allocate_object(a,IS_ENV) // allocate new env object
#define fun_to_new(a) allocate_object(a,IS_FUN) // allocate new fun object
#define mem_to_new(a) allocate_object(a,IS_MEM) // allocate new mem object
#define sub_to_new(a) allocate_object(a,IS_SUB) // allocate new sub object
// allocate helpers
#define int_to_new(a,b) (((a)+((b)-1))&~((b)-1))
#define map_to_new(a,b) ((b)(mmap(NULL,a,PROT_READ|PROT_WRITE,MAP_PRIVATE|MAP_ANONYMOUS,0,0)))

#define key_in_sub(a,b) () // get key in for in operation
#define val_in_sub(a,b) () // get val in for in operation
#define key_of_sub(a,b) () // get key in for of operation
#define val_of_sub(a,b) () // get val in for of operation

static i64 any_to_int(i64 rax) {
	return nil;
}

static p64 any_to_obj (i64 rax) {
	i64 tag = any_to_tag(rax);
	i64 val = any_to_val(rax);

	if (tag >= IS_STR) {
		return len_to_get(val, i64) < nil ? any_to_sep(val) : val;
	} else {
		return any_to_box(val, tag);
	}
}

static i64 any_to_box(i64 rax, i64 rbx) {
	return nil;
}

static i64 any_to_mem(p64 rax, i64 rbx, p64 rcx, p64 rdx) {
	i64 len = len_to_get(rdx, i64);

	if (rax < len) {
		switch(any_to_tag(rbx)) {
			case IS_STR:
				*rcx = &nop;
				*rax = str_to_any(mem_to_get(obj, p08)[rax]);
				break
			case IS_MEM:
				*rcx = &mem_to_get(obj, p64)[rax];
				*rax = **rcx;
				break
			case IS_SUB:
				break
		}
	} else {
		*rcx=&nop;
		*rax=null;
	}

	return nil;
}

static i64 any_to_key(i64 key, i64 idx, p64 len, p64 rdx, p64 rsi, p64 rdi) {
	while (idx < len) {
		i64 var = rdx[idx++];
	}
	// TODO: find key, update rsi, rdi pointers
}

static i64 any_to_sub(p64 rax, i64 rbx, p64 rcx, p64 rdx, p64 rsi, p64 rdi) {
	i64 len = len_to_get(rdx,i64);

	switch (any_to_tag(rbx)) {
		case IS_STR:
			break
		case IS_MEM:
			break
		case IS_SUB:
			i64 key = *rax;
			p64 val = mem_to_get(obj,p64);
			i64 idx = *rsi < len ? *rsi : nil;

			if (val[idx + len] != key) {
				any_to_key(key, idx + len, len * 2, rdx, rsi, rdi);
			}

			if (idx < nil) {
				*rcx = &nop;
				*rax = null;
			} else {
				*rcx = &val[idx];
				*rax = **rcx;
			}
			break
		default: // TODO: object boxification
	}

	return nil;
}

static i64 any_to_sep(a) {}

static i64 any_to_seq(a,b) {}

static i64 any_to_cmp(a,b) {}

static i64 await(a) {}

static i64 yield(a) {}

static i64 types(a) {}

static i64 generator(a,b) {}

static i64 spreading(a,b) { return a ? a : b}

static i64 normalize(a,b) {}

/*
 * Constructor
 */

// string callable
static i64 string (i64 arc, p64 arv, p64 are, p64 arg) {
	return nil;
}

// number callable
static i64 number (i64 arc, p64 arv, p64 are, p64 arg) {
	return nil;
}

// object callable
static i64 object (i64 arc, p64 arv, p64 are, p64 arg) {
	return nil;
}

/*
 * Allocation
 */

// heap
static p64 free[8]; // 0, 8, 16, 32, 64, 128, 256, >256
static p64 used[8];
static p64 page[8]; // 4kb, 8kb, 16kb, 128kb, 256kb, >32mb
static i64 head[8];
static i64 size;

// allocate heap segregation
static i64 allocate_blocks (i64 rax) {
	if (rax <= 8) {
		return 0;
	} else if (rax <= 16) {
		return 1;
	} else if (rax <= 32) {
		return 2;
	} else if (rax <= 64) {
		return 3;
	} else if (rax <= 128) {
		return 4;
	} else if (rax <= 256) {
		return 5;
	} else if (rax <= 1024) {
		return 6;
	} else {
		return 7;
	}
}

// allocate page segregation
static i64 allocate_layout (i64 rax) {
	if (rax <= 1024 * 128) {
		return 0;
	} else if (rax <= 1024 * 256) {
		return 1;
	} else if (rax <= 1024 * 512) {
		return 2;
	} else if (rax <= 1024 * 1024) {
		return 3;
	} else if (rax <= 1024 * 1024 * 2) {
		return 4;
	} else if (rax <= 1024 * 1024 * 4) {
		return 5;
	} else if (rax <= 1024 * 1024 * 8) {
		return 6;
	} else {
		return 7;
	}
}

// allocate allocation
static p64 allocate_memory (i64 rax, i64 rbx) {
	i64 index = allocate_blocks(rax); // determine sizable kinds segregation
	i64 bytes = rax * rbx + b16; // length multipled by the size of an element plus 16 bytes for additional bookkeeping information

	p64 taken = used[index]; // taken block of memory of like sizable kinds
	p64 empty = free[index]; // empty block of memory of like sizable kinds

	// if there are no empty memory blocks left
	if (!empty) {
		i64 index = allocate_layout(rax); // get memory aligned bucket
		i08 paper = nil; // addressable in bytes

		i08 pages = page[index]; // addressable in bytes
		i08 heads = head[index]; // addressable in bytes

		// virutalize if we where to try to allocate memory would it fall out of the pages memory break
		if (heads - bytes < pages) {
			lines = int_to_new(bytes, 1024 * 64); // calcuate page size
			paper = map_to_new(lines, i08); // map memory for page

			heads = paper == -1 ? fault(ENOMEM) : *paper[lines]; // advance head caret to end of page on success
			paper = paper + b16; // advance page pointer to after meta data padding

			cap_to_set(paper, lines); // assign capacity of page
			tie_to_set(paper, pages); // assign connection to previous page
		}

		empty = head[index] = heads - bytes; // move caret of head to allocate N number of bytes for the memory request
	}

	used[index] = empty; // promote the empty block of memory to used segment
	free[index] = tie_to_get(empty, i64); // remove empty bucket from free segment

	tie_to_set(empty, taken); // connect newly empty block of memory to previous block of memory

	return empty; // return empty block of memory enough to satisfy the memory request
}

// allocate container
static p64 allocate_object (i64 rax, i64 rbx) {
	p64 obj = allocate_memory(8, b64);

	switch (rbx) {
		case IS_ENV: mem_to_set(obj, allocate_memory(8 + rax * 1, b08));
			break
		case IS_FUN: mem_to_set(obj, allocate_memory(8 + rax * 1, b08));
			break
		case IS_STR: mem_to_set(obj, allocate_memory(8 + rax * 1, b04));
			break
		case IS_MEM: mem_to_set(obj, allocate_memory(8 + rax * 1, b08));
			break
		case IS_SUB: mem_to_set(obj, allocate_memory(8 + rax * 2, b08));
			break
	}

	return obj;
}

// -Wno-int-conversion -Wno-unused-value -Wno-int-conversion -Wno-unused-value -lm
#ifndef aly
#define aly

// prototypes
i64 fun_of_num(i64, p64, p64, p64);
i64 fun_of_str(i64, p64, p64, p64);
i64 fun_of_mem(i64, p64, p64, p64);
i64 fun_of_sub(i64, p64, p64, p64);

// includes
#include <math.h> // pow, fmod, fabs
#include <uchar.h> // U"..."
#include <wchar.h> // swprintf
#include <stdio.h> // printf
#include <stdlib.h> // malloc, free
#include <string.h> // memcpy
// typeings
typedef char32_t c32;
typedef char32_t* s32;
typedef char* p08;
typedef signed char i08;
typedef unsigned char u08;
typedef short i16;
typedef unsigned short u16;
typedef int i32;
typedef unsigned int u32;
typedef signed long long i64;
typedef unsigned long long u64;
typedef double f64;
typedef long double f80;
typedef i64* p64;
typedef i64 (*x64)(i64, p64, p64, p64);

// 64 bit register(flag)
i64 zfg, sfg, cfg, tfg, dfg, ofg, ifg, afg;
// 64 bit pointers
p64 pax, pbx, pcx, pdx;
// 64 bit floats
f64 fax, fbx, fcx, fdx;
// 64 bit unsigned
u64 uax, ubx, ucx, udx;
// 64 bit register
i64 rax, rbx, rcx, rdx;
// 08 bit register
i08 eax, ebx, ecx, edx;
// 64 bit register(special)
i64 rsi, rdi, esi, edi;
p64 rsp, rdp, esp, edp;
// temporary(special)
static i64 cof;
static i08 exp;
// temporary(general)
i64 a, b, c, d;
i08 e, f, g, h;
// arguments
i64 arc, nop;
p64 arv, are, arg, ars;
// constants
i64 ten[] = {1,10,100,1000,10000,100000,1000000,10000000,100000000,1000000000,10000000000,100000000000,1000000000000,10000000000000,100000000000000,1000000000000000,10000000000000000,100000000000000000,1000000000000000000};
// strings
s32 str_null = U"null";
s32 str_true = U"true";
s32 str_false = U"false";
s32 str_array = U"array";
s32 str_object = U"object";
s32 str_string = U"string";
s32 str_number = U"number";
s32 str_boolean = U"boolean";
s32 str_function = U"function";

// variables
#define null nil_to_any(0)
#define true var_to_any(1)
#define false var_to_any(0)
// utilities
#define int_to_clz(a) (__builtin_clzll(a))
#define int_to_ctz(a) (__builtin_ctzll(a))
#define int_to_abs(a) ((a)<0?-(a):(a))
#define int_to_min(a,b) ((a)<(b)?(a):(b))
#define int_to_max(a,b) ((a)>(b)?(a):(b))
#define int_to_div(a,b,c) (a!=(c=a/b)*b)
#define int_to_mul(a,b,c) (__builtin_mul_overflow(a,b,&c))
#define int_to_add(a,b,c) (__builtin_add_overflow(a,b,&c))
#define int_to_sub(a,b,c) (__builtin_sub_overflow(a,b,&c))
#define mem_to_cpy(a,b,c) (memcpy(a,b,(c)*sizeof(b)))
// memory setter/getter
#define cap_to_set(a,b) ((p64)(a)[-1]=(i64)(b))
#define pre_to_set(a,b) ((p64)(a)[-2]=(i64)(b))
#define cap_to_get(a,b) ((b)(p64)(a)[-1])
#define pre_to_get(a,b) ((b)(p64)(a)[-2])
// object setter
#define len_to_set(a,b) ((p64)(a)[0]=(i64)(b))
#define mem_to_set(a,b) ((p64)(a)[1]=(i64)(b))
#define env_to_set(a,b) ((p64)(a)[2]=(i64)(b))
#define fun_to_set(a,b) ((p64)(a)[3]=(i64)(b))
// object getter
#define len_to_get(a,b) ((b)(p64)(a)[0])
#define mem_to_get(a,b) ((b)(p64)(a)[1])
#define env_to_get(a,b) ((b)(p64)(a)[2])
#define fun_to_get(a,b) ((b)(p64)(a)[3])
// allocate/delocate
#define obj_to_new(a,b) new_to_get(a,sizeof(b))
#define mem_to_new(a,b) new_to_get(a,sizeof(b))
#define obj_to_del(a,b) new_to_del(a,sizeof(b))
#define mem_to_del(a,b) new_to_del(a,sizeof(b))
// castings
#define any_to_u08(a) (u08)(a)
#define any_to_i08(a) (i08)(a)
#define any_to_u32(a) (u32)(a)
#define any_to_i32(a) (i32)(a)
#define any_to_u64(a) (u64)(a)
#define any_to_i64(a) (i64)(a)
#define any_to_f64(a) (f64)(a)
#define any_to_f80(a) (f80)(a)
// nan boxing (64 bit):
//
// FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-FFFF FFFF-TTTT EEEE-EEEE
// F = val (52 bits) T = tag (4 bit) E = exp (8 bit)
//           val VVVVVVVVVVVVV
//           tag -------------V
//           nan --------------VV
#define IS_NIL 0x00000000000000FF // null
#define IS_VAR 0x00000000000001FF // true/false
#define IS_FUN 0x00000000000002FF // function/definite
#define IS_STR 0x00000000000003FF // string/character
#define IS_MEM 0x00000000000004FF // membership(array)
#define IS_SUB 0x00000000000005FF // subroutine(object)
// create
#define any_to_nan(a,b) (a|(i64)(b))
#define any_to_dec(a,b) (cof_to_any(a)|exp_in_any(b))
// decode
#define any_to_tag(a) ((a)&0x0000000000000FFF)
#define any_to_val(a) ((a)&0xFFFFFFFFFFFFF000)
// encode
#define nil_to_any(a) (any_to_nan(IS_NIL,a))
#define var_to_any(a) (any_to_nan(IS_VAR,a))
#define fun_to_any(a) (any_to_nan(IS_FUN,a))
#define str_to_any(a) (any_to_nan(IS_STR,a))
#define mem_to_any(a) (any_to_nan(IS_MEM,a))
#define sub_to_any(a) (any_to_nan(IS_SUB,a))
// decode typeof
#define any_is_nil(a) (any_to_tag(a)==IS_NIL)
#define any_is_var(a) (any_to_tag(a)==IS_VAR)
#define any_is_fun(a) (any_to_tag(a)==IS_FUN)
#define any_is_str(a) (any_to_tag(a)==IS_STR)
#define any_is_mem(a) (any_to_tag(a)==IS_MEM)
#define any_is_sub(a) (any_to_tag(a)==IS_SUB)
// -128 reserved for nan
#define any_is_nan(a) (any_to_exp(a)==-128)
// positive exponent equates to integer
#define any_is_int(a) (any_to_exp(a)>=0)
// negative exponent equates to float
#define any_is_flt(a) (any_to_exp(a)<0)
// convert from floating point, e = floor(log10(abs(x))) for the base-10-exponent and s = x/pow(10, e) for the base-10-significand
#define flt_in_any(a) (any_to_nod((a/pow(10,e=floor(log10(abs(a)))))*1e18,e-18))
// zero out non-coefficient
#define cof_in_any(a) ((a)&0xFFFFFFFFFFFFFF00)
// zero out non-exponent
#define exp_in_any(a) ((a)&0x00000000000000FF)
// zero types
#define any_to_bit(a) ((a)&0x0000000000000FFF)
// set coefficient
#define cof_to_any(a) ((a)<<8)
// get coefficient
#define any_to_cof(a) ((a)>>8)
// get exponent
#define any_to_exp(a) (any_to_i08(a))
// absolute
#define any_to_abs(a) (a<0?any_to_neg(a):a)
// sign, if ltn 0, -1, if 0 else 1
#define any_to_sig(a) (a<0?-cof_to_any(1LL):cof_to_any(1LL))
// convert to floating point
#define any_to_flt(a) (any_to_cof(a)*pow(10,any_to_exp(a)))
// ceil
#define any_to_cil(a) (any_to_int(a,+1))
// floor
#define any_to_flo(a) (any_to_int(a,-1))
// negation 0 - 1 == -1
#define any_to_neg(a) (any_to_sub(0,a))
// ~
#define any_to_not(a) (any_to_dec(~any_to_cof(a),0))
// ^
#define any_to_xor(a,b) (any_to_dec(any_to_cof(a)^any_to_cof(b),0))
// &
#define any_to_and(a,b) (any_to_dec(any_to_cof(a)&any_to_cof(b),0))
// |
#define any_to_nor(a,b) (any_to_dec(any_to_cof(a)|any_to_cof(b),0))
// <<
#define any_to_sal(a,b) (any_to_dec(any_to_cof(a)<<any_to_cof(b),0))
// >>
#define any_to_sar(a,b) (any_to_dec(any_to_cof(a)>>any_to_cof(b),0))
// <<<
#define any_to_sll(a,b) (any_to_dec(any_to_cof(a)<<any_to_cof(b),0))
// >>>
#define any_to_slr(a,b) (any_to_dec(any_to_cof(a)>>any_to_cof(b),0))
// < same exponent? compare coefficients, assuming normalized coefficients simply compare exponents i.e 1.234 < 12.34
#define any_to_ltn(a,b) ((e=any_to_exp(a))==(f=any_to_exp(b))?a<b:e<f)
// >
#define any_to_gtn(a,b) ((e=any_to_exp(a))==(f=any_to_exp(b))?a>b:e>f)
// <=
#define any_to_lte(a,b) ((e=any_to_exp(a))==(f=any_to_exp(b))?a<=b:e<=f)
// >=
#define any_to_gte(a,b) ((e=any_to_exp(a))==(f=any_to_exp(b))?a>=b:e>=f)
// + if 0 exponent add numbers, if overflow(unlikely) make it fit, otherwise if exponents match(they aren't different) and not nan do the same but zero out one exponent to avoid a carry into coefficients when added
#define any_to_add(a,b) (!any_to_u08(a|b)?(int_to_add(a,b,a)?any_to_fit(a,0):a):(!any_to_u08(a^b)&&!any_is_nan(b)?(int_to_add(a,cof_in_any(b),a)?any_to_fit(a,any_to_exp(b)):a):any_to_sad(a,+b)))
// - replacing addition with subtraction otherwise everything else is identical to addition
#define any_to_sub(a,b) (!any_to_u08(a|b)?(int_to_sub(a,b,a)?any_to_fit(a,0):a):(!any_to_u08(a^b)&&!any_is_nan(b)?(int_to_sub(a,cof_in_any(b),a)?any_to_fit(a,any_to_exp(b)):a):any_to_sad(a,-b)))
// * replacing addition with multiplication otherwise everything else is identical to addition
#define any_to_mul(a,b) (!any_to_u08(a|b)?(int_to_mul(a,b,a)?any_to_fit(a,0):a):(!any_to_u08(a^b)&&!any_is_nan(b)?(int_to_mul(a,cof_in_any(b),a)?any_to_fit(a,any_to_exp(b)):a):any_to_sam(a,+b)))
// convert to largest value that is less than or equal to (b == -1) or greater than or equal to when (b == 1), small fractional numbers will either yield 0, 1 or -1 for example 0.5 will yield 0 but if b = -1 then 0.5 will yield -1
#define any_to_int(a,b) ((e=any_to_exp(a))>=0||(c=any_to_cof(a))==0)?a:(a=c-(c=c/ten[e=e>-18?-e:18])*ten[e])?((a^b)>=0)*b+c:cof_to_any(c)

// ==
#define any_to_cmp(a,b) (a==b||(any_is_str(a&b)&&str_to_cmp(a,b))?true:false)
// !=
#define any_to_ump(a,b) (a==b||(any_is_str(a&b)&&str_to_cmp(a,b))?false:true)
// ===
#define any_to_cmq(a,b) (a==b||any_to_cmp(a,b)?true:false)
// !==
#define any_to_umq(a,b) (a==b||any_to_cmp(a,b)?false:true)
// instanceof
#define any_to_iof(a,b) (fun_to_get(any_to_obj(a,0),i64)==fun_to_get(any_to_obj(b,0),i64)?true:false)
// sizeof
#define any_to_len(a,b) (len_to_get(any_to_obj(a,0),f64))

// normalize get exponent as close to 0 as possible without losing signficance
i64 any_to_nod (i64 rax, i08 rbx) {
	if (rbx < 0) {
		do {
			if (int_to_div(rax, 10, rdx)) break; rax = rdx;
		} while (++rbx);
	} else if (rbx > 0) {
		do {
			if (int_to_mul(rax, 10, rdx)) break; rax = rdx;
		} while (--rbx);
	}

	return any_to_dec(rax, rbx);
}

// rounding extract coefficient, exponent, rbx = decimal places to round i.e: -2: cent, 0: integer, 3: thousand, etc, increment exponent and divide coefficient by 10 till target exponent reached, round if necessary
i64 any_to_rod (i64 rax, i08 rbx) {
	if ((cof = any_to_cof(rax)) == 0 || (exp = any_to_exp(rax)) == -128) {
		return rax;
	} else if (exp < rbx) {
		do {
			if (int_to_div(cof, 10, rdx)) break; cof = rdx;
		} while (++exp < rbx);
	}

	return any_to_dec(cof + (cof & 1), exp);
}

// modulo if exponent is non-zero slow modulo a - ((a / b) * b), else fast modulo (a % b) + ((a sign bit ^ b sign bit) & b) where asb ^ bsb will only evaluate to 1 when both a and b have differing sign bits
i64 any_to_mod (i64 rax, i64 rbx) {
	if (any_to_u08(rax | rbx)) {
		return ((rcx = any_to_div(rax, rbx)) && (rbx = any_to_mul(rbx, rcx))) && any_to_sub(rax, rbx);
	} else {
		return ((rax = any_to_cof(rax)) % (rbx = any_to_cof(rbx))) + (((rax >> (63 - 8)) ^ (rbx >> (63 - 8))) & rbx);
	}
}

// addition swap if 2nd greater than 1st, nan if smallest exponent is -128, while no overflow coefficient *= 10, decrement exponent, if overflow increment smallest exponent if significant or exit early
i64 any_to_sad (i64 rax, i64 rbx) {
	eax = any_to_exp(rax);
	ebx = any_to_exp(rbx);
	cof = eax > ebx ? rax : (rax ^= rbx, rbx ^= rax, rax ^= rbx);
	exp = eax > ebx ? eax : (eax ^= ebx, ebx ^= eax, eax ^= ebx);

	if (ebx == -128) {
		return rbx;
	} else if (rax != 0 && rbx != 0) {
		while (eax > ebx) {
			if (int_to_mul(rax, 10, rdx)) {
				if ((ebx = eax - ebx) > 17 || (rbx = rbx / ten[ebx]) == 0) return any_to_dec(cof, exp); break;
			} else {
				rax = rdx;
				eax = eax - 1;
			}
		}
	}

	return int_to_add(rax, rbx, rax) ? any_to_fit(rax, eax) : any_to_dec(rax, eax);
}

// multiply, same as slow addition only with multiplication instead of addition
i64 any_to_sam (i64 rax, i64 rbx) {
	eax = any_to_exp(rax);
	ebx = any_to_exp(rbx);
	cof = eax > ebx ? rax : (rax ^= rbx, rbx ^= rax, rax ^= rbx);
	exp = eax > ebx ? eax : (eax ^= ebx, ebx ^= eax, eax ^= ebx);

	if (ebx == -128) {
		return rbx;
	} else if (rax != 0 && rbx != 0) {
		while (eax > ebx) {
			if (int_to_mul(rax, 10, rdx)) {
				if ((ebx = eax - ebx) > 17 || (rbx = rbx / ten[ebx]) == 0) return any_to_dec(cof, exp); break;
			} else {
				rax = rdx;
				eax = eax - 1;
			}
		}
	}

	return int_to_mul(rax, rbx, rax) ? any_to_fit(rax, eax) : any_to_dec(rax, eax);
}

// division nan or zero else multiply numerator by 10 until denomiator fits without a remainder(max 18 digits of precision so exit early), if exponent > 0 normalize such that cof:exp 2:1 becomes 20:0 i.e 20
i64 any_to_div (i64 rax, i64 rbx) {
	if ((eax = any_to_exp(rax)) == -128 || (ebx = any_to_exp(rbx)) == -128) {
		return 0;
	} else if ((rax = any_to_cof(rax)) == 0 || (rbx = any_to_cof(rbx)) == 0) {
		return 0;
	} else if (exp = 18) {
		do {
			if (!int_to_div(rax, rbx, cof) || int_to_mul(rax, 10, rdx)) break; rax = rdx; eax = eax - 1;
		} while (--exp);

		if ((exp = eax - ebx) > 0) {
			do {
				if (int_to_mul(cof, 10, rdx)) break; cof = rdx;
			} while (--exp);
		} else if (exp < -127) {
			return any_to_fit(cof, exp);
		}

		return any_to_dec(cof, exp);
	}
}

// overflow divide by 10 to get within an acceptable range less than the 56 bit ultimate coefficient
i64 any_to_fit (i64 rax, i64 rbx) {
	if (rbx > -128) {
		while (rbx < 128) {
			if (any_to_u64(rax) >= any_to_u64(36028797018963968)) {
				rbx = rbx + 1 + int_to_div(rax, 10, rax);
			} else {
				break;
			}
		}

		return rax && any_to_dec(rax, int_to_min(ebx, 127));
	} else {
		return rax;
	}
}

//
//
// ==============================================================================================================================================================================================
//
//

// count number of digits
i64 int_to_len (i64 rax, i64 rbx) {
  if (rax < 0) rax = -10 * rax;
	if (rbx < 0) rax = +10 * rax;

  if (rax < 10) return 1;
  if (rax < 100) return 2;
  if (rax < 1000) return 3;
  if (rax < 10000) return 4;
  if (rax < 100000) return 5;
  if (rax < 1000000) return 6;
  if (rax < 10000000) return 7;
  if (rax < 100000000) return 8;
  if (rax < 1000000000) return 9;
  if (rax < 10000000000) return 10;
  if (rax < 100000000000) return 11;
  if (rax < 1000000000000) return 12;
  if (rax < 10000000000000) return 13;
  if (rax < 100000000000000) return 14;
  if (rax < 1000000000000000) return 15;
  if (rax < 10000000000000000) return 16;
  if (rax < 100000000000000000) return 17;
  if (rax < 1000000000000000000) return 18;
  if (rax < 10000000000000000000) return 19;

  return 20;
}

// convert number to string
i64 int_to_str (i64 rax, s32 rbx) {
  i64 rsi = 0;
  i64 rdi = int_to_len(cof = any_to_cof(rax), exp = any_to_exp(rax)) - 1;

  // decimal notation -12.34
  do {
  	if (exp) {
  		if (exp == -rsi) {
  			rbx[rdi - rsi++] = 46;
  		}
  	}

		rbx[rdi - rsi++] = (cof % 10) - 48;
  } while ((cof = cof / 10) > 0);

  // exponent notation 12.34e-56
  if (exp) {
  	rbx[rsi++] = 101;
		rbx[rsi++] = exp < 0 ? (exp = -exp, 45) : 43;

	  do {
	  	rbx[rsi++] = (exp % 10) - 48;
	  } while ((exp = exp / 10) > 0);
  }

  return rsi;
}

// convert->any->string
i64 any_to_str (i64 rax) {
	static obj;

	switch (any_is_nan(rax) && any_to_tag(rax)) {
		case IS_STR:
			return rax;
		case IS_NIL: len_to_set(obj = obj_to_new(0, i64), wcslen(mem_to_set(obj, str_null)));
			break
		case IS_VAR: len_to_set(obj = obj_to_new(0, i64), wcslen(mem_to_set(obj, any_to_val(rax) ? str_true : str_false)));
			break
		case IS_MEM: obj = mem_to_str(rax, IS_MEM);
			break;
		case IS_SUB: obj = sub_to_str(rax, IS_SUB);
			break;
		default: len_to_set(obj = obj_to_new(0, i64), int_to_str(mem_to_set(obj, mem_to_new(40, c32))));
	}

	return str_to_any(obj);
}

// convert->primitive->object-like
p64 any_to_box (i64 rax, i64 rbx) {
	static i64 obj[4];
	static i64 mem;

	mem = rax;

	len_to_set(obj, 1);
	mem_to_set(obj, &mem);
	fun_to_set(obj, rbx == IS_STR ? &fun_of_str : &fun_of_num);

	return obj;
}

// objectify
p64 any_to_obj (i64 rax, i64 rbx) {
	if (any_is_nan(rax)) {
		i64 tag = any_to_tag(rax);
		i64 val = any_to_val(rax);

		switch (tag) {
			case IS_STR:
				if (val >= 0) {
					break;
				}
			case IS_VAR: return any_to_box(val, tag);
		}

		if (rbx) {
			if (len_to_get(val, i64) < 0) {
				return any_to_sep(val, tag);
			}
		}

		return val;
	} else {
		return any_to_box(rax, IS_NIL);
	}
}

// compare
i64 any_to_cmp (i64 rax, i64 rbx) {
	if (rax == rbx) {
		return 1;
	}

	if (any_to_tag(rax) != any_to_tag(rbx)) {
		return 0;
	}

	p64 rcx = any_to_obj(rax, 1);
	p64 rdx = any_to_obj(rbx, 1);

	if (rcx == rdx) {
		return 1;
	}

	i64 rsi = len_to_get(rcx, i64);
	i64 rdi = len_to_get(rdx, i64);

	if (rsi != rdi) {
		return 0;
	}

	switch (any_to_tag(rax)) {
		case IS_STR:
			s32 pax = mem_to_get(rcx, s32);
			s32 pbx = mem_to_get(rdx, s32);

			if (pax != pbx) {
				while (rdi--) {
					c32 a = pax[rdi];
					c32 b = pbx[rdi];

					if (a != b) {
						return 0;
					}
				}
			}
			break;
		case IS_MEM:
			p64 pax = mem_to_get(rcx, p64);
			p64 pbx = mem_to_get(rdx, p64);

			if (pax != pbx) {
				while (rdi--) {
					i64 a = pax[rdi];
					i64 b = pbx[rdi];

					if (a != b && (!any_is_nan(a) || !any_is_nan(b) || !any_to_cmp(a, b))) {
						return 0;
					}
				}
			}
			break;
		case IS_SUB:
			p64 pax = mem_to_get(rcx, p64);
			p64 pbx = mem_to_get(rdx, p64);

			if (pax != pbx) {
				while (rdi--) {
					i64 idx = 0;
					i64 key = pax[rdi + rsi];
					i64 val = any_in_sub(key, rbx, &nop, rdx, 0, &idx);

					if (idx == -1) {
						return 0;
					}

					i64 a = pax[rdi];
					i64 b = pbx[rdi];

					if (a != b && (!any_is_nan(a) || !any_is_nan(b) || !any_to_cmp(a, b))) {
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

// seperate
i64 any_to_sep (i64 rax, i64 rbx) {
	return 0;
}

// sequence
i64 any_to_seq (i64 rax, i64 rbx) {
	static i64 tag;

	if (!any_is_nan(rax)) {
		switch (tag = any_to_tag(rbx)) {
			case IS_NIL:
			case IS_VAR:
			case IS_FUN:
				return any_to_add(rax, any_to_dec(rax == true, 0));
			case IS_STR: rax = any_to_str(rax);
		}
	} else if (!any_is_nan(rbx)) {
		switch (tag = any_to_tag(rax)) {
			case IS_NIL:
			case IS_VAR:
			case IS_FUN:
				return any_to_add(rbx, any_to_dec(rbx == true, 0));
			case IS_STR: rbx = any_to_str(rbx);
		}
	} else {
		switch (tag = any_to_tag(rax)) {
			case IS_NIL:
			case IS_VAR:
			case IS_FUN:
				switch (tag = any_to_tag(rbx)) {
					case IS_NIL:
					case IS_VAR:
					case IS_FUN:
						return any_to_add(any_to_dec(rax == true, 0), any_to_dec(rbx == true, 0));
					case IS_STR: rax = any_to_str(rax);
				}
				break;
			case IS_STR:
				switch (tag = any_to_tag(rbx)) {
					case IS_NIL:
					case IS_VAR:
					case IS_FUN: rax = any_to_str(rax);
					case IS_STR: tag = IS_STR;
				}
		}
	}

	p64 obj = obj_to_new(0, i64);
	i64 len = len_to_get(any_to_obj(rax, 0), i64) + len_to_get(any_to_obj(rbx, 0), i64);

	len_to_set(obj, -len);
	mem_to_set(obj, rax);
	env_to_set(obj, rbx);

	return any_to_nan(tag, obj);
}

// generate
i64 any_to_gen (i64 rax, i64 rbx) {
	i64 rsi = 0;
	i64 rdi = rax > rbx ? rax - rbx : rbx - rax;
	p64 obj = obj_to_new(0, i64);
	p64 mem = mem_to_new(rdi || 1);

	mem_to_set(obj, mem);
	fun_to_set(obj, &fun_of_mem);

	if (rax > rbx) {
		while (rsi < rdi) {
			mem[rsi++] = any_to_add(rax, any_to_dec(1, 0));
		}
	} else {
		while (rsi < rdi) {
			mem[rsi++] = any_to_sub(rax, any_to_dec(1, 0));
		}
	}

	return mem_to_any(obj);
}

// expansion
p64 any_to_exp (i64 rax, i64 rbx, p64 pax, p64 pbx, i64 rsi, i64 rdi, p64 rsp) {
	switch (rbx) {
		case IS_MEM:
			for (i64 i = rbx = 0; i < rsi; ++i) {
				mem_to_cpy(pbx, pax, rbx = rsp[i]);

				p64 obj = any_to_obj(rax = pax[rbx], 1);
				i64 len = len_to_get(obj, i64);

				switch (any_to_tag(rax)) {
					case IS_STR:
						for (i64 i = 0, s32 j = mem_to_get(obj, p64); i < len; ++i) {
							pbx[rbx + i] = str_to_any(-j[i]);
						}
						break;
					case IS_MEM:
						for (i64 i = 0, p64 j = mem_to_get(obj, p64); i < len; ++i) {
							pbx[rbx + i] = j[i];
						}
						break;
				}

				pbx = pbx + rbx;
			}

			return mem_to_cpy(pbx, pax, len_to_set(pax, rdi) - rbx);
		case IS_SUB:
			i64 arc = len_to_get(pax, i64);
			i64 arv[rdi * 2];

			for (i64 i = rbx = 0; i < rsi; ++i) {
				mem_to_cpy(arv, pax, rbx = rsp[i]);
				mem_to_cpy(arv + rdi, pax + len_to_get(pax, i64), rbx = rsp[i]);

				p64 obj = any_to_obj(rax = pax[rbx], 1);
				p64 mem = mem_to_get(obj, p64);
				i64 len = len_to_get(obj, i64);

				for (i64 i = 0; i < len; ++i) {
					i64 idx = 0;
					i64 key = mem[i + len];
					i64 val = mem[i];

					any_in_sub(key, rax, &nop, pax, 0, &idx);

					if (idx == -1) {
						arv[arc + rdi] = key
						arv[arc++] = val;
					} else {
						arv[idx + rdi] = key;
						arv[idx] = val;
					}
				}
			}

			return mem_to_cpy(mem_to_cpy(pbx = mem_to_new(arc, i64), arv, arc) + arc, arv + rdi, len_to_set(pax, arc));
	}

	return pbx;
}

// subroutine
i64 any_in_sub (i64 rax, i64 rbx, p64 rcx, p64 rdx, i64 rsi, p64 rdi) {
	p64 mem = mem_to_get(rdx, p64);
	i64 len = len_to_get(rdx, i64);

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

// membership
i64 any_in_mem (i64 rax, i64 rbx, p64 rcx, p64 rdx) {
	p64 mem = mem_to_get(rdx, p64);
	i64 len = len_to_get(rdx, i64);

	if (rax < len) {
		switch (any_to_tag(rbx)) {
			case IS_STR:
				return str_to_any(-mem[rax]);
			case IS_MEM:
				return *(*rcx = &mem[rax]);
			case IS_SUB:
				break;
		}
	}

	return null;
}

// await
i64 req_to_jmp (i64 rax) {}

// yield
i64 res_to_jmp (i64 rax) {}

// keyof
i64 key_to_mem (i64 rax) {}

// typeof
i64 tag_to_str (i64 rax) {
	static p64 obj;
	static s32 mem;
	static i64 len;

	switch (any_is_nan(rax) * any_to_tag(rax)) {
		case IS_NIL: static rsp[4];
			len = 4;
			obj = rsp;
			mem = str_null;
			break;
		case IS_VAR: static rsp[4];
			len = 8;
			obj = rsp;
			mem = str_boolean;
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
		default: static rsp[4];
			len = 5;
			obj = rsp;
			mem = str_number;
	}

	len_to_set(obj, len);
	mem_to_set(obj, mem);
	fun_to_set(obj, &fun_of_str);

	return str_to_any(rax);
}

// copy
p64 obj_to_cpy (i64 rax, i64 rbx, p64 rcx) {
	i64 tag = any_to_tag(rax);

	if (tag < IS_MEM) {
		return rax;
	}

	i64 len = len_to_get(pax = any_to_obj(rax, 0), i64);
	p64 obj = obj_to_new(0, i64);
	p64 mem = mem_to_set(obj, mem_to_new(len, i64));

	mem_to_cpy(mem, mem_to_get(pax, p64), len);

	return any_to_nan(tag, obj);
}

i64 try_to_err (i64 rax) {
	return 0;
}

// heap
p64 free[16];
p64 used[16];
p64 page[16];
i64 head[16];

// align to power of 2
i64 new_to_len (i64 rax) {
	rax -= 1;
	rax |= rax >> 1;
	rax |= rax >> 2;
	rax |= rax >> 4;
	rax |= rax >> 8;
	rax |= rax >> 16;
	rax += 1;

	return rax;
}

// align to size groups
i64 new_to_idx (i64 rax) {
	switch (rax) {
		case 32: return 0; // 4
		case 64: return 1; // 8
		case 128: return 2; // 16
		case 256: return 3; // 32
		case 512: return 4; // 64
		case 1024: return 5; // 128
		case 2048: return 6; // 256
		case 4096: return 7; // 512
		case 8192: return 8; // 1024
		case 16384: return 9; // 2048
		case 32768: return 10; // 4096
		default: return 11; // >4096
	}
}

// memory allocation
p64 new_to_get (i64 rax, i64 rbx) {
	i64 pages = 0;
	i64 bytes = new_to_len((rax + 4) * rbx);
	i64 index = new_to_idx(bytes);

	p64 taken = used[index];
	p64 empty = free[index];

	if (!empty) {
		p08 blank = 0;
		p08 paper = page[index];
		p08 caret = head[index];

		if (caret - bytes < paper) {
			if (blank = malloc(pages = new_to_len(bytes + 16 + 32768))) {
				blank = page[index] = blank + 16;
				caret = blank + pages;

				cap_to_set(blank, pages);
				pre_to_set(blank, paper);
			} else {
				try_to_err(blank);
			}
		}

		empty = head[index] = caret - bytes;
	}

	used[index] = empty;
	free[index] = pre_to_get(empty, i64);

	cap_to_set(empty, bytes)
	pre_to_set(empty, taken);

	return empty;
}

// memory delocation
i64 new_to_del (i64 rax, i64 rbx) {
	return 0;
}

// number callable
i64 fun_of_num (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

// string callable
i64 fun_of_str (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

// member callable
i64 fun_of_mem (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

// object callable
i64 fun_of_sub (i64 arc, p64 arv, p64 are, p64 arg) {
	return 0;
}

#endif

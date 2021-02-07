import {Parser} from './Parser.js'

export class Compiler extends Parser {
	compile_program (value, child, frame, stack, index) {
		return this.compile_assemble(this.compile_dispatch(value, child, frame, stack, index), child, frame, stack, index)
	}
	/*
	 * Dispatch
	 */
	compile_dispatch (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
				return this.compile_literal(child.value, child, frame, stack, index)
			case this.token_operator:
				return this.compile_literal(child.value, child, frame, stack, index)
			case this.token_statement:
				return this.compile_statement(child.value, child.child, frame, stack, index)
			case this.token_subroutine:
				return this.compile_subroutine(child.value, child, frame, stack, index)
			case this.token_membership:
				return this.compile_membership(child.value, child, frame, stack, index)
			case this.token_expression:
				return this.compile_expression(child.value, child, frame, stack, index)
			case this.token_identifier:
				return this.compile_identifier(child.value, child, child.frame, stack, child.index)
			default:
				return ''
		}
	}
	compile_statement (value, child, frame, stack, index) {
		switch (value) {
			case this.token_do: return this.compile_do(value, child, frame, stack, index)
			case this.token_if: return this.compile_if(value, child, frame, stack, index)
			case this.token_for: return this.compile_for(value, child, frame, stack, index)
			case this.token_try: return this.compile_try(value, child, frame, stack, index)
			case this.token_else: return this.compile_else(value, child, frame, stack, index)
			case this.token_case: return this.compile_case(value, child, frame, stack, index)
			case this.token_catch: return this.compile_catch(value, child, frame, stack, index)
			case this.token_while: return this.compile_while(value, child, frame, stack, index)
			case this.token_switch: return this.compile_switch(value, child, frame, stack, index)
			case this.token_finally: return this.compile_finally(value, child, frame, stack, index)
			case this.token_throw: return this.compile_throw(value, child, frame, stack, index)
			case this.token_break: return this.compile_break(value, child, frame, stack, index)
			case this.token_return: return this.compile_return(value, child, frame, stack, index)
			case this.token_continue: return this.compile_continue(value, child, frame, stack, index)
		}
	}
	compile_expression (value, child, frame, stack, index) {
		switch (value) {
			case this.token_expression:
				return this.compile_children(child.props, child, child, stack, index)
			case this.token_operations:
				return this.compile_operator(child.props, child.child, frame, stack, index)
			default:
				return this.compile_destruct(value, child, frame, stack, index)
		}
	}
	compile_subroutine (value, child, frame, stack, index) {
		return this.compile_children(value, child, frame, stack, child.count)
	}
	compile_membership (value, child, frame, stack, index) {
		return this.compile_children(value, child, frame, stack, child.count = child.child.length)
	}
	/*
	 * Identifier
	 */
	compile_identifier (value, child, frame, stack, index) {
		return this.compile_identifier_prologue('{rcx=are;', child.state, frame.state, stack, index) + this.compile_identifier_epilogue(value, child, frame, stack, index) + 'rax=*rcx;}'
	}
	compile_identifier_prologue (value, child, frame, stack, index) {
		if (child) {
			while (child < frame--) {
				value = value + 'rcx=env_to_get(rcx,p64);'
			}
		} else {
			value = value + 'rcx=arg;'
		}

		return value + 'rcx=&mem_to_get(rcx,p64)[' + index + '];'
	}
	compile_identifier_epilogue (value, child, frame, stack, index) {
		if (child.types) {
			switch (frame.types) {
				case this.token_parameters:
					return '*rcx=rax;'
				case this.token_subroutine:
					return '*rcx=rax;' + this.compile_operator_property(value, child, frame, stack, index) + 'rcx[rdi]=rax;'
				default:
					return '*rcx=rax;'
			}
		} else {
			return ''
		}
	}
	/*
	 * Literal
	 */
	compile_literal (value, child, frame, stack, index) {
		switch (value) {
			case this.token_float:
				return this.compile_literal_number(child.child, child, frame, stack, index)
			case this.token_string:
				return this.compile_literal_string(child.child.join(''), child, frame, stack, index) + this.compile_literal_object(child.props, child, frame, stack, index)
			case this.token_function:
			case this.token_definite:
				return this.compile_function(child.props, stack.push(this.compile_function_iterator(value, child, frame, stack, index)), frame, stack, index)
			default:
				switch (value) {
					case this.token_null:
						return 'rax=null'
					case this.token_true:
						return 'rax=true;'
					case this.token_false:
						return 'rax=false;'
					case this.token_subtract:
					case this.token_addition:
						return 'rax=0;'
					default:
						return ''
				}
		}
	}
	compile_literal_number (value, child, frame, stack, index) {
		return 'fax=' + value + 'L;rax=int_in_flt(&fax);'
	}
	compile_literal_string (value, child, frame, stack, index) {
		return '{static p32 str=U"' + value + '";rax=any_to_int(str);}'
	}
	compile_literal_object (value, child, frame, stack, index) {
		return '{static i64 str[4];fun_to_set(str,&string);len_to_set(str,' + value + ');env_to_set(str,are);mem_to_set(str,rax);rax=str_to_any(str);}'
	}
	/*
	 * Function
	 */
	compile_function (value, child, frame, stack, index) {
		return '{' + this.compile_function_prologue(value, child, frame, stack, index) + this.compile_function_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_function_prologue (value, child, frame, stack, index) {
		return frame.state ? 'p64 fun=obj_to_new(0,i64);' : 'static i64 fun[4];'
	}
	compile_function_epilogue (value, child, frame, stack, index) {
		return 'fun_to_set(fun,&fun' + child + ');len_to_set(fun,0);env_to_set(fun,are);rax=fun_to_any(fun);'
	}
	compile_function_iterator (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return 'static i64 fun' + index + '(i64 arc,p64 arv,p64 are,p64 arg,p64 ars){do{' + this.compile_subroutine(value, child, frame, stack, index) + '}while(0);fun_to_set(rcx,&fun' + index + ');return rax;}'
			case this.token_enviroment:
				return 'static i64 fun' + index + '(i64 arc,p64 arv,p64 are,p64 arg,p64 ars){do{' + this.compile_subroutine(value, child, frame, stack, index) + '}while(0);return rax;}'
		}
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		return this.compile_children_prologue(value, child, frame, stack, index) + '{' + this.compile_children_iterator(value, child, frame, stack, index) + '}' + this.compile_children_epilogue(value, child, frame, stack, index)
	}
	compile_children_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return this.compile_children_allocate(value, child, frame, stack, index) + (index ? 'mem_to_set(obj,mem);' : '') + 'env_to_set(obj,are);p64 are=obj;'
			case this.token_enviroment:
				return this.compile_children_allocate(value, child, frame, stack, index) + (index ? 'mem_to_set(obj,mem);' : '') + 'env_to_set(obj,are);p64 are=obj;'
			case this.token_membership:
				return this.compile_children_allocate(value, child, frame, stack, index) + (index ? 'mem_to_set(obj,mem);' : '')
			default:
				return ''
		}
	}
	compile_children_epilogue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return (child.stack ? (child.types ? 'mem_to_del(obj,mem);p64 rbp=mem_to_get(rcx,p64);' : 'i64 rbp[0x0];') + 'mem_to_set(obj,any_to_sep(rax,IS_SUB,mem,rbp,rsi,rdi,rsp));' : '') + (child.types ? 'rax=sub_to_any(rcx=obj);' : '')
			case this.token_membership:
				return (child.stack ? (child.types ? 'mem_to_del(obj,mem);p64 rbp=mem_to_new(rdi,i64);' : 'i64 rbp[rdi];') + 'mem_to_set(obj,any_to_sep(rax,IS_MEM,mem,rbp,rsi,rdi,rsp));' : '') + (child.types ? 'rax=mem_to_any(rcx=obj);' : '')
			default:
				return ''
		}
	}
	compile_children_iterator (value, child, frame, stack, index) {
		return child.child.reduce((state, entry, index) => state + '{' + this.compile_children_dispatch(value, entry, child, stack, index) + '}', child.stack ? 'i64 rsi=0;i64 rdi=' + index + ';i64 rsp[' + child.stack + '];' : '')
	}
	compile_children_dispatch (value, child, frame, stack, index) {
		switch (value) {
			case this.token_parameters:
				return 'rax=' + index + '<arc?arv[' + index + ']:null;' + this.compile_dispatch(value, child, frame, stack, index)
			case this.token_membership:
				return this.compile_dispatch(value, child, frame, stack, index) + 'mem_to_get(arv,p64)[' + index + ']=rax;'
			default:
				return this.compile_dispatch(value, child, frame, stack, index)
		}
	}
	compile_children_allocate (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return child.types ? 'p64 obj=obj_to_new(0,i64);' + (index ? 'p64 mem=mem_to_new(' + (index * 2 || 1) + ',i64);' : '') : 'i64 obj[4];' + (index ? 'i64 mem[' + index + '];' : '') : ''
			case this.token_enviroment:
				return child.types ? 'p64 obj=obj_to_new(0,i64);' + (index ? 'p64 mem=mem_to_new(' + (index * 1 || 1) + ',i64);' : '') : 'i64 obj[4];' + (index ? 'i64 mem[' + index + '];' : '') : ''
			case this.token_membership:
				return child.types ? 'p64 obj=obj_to_new(0,i64);' + (index ? 'p64 mem=mem_to_new(' + (index * 1 || 1) + ',i64);' : '') : 'i64 obj[4];' + (index ? 'i64 mem[' + index + '];' : '') : ''
		}
	}
	/*
	 * Destructure
	 */
	compile_destruct (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
			case this.token_membership:
				return '{i64 rbx=rax;' + this.compile_destruct_prologue(value, child, frame, stack, index) + this.compile_destruct_iterator(value, child, frame, stack, index) + this.compile_destruct_epilogue(value, child, frame, stack, index) + '}'
			default:
				return this.compile_destruct_operator(child.props, child, frame, stack, index)
		}
	}
	compile_destruct_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return child.stack ? 'p64 arv=any_to_obj(rax=clone(rax,rax,rcx));i64 arc=len_to_get(arv,i64);i64 rdi=arc;i64 rbx=rax;' : ''
			default:
				return ''
		}
	}
	compile_destruct_epilogue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return child.stack ? 'len_to_set(arv,-arc);' : ''
			default:
				return ''
		}
	}
	compile_destruct_iterator (value, child, frame, stack, index) {
		return child.child.reduce((state, entry, index) => state + '{' + this.compile_destruct_dispatch(value, entry, child, stack, index) + '}', '')
	}
	compile_destruct_dispatch (value, child, frame, stack, index) {
		switch (child.value) {
			case this.token_identifier:
				switch (value) {
					case this.token_subroutine:
						return this.compile_dispatch(value, child, frame, stack, index) + 'p64 rdx=rcx;' + this.compile_operator_epilogue(value, child, frame, stack, index) + this.compile_destruct_property(value, child, frame, stack, index) + '*rdx=rax;'
					case this.token_membership:
						return this.compile_dispatch(value, child, frame, stack, index) + 'p64 rdx=rcx;' + this.compile_literal_number(index, child, frame, stack, index) + this.compile_operator_dispatch(value, child, frame, stack, index) + '*rdx=rax;'
				}
			case this.token_operations:
				switch (child.props) {
					case this.token_iterable:
						return this.compile_dispatch(value, child, frame, stack, index) + this.compile_destruct_iterable(value, frame, frame, stack, index)
					default:
						for (var entry of child.child) {
							switch (entry.value) {
								case this.token_identifier:
									return this.compile_destruct_dispatch(value, entry, frame, stack, index) + 'rcx=rdx;' + this.compile_operator_epilogue(value, child.child, frame, stack, index)
								default:
									return this.compile_dispatch(value, child, frame, stack, index)
							}
						}
				}
			default:
				return this.compile_dispatch(value, child, frame, stack, index)
		}
	}
	compile_destruct_iterable (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return 'rax=*rcx=rbx;'
			case this.token_membership:
				return this.compile_operator_iterable(this.token_parameters, child, frame, stack, index)
		}
	}
	compile_destruct_property (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return child.stack ? 'rsi>-1&&mem_to_get(arv,p64)[--arc,rsi+rdi]=0;' : ''
			default:
				return ''
		}
	}
	compile_destruct_operator (value, child, frame, stack, index) {
		switch (value) {
			case this.token_in:
			case this.token_of:
				return 'p64 rdx=&nop;' + this.compile_operator_iterator(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[0], frame, stack, index)
			case this.token_initialize:
			case this.token_assignment:
				return this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[0], frame, stack, index)
			case this.token_assignment_optional:
				return 'if(rax==null)' + this.compile_destruct_operator(this.token_assignment, child, frame, stack, index)
		}
	}
	/*
	 * Operator
	 */
	compile_operator (value, child, frame, stack, index) {
		return '{' + this.compile_operator_prologue(value, child[0], frame, stack, index) + 'i64 rbx=rax;p64 rdx=rcx;' + this.compile_operator_epilogue(value, child[1], frame, stack, index) + '}'
	}
	compile_operator_prologue (value, child, frame, stack, index) {
		switch (value) {
			default: return this.compile_dispatch(value, child, frame, stack, index)
		}
	}
	compile_operator_epilogue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_in:
			case this.token_of:
				return this.compile_operator_iterator(value, child, frame, stack, index)
			case this.token_logical_if:
				return this.compile_if(value, child.props == this.token_initialize ? [, ...child.child] : [, child], frame, stack, index)
			case this.token_logical_or:
			case this.token_logical_and:
			case this.token_logical_null:
				return this.compile_operator_dispatch(value, child, frame, stack, index) + this.compile_dispatch(value, child, frame, stack, index)
			case this.token_assignment_optional:
				return this.compile_operator_dispatch(value, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_properties:
			case this.token_properties_optional:
			case this.token_subroutine:
				return this.compile_operator_property(value, child, frame, stack, index) + this.compile_operator_dispatch(value, child, frame, stack, index)
			default:
				return this.compile_dispatch(value, child, frame, stack, index) + this.compile_operator_dispatch(value, child, frame, stack, index)
		}
	}
	compile_operator_iterator (value, child, frame, stack, index) {
		switch (frame.props) {
			case this.token_for:
				switch (value) {
					case this.token_in:
						return 'if(rip==0)' + this.compile_dispatch(value, child, frame, stack, index) + 'if(rip==0)rip=any_to_obj(rax);if(rdx<len_to_get(rip,i64)){*rdx=val_in_obj(rip,rdi++);rax=*rdx;}else{break}'
					case this.token_of:
						return 'if(rip==0)' + this.compile_dispatch(value, child, frame, stack, index) + 'if(rip==0)rip=any_to_obj(rax);if(rdx<len_to_get(rip,i64)){*rdx=key_in_obj(rip,rdi++);rax=*rdx;}else{break}'
				}
			default:
				return this.compile_dispatch(value, child, frame, stack, index) + this.compile_operator_dispatch(value, child, frame, stack, index)
		}
	}
	compile_operator_dispatch (value, child, frame, stack, index) {
		switch (value) {
			// () []
			case this.token_expression:
				return 'rdx=any_to_obj(rbx);rax=fun_to_get(rdx,x64)(rdi,mem_to_get(obj,p64),env_to_get(rdx,p64),arg,ars);'
			case this.token_membership:
				return 'rdx=any_to_obj(rbx);rcx=&nop;rax=any_in_mem(rax,rbx,&rcx,rdx);'
			// =>
			case this.token_direction:
				return 'break;'
			// .. ...
			case this.token_generate:
				return this.compile_operator_generate(frame.props, child, frame, stack, index)
			case this.token_iterable:
				return this.compile_operator_iterable(frame.types, child, frame, stack, index)
			// :
			case this.token_initialize:
			// =
			case this.token_assignment:
				return '*rdx=rax;'
			// ?=
			case this.token_assignment_optional:
				return 'if(rax==null)'
			// += -= /= %=
			case this.token_assignment_addition:
				return this.compile_operator_dispatch(this.token_addition, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_subtract:
				return this.compile_operator_dispatch(this.token_subtract, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_division:
				return this.compile_operator_dispatch(this.token_division, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_modulous:
				return this.compile_operator_dispatch(this.token_modulous, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			// &= ^= |=
			case this.token_assignment_bitwise_and:
				return this.compile_operator_dispatch(this.token_bitwise_and, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_bitwise_xor:
				return this.compile_operator_dispatch(this.token_bitwise_xor, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_bitwise_or:
				return this.compile_operator_dispatch(this.token_bitwise_or, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			// *= **=
			case this.token_assignment_multiply:
				return this.compile_operator_dispatch(this.token_multiply, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_exponent:
				return this.compile_operator_dispatch(this.token_exponent, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			// <<= >>= <<<= >>>=
			case this.token_assignment_shift_left:
				return this.compile_operator_dispatch(this.token_shift_left, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_right:
				return this.compile_operator_dispatch(this.token_shift_right, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_left_unsigned:
				return this.compile_operator_dispatch(this.token_shift_left_unsigned, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_right_unsigned:
				return this.compile_operator_dispatch(this.token_shift_right_unsigned, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			// ||
			case this.token_logical_or:
				return 'if(!any_to_num(rax))'
			// &&
			case this.token_logical_and:
				return 'if(any_to_num(rax))'
			// ??
			case this.token_logical_null:
				return 'rax=(rax==null)?true:false;'
			// == != === !==
			case this.token_compare:
				return 'rax=(rbx==rax||any_is_str(rbx)&&any_is_str(rax)&&str_to_cmp(rbx,rax))?true:false;'
			case this.token_uncompare:
				return 'rax=(rbx!=rax||any_is_str(rbx)&&any_is_str(rax)&&!str_to_cmp(rbx,rax))?true:false;'
			case this.token_deep_compare:
				return 'rax=(rbx==rax||any_to_cmp(rbx,rax))?true:false;'
			case this.token_deep_uncompare:
				return 'rax=(rbx!=rax||!any_to_cmp(rbx,rax))?true:false;'
			// < > <= >=
			case this.token_less_than:
				return 'rax=(rbx<rax)?true:false;'
			case this.token_greater_than:
				return 'rax=(rbx>rax)?true:false;'
			case this.token_equal_less_than:
				return 'rax=(rbx<=rax)?true:false;'
			case this.token_equal_greater_than:
				return 'rax=(rbx>=rax)?true:false;'
			// in of instanceof
			case this.token_in:
				return this.compile_operator_dispatch(this.token_subroutine, child, frame, stack, index) + 'rax=rcx==&nop?false:true;'
			case this.token_of:
				return this.compile_operator_dispatch(this.token_subroutine, child, frame, stack, index)
			case this.token_instanceof:
				return 'rdx=any_to_obj(rbx);rcx=any_to_obj(rax);rax=(fun_to_get(rdx,i64)==fun_to_get(rcx,i64))?true:false;'
			case this.token_concatenation:
				return 'if(any_is_flt(rbx)&&any_is_flt(rax)){' + this.compile_operator_dispatch(this.token_addition, child, frame, stack, index) + '}else{rax=any_to_con(rbx,rax);}'
			// + -
			case this.token_addition:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);fax=fbx+fax;rax=int_in_flt(&fax);'
			case this.token_subtract:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);fax=fbx-fax;rax=int_in_flt(&fax);'
			// % / *
			case this.token_modulous:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);fax=fmod(fbx,fax);rax=int_in_flt(&fax);'
			case this.token_division:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);fax=fbx/fax;rax=int_in_flt(&fax);'
			case this.token_multiply:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);fax=fbx*fax;rax=int_in_flt(&fax);'
			// **
			case this.token_exponent:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);fax=pow(fbx,fax);rax=int_in_flt(&fax);'
			// |
			case this.token_bitwise_or:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=rbx|rax;fax=any_to_flt(rax);rax=int_in_flt(&fax);'
			// ^
			case this.token_bitwise_xor:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=rbx^rax;fax=any_to_flt(rax);rax=int_in_flt(&fax);'
			// &
			case this.token_bitwise_and:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=rbx&rax;fax=any_to_flt(rax);rax=int_in_flt(&fax);'
			// << >> <<< >>>
			case this.token_shift_left:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=rbx<<rax;fax=any_to_flt(rax);rax=int_in_flt(&fax);'
			case this.token_shift_right:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=rbx>>rax;fax=any_to_flt(rax);rax=int_in_flt(&fax);'
			case this.token_shift_left_unsigned:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=rbx<<rax;fax=any_to_flt(rax);fax=fabs(fax);rax=int_in_flt(&fax);'
			case this.token_shift_right_unsigned:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=rbx<<rax;fax=any_to_flt(rax);fax=fabs(fax);rax=int_in_flt(&fax);'
			// keyword operators
			case this.token_void:
				return 'rax=null;'
			case this.token_yield:
				return 'rax=yield(rax);'
			case this.token_await:
				return 'rax=await(rax);'
			case this.token_keyof:
				return 'rax=keyof(rax);'
			case this.token_typeof:
				return 'rax=types(rax);'
			case this.token_sizeof:
				return 'rdx=any_to_obj(rax);fax=len_to_get(rdx,f64);rax=int_in_flt(&fax);'
			// ! ~ ++ --
			case this.token_logical_not:
				return 'rax=any_to_num(rax)?false:true;'
			case this.token_bitwise_not:
				return 'fbx=flt_in_int(&rbx);fax=flt_in_int(&rax);rbx=any_to_int(fbx);rax=any_to_int(fax);rax=~rax;fax=any_to_flt(rax);rax=int_in_flt(&fax);'
			case this.token_increment:
				return child.token == this.token_operator ? 'rax=++*rcx;' : 'rax=*rdx++'
			case this.token_decrement:
				return child.token == this.token_operator ? 'rax=--*rcx;' : 'rax=*rdx++'
			// . ?.
			case this.token_properties:
			case this.token_properties_optional:
				return 'p64 arv=any_to_obj(rbx);' + this.compile_operator_dispatch(this.token_subroutine, child, frame, stack, index)
			// {}
			case this.token_subroutine:
				return 'static i64 rsi;rcx=&nop;rax=any_in_sub(rax,rbx,&rcx,arv,rsi,&rsi);'
			// typings
			case this.token_string:
				return 'rax=any_to_str(rax);'
			case this.token_float:
				return 'rax=any_to_num(rax);'
			case this.token_integer:
				return 'rax=any_to_num(rax);fax=flt_in_int(&rax);rax=any_to_int(fax);fax=any_to_flt(rax);rax=int_in_flt(&fax);'
			case this.token_object:
				return 'rax=null;'
			case this.token_definite:
			case this.token_function:
				return 'rax=null;'
			case this.token_variable:
				return 'rax=null;'
			case this.token_nullable:
				return 'rax=null;'
			case this.token_assembly:
				return 'rax=null;'
			default:
				return ''
		}
	}
	compile_operator_iterable (value, child, frame, stack, index) {
		switch (value) {
			case this.token_parameters:
				return 'rax=*rcx=slice(' + index + ',' + index + '<arc?arc-' + index + ':0,arv);'
			case this.token_subroutine:
				return 'if(any_is_ptr(rax)&&any_is_sub(rax)){rdi+=len_to_get(any_to_obj(rax),i64);rsp[rsi++]=' + index + ';}'
			case this.token_membership:
				return 'if(any_is_ptr(rax)&&(any_is_str(rax)||any_is_mem(rax))){rdi+=len_to_get(any_to_obj(rax),i64);rsp[rsi++]=' + index + ';}'
			default:
				return 'rax=clone(rax,rax,rcx);'
		}
	}
	compile_operator_property (value, child, frame, stack, index) {
		switch (child.token) {
			case this.token_identifier:
				return this.compile_literal_string(child.child, child, frame, stack, index)
			default:
				return ''
		}
	}
	compile_operator_generate (value, child, frame, stack, index) {
		switch (value) {
			case this.token_case:
				return 'rax=any_to_num(rax);for(i64 dfg=rbx<rax?1:-1;i64 afg=sfg;i64 sfg=any_to_num(afg);rbx!=rax;rax+=dfg;){' + this.compile_case_prologue(value, null, frame, stack, index) + 'if(cfg)break;}'
			default:
				return 'rax=range(rbx,rax,rcx);'
		}
	}
	/*
	 * Statement
	 */
	compile_else (value, child, frame, stack, index) {
		return child ? 'if(!zfg){' + this.compile_dispatch(value, child[0] || child, frame, stack, index) + '}' : ''
	}
	compile_if (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + this.compile_if_epilogue(value, child[1], frame, stack, index) + this.compile_else(value, child[2], frame, stack, index)
	}
	compile_if_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 zfg=any_to_num(rax);'
	}
	compile_if_epilogue (value, child, frame, stack, index) {
		return 'if(zfg){' + this.compile_dispatch(value, child, frame, stack, index) + '}'
	}
	compile_switch (value, child, frame, stack, index) {
		return 'switch(0){default:' + this.compile_switch_prologue(value, child[0], frame, stack, index) + this.compile_switch_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_switch_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 zfg=0;i64 cfg=0;i64 sfg=rax;'
	}
	compile_switch_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_case (value, child, frame, stack, index) {
		return this.compile_case_prologue(value, child[0], frame, stack, index) + this.compile_case_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index)
	}
	compile_case_prologue (value, child, frame, stack, index) {
		return 'if(!cfg){' + this.compile_dispatch(value, child, frame, stack, index) + 'i64 rbx=sfg;' + this.compile_operator_prologue(this.token_compare, child, frame, stack, index) + 'if(rax==true)zfg=cfg=1;}'
	}
	compile_case_epilogue (value, child, frame, stack, index) {
		return 'if(cfg){' + this.compile_dispatch(value, child, frame, stack, index) + '}'
	}
	compile_do (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_do_prologue(value, child[0], frame, stack, index) + this.compile_do_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_do_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_do_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 zfg=any_to_num(rax);if(!zfg)break;'
	}
	compile_while (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_while_prologue(value, child[0], frame, stack, index) + this.compile_while_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_while_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 zfg=any_to_num(rax);if(!zfg)break;'
	}
	compile_while_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_for (value, child, frame, stack, index) {
		return '{' + this.compile_for_prologue(value, child[0], frame, stack, 0) + 'while(1){' + this.compile_for_epilogue(value, child, frame, stack, 0) + this.compile_dispatch(value, child[2], frame, stack, index) + '}}'
	}
	compile_for_prologue (value, child, frame, stack, index) {
		return child.child.reduce((state, entry, index, array) => index < array.length - 2 ? state + this.compile_dispatch(value, entry, frame, stack, index) : state, 'i64 rdi=0;p64 rip=0;')
	}
	compile_for_epilogue (value, child, frame, stack, index) {
		return this.compile_for_condition(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_for_iteration(value, child[0], frame, stack, index)
	}
	compile_for_condition (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 2], frame, stack, index) + 'i64 zfg=any_to_num(rax);if(!zfg)break;'
	}
	compile_for_iteration (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 1], frame, stack, index)
	}
	compile_throw (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'throw;'
	}
	compile_break (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'break;'
	}
	compile_continue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'continue;'
	}
	compile_return (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'return rax;'
	}
	compile_try (value, child, frame, stack, index) {
		throw 'TODO: try'
	}
	compile_catch (value, child, frame, stack, index) {
		throw 'TODO: catch'
	}
	compile_finally (value, child, frame, stack, index) {
		throw 'TODO: finally'
	}
	/*
	 * Assemble
	 */
	compile_assemble (value, child, frame, stack, index) {
		return this.compile_assemble_prologue(value, child, frame, stack, index) + this.compile_assemble_epilogue(value, child, frame, stack, index)
	}
	compile_assemble_prologue (value, child, frame, stack, index) {
		return '' + stack.join('')
	}
	compile_assemble_epilogue (value, child, frame, stack, index) {
		return value
		return 'int main(int argc, char** argv){do{' + value + '}while(0);return 0;}'
	}
}

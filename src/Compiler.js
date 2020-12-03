import {Parser} from './Parser.js'

export class Compiler extends Parser {
	compile_program (value, child, frame, stack, index) {
		return this.compile_assemble(this.compile_children(child.token, child, frame, stack, index), child, frame, stack, index)
	}
	/*
	 * Dispatch
	 */
	compile_dispatch (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
				return this.compile_literal(child.value, child, frame, stack, stack.length)
			case this.token_operator:
				return this.compile_operator(child.value, child, frame, stack, index)
			case this.token_statement:
				return this.compile_statement(child.value, child.child, frame, stack, index)
			case this.token_subroutine:
				return this.compile_subroutine(child.value, child, frame, stack, index)
			case this.token_membership:
				return this.compile_membership(child.value, child, frame, stack, index)
			case this.token_expression:
				return this.compile_expression(child.value, child, frame, stack, index)
			case this.token_identifier:
				return this.compile_identifier(child.value, child, frame, stack, index)
			default:
				return ''
		}
	}
	compile_literal (value, child, frame, stack, index) {
		switch (value) {
			case this.token_float:
				return this.compile_number(child.child, child, frame, stack, index)
			case this.token_string:
				return this.compile_template(child.child.join(''), child, frame, stack, child.props)
			case this.token_function:
			case this.token_definite:
				return this.compile_function(child.props, stack[index] = this.compile_function_assemble(value, child, frame, stack, index), child, frame, stack, index)
			default:
				switch (child.props) {
					case this.token_null:
						return 'rax=null;'
					case this.token_true:
						return 'rax=true;'
					case this.token_false:
						return 'rax=false;'
				}
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
				return this.compile_children(child.props, child, frame, stack, index)
			case this.token_operations:
				return this.compile_operator(child.props, child.child, frame, stack, index)
		}
	}
	compile_membership (value, child, frame, stack, index) {
		return this.compile_children(value, child, frame, stack, index)
	}
	compile_subroutine (value, child, frame, stack, index) {
		return this.compile_children(value, child, frame, stack, index)
	}
	/*
	 * Literal
	 */
	compile_number (value, child, frame, stack, index) {
		return '{static f64 rbx=(' + value + ');rax=int_in_flt(&rbx);}'
	}
	compile_template (value, child, frame, stack, index) {
		return '{static p32 rbx=(U"' + value + '");rax=' + index + ';static i64 rdx[8];len_to_set(rdx,rax);env_to_set(rdx,rdx);fun_to_set(rdx,str);mem_to_set(rdx,rbx);rax=str_to_any(rdx);}'
	}
	compile_property (value, child, frame, stack, index) {
		return '{static p32 rbx=(U"' + child.child + '");rax=(i64)rbx;}'
	}
	/*
	 * Function
	 */
	compile_function (value, child, frame, stack, index) {
		return '{static i64 rbx=&fun' + index + ';' + this.compile_function_prologue(value, child, frame, stack, index) + this.compile_function_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_function_assemble (value, child, frame, stack, index) {
		return 'static i64 fun' + index + '(i64 arc,p64 arv,p64 are,p64 arg){do{' + this.compile_children(value, child, frame, stack, index) + '}while(0);' + this.compile_function_finalize(value, child, frame, stack, index) + 'return rax;}'
	}
	compile_function_prologue (value, child, frame, stack, index) {
		return frame.state ? 'p64 rdx=fun_to_new(0);' : 'static i64 rdx[8];'
	}
	compile_function_epilogue (value, child, frame, stack, index) {
		return 'fun_to_set(rdx,rbx);len_to_set(rdx,0);env_to_set(rdx,are);mem_to_set(rdx,rbx);rax=fun_to_any(rdx);rcx=rdx;'
	}
	compile_function_finalize (value, child, frame, stack, index) {
		return value == this.token_subroutine ? 'fun_to_set(rdx,&fun' + index + ');' : ''
	}
	/*
	 * Statement
	 */
	compile_if (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'zfg=any_to_int(rax);if(zfg){i64 zfg=0;' + this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_else (value, child, frame, stack, index) {
		return 'if(!zfg){' + this.compile_dispatch(value, child[0], frame, stack, index) + '}'
	}
	compile_switch (value, child, frame, stack, index) {
		return '{' + this.compile_switch_prologue(value, child[0], frame, stack, index) + this.compile_switch_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_switch_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 cfg=0;i64 rbx=rax;'
	}
	compile_switch_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_case (value, child, frame, stack, index) {
		return this.compile_case_prologue(value, child[0], frame, stack, index) + this.compile_case_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index)
	}
	compile_case_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'zfg=cfg?zfg:cfg=' + this.compile_operator_prologue(this.token_compare, child, frame, stack, index)
	}
	compile_case_epilogue (value, child, frame, stack, index) {
		return 'if(cfg!=0){' + this.compile_dispatch(value, child, frame, stack, index) + '}'
	}
	compile_do (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_do_prologue(value, child[0], frame, stack, index) + this.compile_do_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_do_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_do_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'zfg=any_to_int(rax);if(!zfg)break;'
	}
	compile_while (value, child, frame, stack) {
		return 'while(1){' + this.compile_while_prologue(value, child[0], frame, stack, index) + this.compile_while_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_while_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'zfg=any_to_int(rax);if(!zfg)break;'
	}
	compile_while_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_for (value, child, frame, stack, index) {
		return '{' + this.compile_for_prologue(value, child[0], frame, stack, 0) + 'while(1){' + this.compile_for_epilogue(value, child, frame, stack, 0) + this.compile_dispatch(value, child[2], frame, stack, index) + '}}'
	}
	compile_for_prologue (value, child, frame, stack, index) {
		return 'i64 rsi=0;p64 rbp=0;' + child.child.reduce((state, entry, index, array) => index < array.length - 2 ? state + this.compile_dispatch(value, entry, frame, stack, index) : state, '')
	}
	compile_for_epilogue (value, child, frame, stack, index) {
		return this.compile_for_condition(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_for_iteration(value, child[0], frame, stack, index)
	}
	compile_for_condition (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 2], frame, stack, index) + 'zfg=any_to_int(rax);if(!zfg)break;'
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
	 * Identifier
	 */
	compile_identifier (value, child, frame, stack, index) {
		return this.compile_identifier_identity(value, child, frame, 'rcx=are;', frame.state)
	}
	compile_identifier_identity (value, child, frame, stack, index) {
		if (child.state) {
			while (child.state < index--) {
				stack += 'rcx=env_to_get(rcx,p64);'
			}
		} else {
			stack += 'rcx=arg;'
		}

		if (child.types) {
			stack += 'mem_to_get(rcx,p64)[' + child.index + ']=null;'

			if (frame.types == this.token_subroutine) {
				stack += '{static p32 rbx=(U"' + child.child + '");i64 rdi=len_to_get(rcx);mem_to_get(rcx,p64)[rdi+' + child.index + ']=rbx;}'
			}
		}

		return stack + 'rcx=&mem_to_get(rcx,p64)[' + child.index + '];rax=*rcx;'
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		return '{' + this.compile_children_prologue(value, child, frame, stack, index) + 'i64 rbx=rax;p64 rdx=rcx;' + this.compile_children_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_children_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_enviroment:
				return this.compile_children_assemble('p64 are=' + this.compile_children_allocate('env', child, frame, stack, index), child, frame, stack, index)
			case this.token_subroutine:
				return this.compile_children_assemble('p64 are=' + this.compile_children_allocate('sub', child, frame, stack, index), child, frame, stack, index)
			case this.token_membership:
				return this.compile_children_assemble('p64 arv=' + this.compile_children_allocate('mem', child, frame, stack, index), child, frame, stack, index)
			default:
				return ''
		}
	}
	compile_children_epilogue (value, child, frame, stack, index) {
		return 'i64 rdi=0;' + this.compile_children_iterator(value, child, frame, stack, index) + (child.props == -1 ? 'normalize(rax,rbx,rcx,rdx,rdi);' : '') + this.compile_children_finalize(value, child, child.types, stack, index)
	}
	compile_children_assemble (value, child, frame, stack, index) {
		return value ? 'rdi=' + child.child.length + ';' + value : value
	}
	compile_children_allocate (value, child, frame, stack, index) {
		return 'rcx=' + (child.frame ? '' : 'arg=') + (child.types ? value + '_to_new(rdi);' : '((i64)(i64[rdi+8]){});') + this.compile_children_register(value, child, frame, stack, index)
	}
	compile_children_register (value, child, frame, stack, index) {
		return 'len_to_set(rcx,rdi);env_to_set(rcx,are);fun_to_set(rcx,' + value + ');'
	}
	compile_children_finalize (value, child, frame, stack, index) {
		switch (child.types) {
			case this.token_subroutine:
			case this.token_membership:
				return 'rax=' + value + '_to_any(rcx);'
			default:
				return ''
		}
	}
	compile_children_iterator (value, child, frame, stack, index) {
		return child.child.reduce((state, entry, index) => this.compile_children_dispatch(value, entry, child, stack, index), '')
	}
	compile_children_dispatch (value, child, frame, stack, index) {
		switch (value) {
			case this.token_parameters:
				return this.compile_children_argument(value, child, frame, stack, index)
			case this.token_subroutine:
				return this.compile_children_property(value, child, frame, stack, index) + this.compile_dispatch(value, child, frame, stack, index)
			case this.token_membership:
				return this.compile_dispatch(value, child, frame, stack, index) + 'mem_to_get(rdx,p64)[' + index + ']=rax;'
			default:
				return this.compile_dispatch(value, child, frame, stack, index)
		}
	}
	compile_children_argument (value, child, frame, stack, index) {
		switch (child.props) {
			case this.token_spreading:
				return '{i64 rbx=' + index + ';i64 rdi=rbx<arc?arc-rbx:0;p64 rcx=mem_to_new(rdi);' + this.compile_children_register(value, child, frame, stack, index) + 'while(rbx<arc)mem_to_get(rcx,p64)[rbx]=mem_to_get(arv,p64)[rbx++];}'
			default:
				return '{i64 rbx=' + index + '<arc?mem_to_get(arv,p64)[' + index + ']:null;mem_to_get(rdx,p64)[' + child.index + ']=rbx;}'
		}
	}
	compile_children_property (value, child, frame, stack, index) {
		if (frame.types) {
			switch (child.token) {
				case this.token_expression:
					switch (child.props) {
						case this.token_spreading:
							return return 'mem_to_get(rdx,p64)[rdi+' + child.index + ']=0;'
					}
				default: return 'mem_to_get(rdx,p64)[rdi+' + child.index + ']=-1;'
			}
		} else {
			return ''
		}
	}
	/*
	 * Operator
	 */
	compile_operator (value, child, frame, stack, index) {
		return '{' + this.compile_operator_prologue(value, child, frame, stack, index) + this.compile_operator_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_operator_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_in:
			case this.token_of:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'i64 rbx=rax;p64 rdx=rcx;if(rsi==0)' + this.compile_dispatch(value, child[1], frame, stack, index)
			case this.token_operator:
				return this.compile_dispatch(this.token_literal, child, frame, stack, index)
			case this.token_logical_if:
			case this.token_logical_or:
			case this.token_logical_and:
			case this.token_logical_null:
			case this.token_assignment_optional:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'i64 rbx=rax;p64 rdx=rcx;'
			case this.token_properties:
			case this.token_properties_optional:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'i64 rbx=rax;p64 rdx=rcx;' + this.compile_property(value, child[1], frame, stack, index)
			default:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'i64 rbx=rax;p64 rdx=rcx;' + this.compile_dispatch(value, child[1], frame, stack, index)
		}
	}
	compile_operator_epilogue (value, child, frame, stack, index) {
		switch (value) {
			// () []
			case this.token_expression:
				return 'rdx=any_to_obj(rbx);rax=fun_to_get(rdx,x64)(len_to_get(rcx,i64),rcx,env_to_get(rdx,p64),arg);'
			case this.token_membership:
				return 'any_to_mem(&rax,rbx,&rcx,any_to_obj(rbx));'
			// =>
			case this.token_direction:
				return 'break;'
			// .. ...
			case this.token_generator:
				return 'rax=generator(rbx,rax);'
			case this.token_spreading:
				return 'rax=spreading(rbx,rax);'
			// ?
			case this.token_logical_if:
				return this.compile_if(value, [, child.value == child[1].value ? child[1].child[0] : child[1]], frame, stack, index) + this.compile_else(value, [child.value == child[1].value ? child[1].child[1] : child[1]])
			// :
			case this.token_initialize:
			// =
			case this.token_assignment:
				return '*rdx=rax;'
			// ?=
			case this.token_assignment_optional:
				return 'rax=(rbx==null)?true:false;' + this.compile_if(value, [, child[1]], frame, stack, index)
			// += -= /= %=
			case this.token_assignment_addition:
				return this.compile_operator_epilogue(this.token_addition, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_subtract:
				return this.compile_operator_epilogue(this.token_subtract, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_division:
				return this.compile_operator_epilogue(this.token_division, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_modulous:
				return this.compile_operator_epilogue(this.token_modulous, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			// &= ^= |=
			case this.token_assignment_bitwise_and:
				return this.compile_operator_epilogue(this.token_bitwise_and, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_bitwise_xor:
				return this.compile_operator_epilogue(this.token_bitwise_xor, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_bitwise_or:
				return this.compile_operator_epilogue(this.token_bitwise_or, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			// *= **=
			case this.token_assignment_multiply:
				return this.compile_operator_epilogue(this.token_multiply, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_exponent:
				return this.compile_operator_epilogue(this.token_exponent, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			// <<= >>= <<<= >>>=
			case this.token_assignment_shift_left:
				return this.compile_operator_epilogue(this.token_shift_left, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_right:
				return this.compile_operator_epilogue(this.token_shift_right, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_left_unsigned:
				return this.compile_operator_epilogue(this.token_shift_left_unsigned, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_right_unsigned:
				return this.compile_operator_epilogue(this.token_shift_right_unsigned, child, frame, stack, index) + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			// ||
			case this.token_logical_or:
				return this.compile_if(value, [child[0]], frame, stack, index) + this.compile_else(value, [child[1]])
			// &&
			case this.token_logical_and:
				return this.compile_if(value, [child[0], child[1]], frame, stack, index)
			// ??
			case this.token_logical_null:
				return 'rax=(rax==null)?true:false;' + this.compile_if(value, [, child[1]], frame, stack, index)
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
				return 'if(rsi==0)rbp=any_to_obj(rax);if(rsi<len_to_get(rbp,i64))*rdx=key_in_obj(rbp,rsi++);else{rsi=0;break;}'
			case this.token_of:
				return 'if(rsi==0)rbp=any_to_obj(rax);if(rsi<len_to_get(rbp,i64))*rdx=val_of_obj(rbp,rsi++);else{rsi=0;break;}'
			case this.token_instanceof:
				return 'rdx=any_to_obj(rbx);rcx=any_to_obj(rax);rax=(fun_to_get(rdx,i64)==fun_to_get(rcx,164))?true:false;'
			case this.token_concatenation:
				return 'if(any_is_flt(rbx)&&any_is_flt(rax))' + this.compile_operator_epilogue(this.token_addition, child, frame, stack, index) + 'else{rax=any_to_con(rbx,rax);}'
			// + -
			case this.token_addition:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);eax=ebx+eax;rax=int_in_flt(&eax);'
			case this.token_subtract:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);eax=ebx-eax;rax=int_in_flt(&eax);'
			// % / *
			case this.token_modulous:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);eax=fmod(ebx,eax);rax=int_in_flt(&eax);'
			case this.token_division:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);eax=ebx/eax;rax=int_in_flt(&eax);'
			case this.token_multiply:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);eax=ebx*eax;rax=int_in_flt(&eax);'
			// **
			case this.token_exponent:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);eax=pow(ebx,eax);rax=int_in_flt(&eax);'
			// |
			case this.token_bitwise_or:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=rbx|rax;eax=int_to_flt(rax);rax=int_in_flt(&eax);'
			// ^
			case this.token_bitwise_xor:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=rbx^rax;eax=int_to_flt(rax);rax=int_in_flt(&eax);'
			// &
			case this.token_bitwise_and:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=rbx&rax;eax=int_to_flt(rax);rax=int_in_flt(&eax);'
			// << >> <<< >>>
			case this.token_shift_left:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=rbx<<rax;eax=int_to_flt(rax);rax=int_in_flt(&eax);'
			case this.token_shift_right:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=rbx>>rax;eax=int_to_flt(rax);rax=int_in_flt(&eax);'
			case this.token_shift_left_unsigned:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=rbx<<rax;eax=int_to_flt(rax);eax=fabs(eax);rax=int_in_flt(&eax);'
			case this.token_shift_right_unsigned:
				return 'ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=rbx<<rax;eax=int_to_flt(rax);eax=fabs(eax);rax=int_in_flt(&eax);'
			// keyword operators
			case this.token_void:
				return 'rax=null;'
			case this.token_yield:
				return 'rax=yield(rax);'
			case this.token_await:
				return 'rax=await(rax);'
			case this.token_typeof:
				return 'rax=types(rax);'
			case this.token_sizeof:
				return 'rdx=any_to_obj(rax);rbx=len_to_get(rdx,i64);ebx=flt_in_int(rax);rax=int_in_flt(&rax);'
			// ! ~ ++ --
			case this.token_logical_not:
				return 'rax=any_to_int(rax)?false:true;'
			case this.token_bitwise_not:
				return 'rax=~rax; ebx=flt_in_int(&rax);eax=flt_in_int(&rbx);rbx=flt_to_int(ebx);rax=flt_to_int(eax);rax=~rax;eax=int_to_flt(rax);rax=int_in_flt(&eax);'
			case this.token_increment:
				return child[0].token == this.token_operator ? 'rax=++*rcx;' : 'rax=*rdx++'
			case this.token_decrement:
				return child[0].token == this.token_operator ? 'rax=--*rcx;' : 'rax=*rdx++'
			// . ?.
			case this.token_properties:
			case this.token_properties_optional:
				return `{static i64 rsi;static i64 rdi;any_to_sub(&rax,rbx,&rcx,any_to_obj(rbx),&rsi,&rdi);}`
			default:
				return ''
		}
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
		return 'int main(int argc, char** argv){do{' + value + '}while(0);return 0;}'
	}
}

import {Parser} from './Parser.js'

export class Compiler extends Parser {
	compile_program (value, child, frame, stack, index) {
		return this.compile_assemble('main', this.compile_dispatch(value, child, null, stack, index), frame, stack, index).replace(/({|})/g, '\n$1\n').replace(/;/g, ';\n').replace(/\n{2,}/g, '\n')
	}
	/*
	 * Dispatch
	 */
	compile_dispatch (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
			case this.token_operator:
				return this.compile_literal(child.value, child, frame, stack, index)
			case this.token_statement:
				return this.compile_statement(child.value, child.child, child, stack, index)
			case this.token_subroutine:
				return this.compile_subroutine(child.token, child, frame, stack, index)
			case this.token_membership:
				return this.compile_membership(child.token, child, frame, stack, index)
			case this.token_expression:
				return this.compile_expression(child.value, child, frame, stack, index)
			case this.token_identifier:
				return this.compile_identifier(value, child, frame, stack, child.index)
			default:
				return ''
		}
	}
	compile_statement (value, child, frame, stack, index) {
		switch (value) {
			case this.token_else: return this.compile_else(value, child, frame, stack, index)
			case this.token_if: return this.compile_if(value, child, frame, stack, index)
			case this.token_switch: return this.compile_switch(value, child, frame, stack, index)
			case this.token_case: return this.compile_case(value, child, frame, stack, index)
			case this.token_do: return this.compile_do(value, child, frame, stack, index)
			case this.token_while: return this.compile_while(value, child, frame, stack, index)
			case this.token_for: return this.compile_for(value, child, frame, stack, index)
			case this.token_break: return this.compile_break(value, child, frame, stack, index)
			case this.token_continue: return this.compile_continue(value, child, frame, stack, index)
			case this.token_return: return this.compile_return(value, child, frame, stack, index)
			case this.token_throw: return this.compile_throw(value, child, frame, stack, index)
			case this.token_try: return this.compile_try(value, child, frame, stack, index)
			case this.token_catch: return this.compile_catch(value, child, frame, stack, index)
			case this.token_finally: return this.compile_finally(value, child, frame, stack, index)
			case this.token_import: return this.compile_imports(value, child, frame, stack, index)
			case this.token_export: return this.compile_exports(value, child, frame, stack, index)
			default: return ''
		}
	}
	compile_expression (value, child, frame, stack, index) {
		switch (value) {
			case this.token_operator:
				return this.compile_operator(child.props, child.child, frame, stack, index)
			case this.token_expression:
				return this.compile_children(child.props, child, frame, stack, child.count - child.stack)
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
		return this.compile_identifier_prologue(value, child, frame, stack, index) + this.compile_identifier_epilogue(value, child, frame, stack, index)
	}
	compile_identifier_prologue (value, child, frame, stack, index) {
		// closure/object scope
		if (frame.types) {
			if (child.types) {
				if (frame.types == this.token_subroutine) {
					if (frame.props == this.token_iterable) {
						return this.compile_identifier_iterator(value, child, frame, stack, index) + this.compile_identifier_iterable(value, child, frame, stack, index)
					}
				}
			}

			return this.compile_identifier_iterator(value, child, frame, stack, index) + 'pax=&mem_to_get(pax,p64)[' + index + '];'
		} else if (child.state) {
			// non closure function scope
			return 'pax=&arv[' + index + '];'
		} else {
			// global scope
			return 'pax=&ars[' + child.value + '];'
		}
	}
	compile_identifier_epilogue (value, child, frame, stack, index) {
		if (child.types) {
			if (frame.types == this.token_subroutine) {
				if (frame.props == this.token_iterable) {
					return this.compile_identifier_iterable(value, child, frame, stack, index)
				} else {
					return this.compile_identifier_property(value, child, frame, stack, index)
				}
			} else {
				return '*pax=rax;'
			}
		} else {
			return 'rax=*pax;'
		}
	}
	compile_identifier_iterator (value, child, frame, stack, index) {
		return 'pax=art;eax=' + child.state + ';while(eax--)pax=env_to_get(pax,p64);'
	}
	compile_identifier_iterable (value, child, frame, stack, index) {
		return 'any_to_key(rax,IS_SUB,&pax,pax,&nop,0,rdi-rsi-' + index + ');' + this.compile_identifier_property(value, child, frame, stack, index)
	}
	compile_identifier_property (value, child, frame, stack, index) {
		return '*pax=rax;' + this.compile_literal_string(value, child.child, child, stack, index) + 'pax[rdi]=rax;'
	}
	/*
	 * Literal
	 */
	compile_literal (value, child, frame, stack, index) {
		switch (value) {
			case this.token_number:
				return this.compile_literal_number(child.props, child.child, frame, stack, index)
			case this.token_string:
				return this.compile_literal_string(value, child.child.join(''), frame, stack, index) + this.compile_literal_string_object(child.props, child, frame, stack, index)
			case this.token_function:
				return this.compile_function(child.props, child, frame, stack, this.state_stack.push(this.compile_function_iterator(child.types, child, frame, stack, index)) - 1)
			default:
				switch (value) {
					case this.token_null:
						return 'rax=null;'
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
		return value > 0 ? 'rax=any_to_nod(' + child + ',' + value + ');' : 'rax=any_to_dec(' + child + ',' + value + ');'
	}
	compile_literal_string (value, child, frame, stack, index) {
		return '{static s32 rbp=U"' + child + '";rax=any_to_i64(rbp);}'
	}
	compile_literal_string_object (value, child, frame, stack, index) {
		return '{static i64 rbp[4];fun_to_set(rbp,&fun_of_str);len_to_set(rbp,' + value + ');env_to_set(rbp,art);mem_to_set(rbp,rax);rax=str_to_any(rbp);}'
	}
	/*
	 * Function
	 */
	compile_function (value, child, frame, stack, index) {
		return '{' + this.compile_function_prologue(value, child, frame, stack, index) + this.compile_function_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_function_prologue (value, child, frame, stack, index) {
		return child.types ? 'p64 rbp=new_to_get(0,8);' : 'static i64 rbp[4];'
	}
	compile_function_epilogue (value, child, frame, stack, index) {
		return 'fun_to_set(rbp,&fun' + index + ');len_to_set(rbp,0);env_to_set(rbp,art);rax=fun_to_any(rbp);'
	}
	compile_function_iterator (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return 'static i64 fun' + index + '(i64 arc,p64 arv,p64 art){art=env_to_get(art,p64);do{' + this.compile_children(value, child, frame, stack, index) + 'fun_to_set(rbp,&fun' + index + ');}while(0);return rax;}'
			default:
				return 'static i64 fun' + index + '(i64 arc,p64 arv,p64 art){art=env_to_get(art,p64);do{' + this.compile_children(value, child, frame, stack, index) + '}while(0);return rax;}'
		}
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		return this.compile_children_prologue(value, child, frame, stack, index) + '{' + this.compile_children_iterator(value, child, frame, stack, index) + this.compile_children_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_children_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_enviroment:
				return child.types ? this.compile_children_allocate(value, child, frame, stack, index) : this.compile_children_relocate(value, child, frame, child.index, index)
			case this.token_subroutine:
				return child.types ? this.compile_children_allocate(value, child, frame, stack, index) : this.compile_children_relocate(value, child, frame, child.index, index)
			case this.token_membership:
				return child.types ? this.compile_children_allocate(value, child, frame, stack, index) : this.compile_children_relocate(value, child, frame, child.index, index)
			default:
				return ''
		}
	}
	compile_children_epilogue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_subroutine:
				return child.types ? 'rax=sub_to_any(rbp);' : ''
			case this.token_membership:
				return child.types ? 'rax=mem_to_any(rbp);' : ''
			default:
				return ''
		}
	}
	compile_children_iterator (value, child, frame, stack, index) {
		return child.child.reduce((state, entry, index) => state + '{' + this.compile_children_dispatch(value, entry, child, stack, index) + '}', '{') + '}'
	}
	compile_children_dispatch (value, child, frame, stack, index) {
		switch (value) {
			case this.token_parameters:
				return 'rax=' + index + '<arc?arv[' + index + ']:null;' + this.compile_dispatch(value, child, frame, stack, index)
			case this.token_membership:
				return this.compile_dispatch(value, child, frame, stack, index) + (child.props == this.token_iterable ? '' : 'rsp[' + index + (frame.props == this.token_iterable ? '+rsi' : '') + ']=rax;')
			default:
				return this.compile_dispatch(value, child, frame, stack, index)
		}
	}
	compile_children_allocate (value, child, frame, stack, index) {
		switch (value) {
			case this.token_enviroment:
				return 'i64 rsi=0;i64 rdi=' + index + ';p64 rbp=new_to_get(0,8);' + (index ? 'p64 rsp=new_to_get(rdi*1,8);mem_to_set(rbp,rsp);' : '') + 'len_to_set(rbp,rdi);env_to_set(rbp,art);p64 art=rbp;'
			case this.token_subroutine:
				return 'i64 rsi=0;i64 rdi=' + index + ';p64 rbp=new_to_get(0,8);' + (index ? 'p64 rsp=new_to_get(rdi*2,8);mem_to_set(rbp,rsp);' : '') + 'len_to_set(rbp,rdi);env_to_set(rbp,art);p64 art=rbp;'
			case this.token_membership:
				return 'i64 rsi=0;i64 rdi=' + index + ';p64 rbp=new_to_get(0,8);' + (index ? 'p64 rsp=new_to_get(rdi*1,8);mem_to_set(rbp,rsp);' : '') + 'len_to_set(rbp,rdi);'
			default:
				return ''
		}
	}
	compile_children_relocate (value, child, frame, stack, index) {
		switch (value) {
			case this.token_membership:
				return 'i64 rsi=0;i64 rdi=' + index + ';p64 rbp=0;p64 rsp=arv+' + stack + ';'
			default:
				return ''
		}
	}
	/*
	 * Destructure
	 */
	compile_destruct (value, child, frame, stack, index) {
		switch (value) {
			case this.token_for_in:
			case this.token_for_of:
			case this.token_initialize:
			case this.token_assignment:
				return this.compile_operator(value, child.child.reverse(), frame, stack, index)
			case this.token_assignment_optional:
				return 'if(rax==null)' + this.compile_destruct_prologue(this.token_assignment, child, frame, stack, index) + ';'
			case this.token_subroutine:
			case this.token_membership:
				return this.compile_destruct_iterator(value, child, frame, stack, index)
			default:
				return ''
		}
	}
	compile_destruct_iterator (value, child, frame, stack, index) {
		return child.child.reduce((state, entry, index) => state + '{' + this.compile_destruct_dispatch(value, entry, child, stack, index) + '}', '{i64 arv=any_to_obj(rax);i64 arc=len_to_get(arv,i64);i64 rbx=rax;') + '}'
	}
	compile_destruct_dispatch (value, child, frame, stack, index) {
		switch (child.value) {
			case this.token_identifier:
				switch (value) {
					case this.token_subroutine:
						return this.compile_operator_epilogue(value, child, frame, stack, index) + this.compile_dispatch(value, child, frame, stack, index)
					case this.token_membership:
						return this.compile_literal_number(0, index, frame, stack, index) + this.compile_operator_dispatch(value, child, frame, stack, index) + this.compile_dispatch(value, child, frame, stack, index)
				}
				break
			case this.token_operator:
				switch (child.props) {
					case this.token_iterable:
						switch (value) {
							case this.token_subroutine:
								return this.compile_dispatch(value, child, frame, stack, index) + 'rax=*pax=rbx;'
							case this.token_membership:
								return this.compile_dispatch(value, child, frame, stack, index) + this.compile_operator_iterable(this.token_parameters, child, frame, stack, index)
						}
						break
					default:
						for (var entry of child.child) {
							switch (entry.value) {
								case this.token_identifier:
									return this.compile_destruct_dispatch(value, entry, frame, stack, index) + this.compile_dispatch(value, child, frame, stack, index)
							}
						}
				}
			default:
				return this.compile_dispatch(value, child, frame, stack, index)
		}
	}
	/*
	 * Operator
	 */
	compile_operator (value, child, frame, stack, index) {
		return '{' + this.compile_operator_prologue(value, child[0], frame, stack, index) + 'i64 rbx=rax;p64 pbx=pax;' + this.compile_operator_epilogue(value, child[1], frame, stack, index) + '}'
	}
	compile_operator_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_operator_epilogue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_for_in:
				return 'if(rbp==0){' + this.compile_dispatch(value, child, frame, stack, index) + 'rbp=any_to_obj(rax,1);}if(rdi<len_to_get(rbp,i64)){rax=*pbx=key_in_obj(rbp,rdi++);}else{break;}'
			case this.token_for_of:
				return 'if(rbp==0){' + this.compile_dispatch(value, child, frame, stack, index) + 'rbp=any_to_obj(rax,1);}if(rdi<len_to_get(rbp,i64)){rax=*pbx=key_of_obj(rbp,rdi++);}else{break;}'
			case this.token_logical_if:
				return this.compile_if(value, child.props == this.token_initialize ? [, ...child.child] : [, child], frame, stack, index)
			case this.token_logical_or:
			case this.token_logical_and:
			case this.token_logical_null:
				return this.compile_operator_dispatch(value, child, frame, stack, index) + this.compile_dispatch(value, child, frame, stack, index)
			case this.token_assignment_optional:
				return this.compile_operator_dispatch(value, child, frame, stack, index) + '{' + this.compile_dispatch(value, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index) + '}'
			case this.token_properties:
			case this.token_properties_optional:
			case this.token_assignment_properties:
			case this.token_assignment_properties_optional:
			case this.token_subroutine:
				return this.compile_operator_property(value, child, frame, stack, index) + this.compile_operator_dispatch(value, child, frame, stack, index)
			default:
				return this.compile_dispatch(value, child, frame, stack, index) + this.compile_operator_dispatch(value, child, frame, stack, index)
		}
	}
	compile_operator_dispatch (value, child, frame, stack, index) {
		switch (value) {
			// () []
			case this.token_expression:
				return 'pbx=any_to_obj(rbx,1);rax=fun_to_get(pbx,x64)(rdi,rsp,pbx);'
			case this.token_membership:
				return 'pax=&pbx;rax=any_to_idx(rax,rbx,&pax,0);'
			case this.token_assignment_membership:
				return 'pax=&pbx;rax=any_to_idx(rax,rbx,&pax,pbx);'
			// =>
			case this.token_direction:
				return 'break;'
			// .. ...
			case this.token_generate:
				return this.compile_operator_generate(value, child, frame, stack, index)
			case this.token_iterable:
				return this.compile_operator_iterable(frame.types, child, frame.props = value, stack, index)
			// :
			case this.token_initialize:
			// =
			case this.token_assignment:
				return '*pbx=rax;'
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
			case this.token_assignment_shift_arithmetic_left:
				return this.compile_operator_dispatch(this.token_shift_arithmetic_left, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_arithmetic_right:
				return this.compile_operator_dispatch(this.token_shift_arithmetic_right, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_logical_left_unsigned:
				return this.compile_operator_dispatch(this.token_shift_logical_left_unsigned, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			case this.token_assignment_shift_logical_right_unsigned:
				return this.compile_operator_dispatch(this.token_shift_logical_right_unsigned, child, frame, stack, index) + this.compile_operator_dispatch(this.token_assignment, child, frame, stack, index)
			// ||
			case this.token_logical_or:
				return 'if(!any_to_bit(rax,i64))'
			// &&
			case this.token_logical_and:
				return 'if(any_to_bit(rax,i64))'
			// ??
			case this.token_logical_null:
				return 'if(rax!=null)'
			// == != === !==
			case this.token_compare:
				return 'rax=any_to_cmp(rbx,rax);'
			case this.token_uncompare:
				return 'rax=any_to_ump(rbx,rax);'
			case this.token_deep_compare:
				return 'rax=any_to_cmq(rbx,rax);'
			case this.token_deep_uncompare:
				return 'rax=any_to_umq(rbx,rax);'
			// < > <= >=
			case this.token_less_than:
				return 'rax=any_to_ltn(rbx,rax);'
			case this.token_greater_than:
				return 'rax=any_to_gtn(rbx,rax);'
			case this.token_equal_less_than:
				return 'rax=any_to_lte(rbx,rax);'
			case this.token_equal_greater_than:
				return 'rax=any_to_gte(rbx,rax);'
			// in of instanceof
			case this.token_in:
				return this.compile_operator_dispatch(this.token_properties, child, frame, stack, index) + 'rax=var_to_any(rsi!=-1);'
			case this.token_of:
				return 'rax=any_to_has(rbx,rax);'
			case this.token_instanceof:
				return 'rax=any_to_iof(rbx,rax);'
			// + -
			case this.token_addition:
				return 'rax=any_to_add(rbx,rax);'
			case this.token_subtract:
				return 'rax=any_to_sub(rbx,rax);'
			// % / *
			case this.token_modulous:
				return 'rax=any_to_mod(rbx,rax);'
			case this.token_division:
				return 'rax=any_to_div(rbx,rax);'
			case this.token_multiply:
				return 'rax=any_to_mul(rbx,rax);'
			// **
			case this.token_exponent:
				return 'rax=any_to_pow(rbx,rax);'
			// |
			case this.token_bitwise_or:
				return 'rax=any_to_nor(rbx,rax);'
			// ^
			case this.token_bitwise_xor:
				return 'rax=any_to_xor(rbx,rax);'
			// &
			case this.token_bitwise_and:
				return 'rax=any_to_and(rbx,rax);'
			// << >> <<< >>>
			case this.token_shift_arithmetic_left:
				return 'rax=any_to_sal(rbx,rax);'
			case this.token_shift_arithmetic_right:
				return 'rax=any_to_sar(rbx,rax);'
			case this.token_shift_logical_left:
				return 'rax=any_to_sll(rbx,rax);'
			case this.token_shift_logical_right:
				return 'rax=any_to_slr(rbx,rax);'
			// keyword operators
			case this.token_void:
				return 'rax=null;'
			case this.token_yield:
				return 'rax=any_to_jmp(rax,1);'
			case this.token_await:
				return 'rax=any_to_jmp(rax,0);'
			case this.token_keyof:
				return 'rax=any_to_map(rax,0);'
			case this.token_typeof:
				return 'rax=any_to_tof(rax,0);'
			case this.token_sizeof:
				return 'rax=any_to_len(rbx,rax);'
			// ! ~ ++ --
			case this.token_logical_not:
				return 'rax=var_to_any(any_to_bit(rax,i64));'
			case this.token_bitwise_not:
				return 'rax=any_to_not(rbx,rax);'
			case this.token_increment:
				return child.token == this.token_operator ? 'rbx=*pax=any_to_add(rbx,1);' : 'rax=*pbx=any_to_add(rax,1);'
			case this.token_decrement:
				return child.token == this.token_operator ? 'rbx=*pax=any_to_sub(rbx,1);' : 'rax=*pbx=any_to_sub(rax,1);'
			// . ?.
			case this.token_properties:
			case this.token_properties_optional:
			case this.token_assignment_properties:
			case this.token_assignment_properties_optional:
				return 'pbx=any_to_obj(rbx,1);' + this.compile_operator_dispatch(this.token_subroutine, child, frame, stack, index)
			// {}
			case this.token_subroutine:
				return 'static i64 rsi;pax=&nop;rax=any_to_key(rax,rbx,&pax,pbx,&rsi,rsi,0);'
			default:
				return ''
		}
	}
	compile_operator_iterable (value, child, frame, stack, index) {
		switch (value) {
			case this.token_parameters:
				return 'rbx=any_to_pat(' + index + ',arc,arv);rax=*pax=rbx;'
			case this.token_subroutine:
				return 'rbx=any_to_sat(rax,rax,rbp,rsp,rsi+' + index + ',rdi);if(rbx){rsi+=rbx;rdi+=rbx-1;if(rbp)rsp=mem_to_get(rbp,p64);}'
			case this.token_membership:
				return 'rbx=any_to_mat(rax,rax,rbp,rsp,rsi+' + index + ',rdi);if(rbx){rsi+=rbx;rdi+=rbx-1;if(rbp)rsp=mem_to_get(rbp,p64);}'
			default:
				return ''
		}
	}
	compile_operator_generate (value, child, frame, stack, index) {
		switch (frame.props) {
			case this.token_case:
				return 'rax=any_to_gen(rbx,rax);' + this.compile_range(value, child, frame, stack, index)
			default:
				return 'rax=any_to_gen(rbx,rax);'
		}
	}
	compile_operator_property (value, child, frame, stack, index) {
		switch (child.token) {
			case this.token_identifier:
				return this.compile_literal_string(value, child.child, frame, stack, index)
			default:
				return ''
		}
	}
	/*
	 * Statement
	 */
	compile_else (value, child, frame, stack, index) {
		return child ? 'if(!zfg){' + this.compile_dispatch(value, child[0] || child, frame, stack, index) + '}' : ''
	}
	compile_if (value, child, frame, stack, index) {
		return this.compile_if_prologue(value, child[0], frame, stack, index) + this.compile_if_epilogue(value, child[1], frame, stack, index) + this.compile_else(value, child[2], frame, stack, index)
	}
	compile_if_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 zfg=any_to_bit(rax,i64);'
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
		return 'if(!cfg){' + this.compile_dispatch(value, child, frame, stack, index) + 'i64 rbx=sfg;' + this.compile_operator_dispatch(this.token_compare, child, frame, stack, index) + 'if(rax==true)zfg=cfg=1;' + '}'
	}
	compile_case_epilogue (value, child, frame, stack, index) {
		return 'if(cfg){' + this.compile_dispatch(value, child, frame, stack, index) + '}'
	}
	compile_range (value, child, frame, stack, index) {
		return 'if(!cfg){' + this.compile_range_prologue(value, child, frame, stack, index) + this.compile_range_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_range_prologue (value, child, frame, stack, index) {
		return 'i64 rbp=any_to_obj(rax,1);p64 rsp=mem_to_get(rbp,p64);i64 rdi=len_to_get(rbp,i64);i64 rbx=sfg;'
	}
	compile_range_epilogue (value, child, frame, stack, index) {
		return 'for(i64 rsi=0;rsi<rdi;rsi++){if(cfg)break;rax=rsp[rsi];' + this.compile_operator_dispatch(this.token_compare, child, frame, stack, index) + 'if(rax==true)zfg=cfg=1;' + '}'
	}
	compile_do (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_do_prologue(value, child[0], frame, stack, index) + this.compile_do_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_do_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_do_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 zfg=any_to_bit(rax,i64);if(!zfg)break;'
	}
	compile_while (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_while_prologue(value, child[0], frame, stack, index) + this.compile_while_epilogue(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}'
	}
	compile_while_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'i64 zfg=any_to_bit(rax,i64);if(!zfg)break;'
	}
	compile_while_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_for (value, child, frame, stack, index) {
		return '{' + this.compile_for_prologue(value, child[0], frame, stack, 0) + 'while(1){' + this.compile_for_epilogue(value, child, frame, stack, 0) + this.compile_dispatch(value, child[2], frame, stack, index) + '}' + '}'
	}
	compile_for_prologue (value, child, frame, stack, index) {
		return child.child.reduce((state, entry, index, array) => index < array.length - 2 ? state + this.compile_dispatch(value, entry, frame, stack, index) : state, 'i64 rsi=0;i64 rdi=0;p64 rbp=0;')
	}
	compile_for_epilogue (value, child, frame, stack, index) {
		return this.compile_for_condition(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_for_iteration(value, child[0], frame, stack, index)
	}
	compile_for_condition (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 2], frame, stack, index) + 'i64 zfg=any_to_bit(rax,i64);if(!zfg)break;'
	}
	compile_for_iteration (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 1], frame, stack, index)
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
	compile_throw (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'longjmp(any_to_j64(*any_to_v64(rip)),1);'
	}
	compile_try (value, child, frame, stack, index) {
		return '{i64 tfg;j64 rsi;i64 rdi=rip;rip=any_to_i64(&rsi);' + this.compile_try_prologue(value, child, frame, stack, index) + this.compile_try_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_try_prologue (value, child, frame, stack, index) {
		return '\n#undef return\n#define return rcx=rax;longjmp(rsi,-1);\nswitch(setjmp(rsi)){case -1:tfg=-1;break;case 0:tfg=0;break;case 1:tfg=1;}if(!tfg){' + this.compile_dispatch(value, child[0], frame, stack, index) + '}' + 'rip=rdi;'
	}
	compile_try_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[1], frame, stack, index) + '\n#undef return\n' + this.compile_dispatch(value, child[2], frame, stack, index)
	}
	compile_catch (value, child, frame, stack, index) {
		return 'if(tfg>0){' + this.compile_dispatch(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index) + '}' + this.compile_dispatch(value, child[2], frame, stack, index)
	}
	compile_finally (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index) + 'if(tfg<0)return rcx;'
	}
	compile_imports (value, child, frame, stack, index) {
		return '{p64 pbx=&are[' + frame.index + '];' + this.compile_imports_prologue(child, child[0], frame, stack, index) + 'rax=*pbx;' + this.compile_imports_epilogue(value, child[1], frame, stack, index) + '}'
	}
	compile_imports_prologue (value, child, frame, stack, index) {
		return child.token == this.token_subroutine ? this.compile_children(this.token_subroutine, child, frame, stack, index) : ''
	}
	compile_imports_epilogue (value, child, frame, stack, index) {
		return child.token == this.token_subroutine ? this.compile_destruct(this.token_subroutine, child, frame, stack, index) : this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_export (value, child, frame, stack, index) {
		return '{' + this.compile_export_prologue(value, child, frame, stack, index) + this.compile_export_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_export_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index)
	}
	compile_export_epilogue (value, child, frame, stack, index) {
		return '*pbx?any_to_sat(rax,rax,pax=any_to_val(*pbx,p64),mem_to_get(pax,p64),0,len_to_get(pax,i64)):*pbx=rax;'
	}
	compile_await () {
		// var a = await foo;
		// var b = await bar;
		// -->
		// rax = await(foo, v => {
		// 	var a = val;
		// 	rax = await(bar, val => {
		// 		var b = val;
		// 	});
		// 	return rax;
		// });

		// return rax;
	}
	/*
	 * Assemble
	 */
	compile_assemble (value, child, frame, stack, index) {
		return this.compile_assemble_prologue(value, child, frame, stack, index) + this.compile_assemble_epilogue(value, child, frame, stack, index)
	}
	compile_assemble_prologue (value, child, frame, stack, index) {
		return 'static i64 are[' + this.state_files.length +'];static i64 ars[8388608];\n' + this.state_stack.join('')
	}
	compile_assemble_epilogue (value, child, frame, stack, index) {return child
		return 'int main(int argc, char** argv){arv=ars+' + this.state_count + ';do{' + child + '}while(0);return 0;}'
	}
}

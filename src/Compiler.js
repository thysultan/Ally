import {Parser} from './Parser.js'

export class Compiler extends Parser {
	compile_program (value, child, frame, stack, index) {
		return this.compile_assemble(this.compile_children(value, child, frame = child, stack = [], index = 0), child, frame, stack, index)
	}
	/*
	 * Dispatch
	 */
	compile_dispatch (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
			case this.token_operator:
				return this.compile_literal(child.value, child, frame, stack, stack.length)
			case this.token_statement:
				return this.compile_statement(child.value, child.child, frame, stack, index)
			case this.token_subroutine:
				return this.compile_subroutine(child.value, child, frame, stack, index)
			case this.token_membership:
				return this.compile_membership(child.value, child, frame, stack, index)
			case this.token_identifier:
				return this.compile_identifier(child.value, child, frame, stack, index)
			case this.token_expression:
				return this.compile_expression(child.value, child, frame, stack, index)
			default:
				return ''
		}
	}
	compile_literal (value, child, frame, stack, index) {
		switch (value) {
			case this.token_float:
				return this.compile_number(child.props, child, frame, stack, index)
			case this.token_string:
				return this.compile_template(child.child.join(''), child, frame, stack, child.props)
			case this.token_variable:
				return this.compile_variable(child.props, child, frame, stack, index)
			case this.token_function:
			case this.token_definition:
				return this.compile_function(child.props, stack[index] = this.compile_prototype(value, child, frame, stack, index), child, frame, stack, index)
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
			case this.token_operator:
				return this.compile_operator(child.props, child.child, frame, stack, index)
			case this.token_expression:
				return this.compile_children(child.types ? this.token_membership : child.props, child, frame, stack, index)
			default:
				return ''
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
		return '{static f64 rbx=(' + value + ');rax=flt_to_int(rbx);}'
	}
	compile_variable (value, child, frame, stack, index) {
		return '{static f64 rbx=(' + value + ');rax=var_to_any(rbx);}'
	}
	compile_template (value, child, frame, stack, index) {
		return '{static i64 rbx="' + value + '";static i64 obj[5];obj+=5;obj[-1]=' + index + ';obj[-2]=rbx;obj[-3]=str;rbx=obj;rax=str_to_any(rcx=rbx);}'
	}
	/*
	 * Function
	 */
	compile_function (value, child, frame, stack, index) {
		return '{' + (frame.state ? 'i64 obj=fun_to_new(5);' : 'static i64 obj[5];') + 'obj+=5;obj[-1]=0;obj[-2]=argx;obj[-3]=&fun' + index + ';i64 rbx=obj;rax=fun_to_any(rcx=rbx);}'
	}
	compile_prototype (value, child, frame, stack, index) {
		return 'static i64 fun' + index + '(i64 argc,p64 argv){i64 rax=0;p64 rcx=&nop;do{' + this.compile_children(value, child, frame, stack, index) + '}while(0);return rax;}'
	}
	/*
	 * Statement
	 */
	compile_if (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'zfg=any_to_int(rax);if(zfg!=0){i64 zfg=0;' + this.compile_dispatch(value, child[1], frame, stack, index) + '}'
	}
	compile_else (value, child, frame, stack, index) {
		return 'if(zfg==0){' + this.compile_dispatch(value, child[0], frame, stack, index) + '}'
	}
	compile_switch (value, child, frame, stack, index) {
		return '{' + this.compile_switch_prologue(value, child[0], frame, stack, index) + this.compile_switch_epilogue(value, child[1], frame, stack, index) + '}'
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
		return 'while(1){' + this.compile_do_prologue(value, child[0], frame, stack, index) + this.compile_do_epilogue(value, child[1], frame, stack, index) + '}'
	}
	compile_do_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_do_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'zfg=any_to_int(rax);if(zfg==0)break;'
	}
	compile_while (value, child, frame, stack) {
		return 'while(1){' + this.compile_while_prologue(value, child[0], frame, stack, index) + this.compile_while_epilogue(value, child[1], frame, stack, index) + '}'
	}
	compile_while_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index) + 'zfg=any_to_int(rax);if(zfg==0)break;'
	}
	compile_while_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child, frame, stack, index)
	}
	compile_for (value, child, frame, stack, index) {
		return '{' + this.compile_for_prologue(value, child[0], frame, stack, 0) + 'while(1){' + this.compile_for_epilogue(value, child, frame, stack, 0) + '}}'
	}
	compile_for_prologue (value, child, frame, stack, index) {
		return 'i64 rsi=0;i64 rdi=0;' + child.child.reduce((entry, child, index, array) => index < array.length - 2 ? entry + this.compile_dispatch(value, child, frame, stack, index) : entry, '')
	}
	compile_for_epilogue (value, child, frame, stack, index) {
		return this.compile_for_condition(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_for_iteration(value, child[0], frame, stack, index)
	}
	compile_for_condition (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 2], frame, stack, index) + 'zfg=any_to_int(rax);if(zfg==0)break;'
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
	compile_property (value, child, frame, stack, index) {
		return '{static i08 rbx="' + child.child + '";rax=(i64)rbx;}'
	}
	/*
	 * Identifier
	 */
	compile_identifier (value, child, frame, stack, index) {
		return this.compile_identifier_identify(value, child, frame, stack, child.index) + 'rax=' + this.compile_identifier_identity('', child, frame, stack, index) + ';'
	}
	compile_identifier_identify (value, child, frame, stack, index) {
		// child.state == -1 = parameter variables
		// child.state == +0 = global variables
		// child.state == >0 = closure variables
		// child.value == -this.token_object = spread_iterable variable
		// return child.child ? this.compile_identifier_property(value, child, frame, stack, index) : ''
	}
	compile_identifier_identity (value, child, frame, stack, index) {
		// return 'argx' + value + '[' + child.index + ']' // while (index--) { value += '[-2]' }
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		return '{' + child.child.reduce((state, entry, index) => {
			return state + this.compile_children_prologue(value, entry, child, stack, index) + this.compile_dispatch(value, entry, child, stack, index) + this.compile_children_epilogue(value, entry, child, stack, index)
		}, this.compile_children_elements(value, child, frame, stack, child.child.length)) + '}'
	}
	compile_children_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_parameters:
				return child.types ? 'argx[' + child.index + ']=' + index + '<argv[-1]?argv[' + index + ']:NIL;' : ''
			case this.token_subroutine:
				return child.types ? 'argx[-5-argc+' + index + ']="' + child.child '";' : ''
			default:
				return ''
		}
	}
	compile_children_epilogue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_membership:
				return 'argv[' + index + ']=rax;'
			default:
				return ''
		}
	}
	compile_children_elements (value, child, frame, stack, index) {
		switch (value) {
			case this.token_enviroment:
				return 'rax=ptr_to_any(argx);i64 argc=' + index + (child.types ? ';p64 argx=env_to_new(5+argc);' : 'i64 argx[5+argc];') + 'argx+=5;argx[-1]=argc;argv[-2]=rax;rax=obj_to_any(rcx=argx);'
			case this.token_subroutine:
				return 'rax=ptr_to_any(argx);i64 argc=' + index + (child.types ? ';p64 argx=sub_to_new(5+argc);' : 'i64 argx[5+argc];') + 'argx+=5;argx[-1]=argc;argv[-2]=rax;rax=obj_to_any(rcx=argx);'
			case this.token_membership:
				return 'rax=ptr_to_any(argx);i64 argc=' + index + (child.types ? ';p64 argv=mem_to_new(5+argc);' : 'i64 argv[5+argc];') + 'argv+=5;argv[-1]=argc;argv[-2]=rax;rax=obj_to_any(rcx=argv);'
			default:
				return ''
		}
	}
	/*
	 * Operator
	 */
	compile_operator (value, child, frame, stack, index) {
		return '{' + compile_operator_prologue(value, child, frame, stack, index) + compile_operator_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_operator_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_in:
			case this.token_of:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'i64 rbx=rax;p64 rdx=rcx;if(rsi==0)' + this.compile_dispatch(value, child[1], frame, stack, index)
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
				return 'rax=any_to_fun(rbx)(rcx[-1],rcx);'
			case this.token_membership:
				return 'rcx=any_to_obj(rbx);if(rax<rcx[-1]){rcx=&rcx[rax];rax=*rcx;}else{rcx=&nop;rax=NIL;}'
			// =>
			case this.token_direction:
				return 'break;'
			// .. ...
			case this.token_ranges: // TODO
			case this.token_spread: // TODO
				return ''
			// ?
			case this.token_logical_if:
				return this.compile_if(value, [, child.value == child[1].value ? child[1].child[0] : child[1]], frame, stack, index) + this.compile_else(value, [child.value == child[1].value ? child[1].child[1] : child[1]])
			// :
			case this.token_initialize:
			// =
			case this.token_assignment:
				return '*rdx=rax;'
			case this.token_assignment_property:
				return 'if(rdx==&nop)rdx=any_to_cap(rdx);' + this.compile_operator_epilogue(this.token_assignment, child, frame, stack, index)
			// ?=
			case this.token_assignment_optional:
				return 'rax=rbx==NIL;' + this.compile_if(value, [, child[1]], frame, stack, index)
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
				return 'rax=rax==NIL;' + this.compile_if(value, [, child[1]], frame, stack, index)
			// == != === !==
			case this.token_compare:
				return 'rax=rax==rbx||any_is_str(rax)&&any_is_str(rbx)&&str_to_cmp(rax,rbx)!=0;'
			case this.token_uncompare:
				return 'rax=rax!=rbx||any_is_str(rax)&&any_is_str(rbx)&&str_to_cmp(rax,rbx)==0;'
			case this.token_deep_compare:
				return 'rax=rax==rbx||any_to_cmp(rax,rbx)!=0;'
			case this.token_deep_uncompare:
				return 'rax=rax!=rbx||any_to_cmp(rax,rbx)==0;'
			// < > <= >=
			case this.token_less_than:
				return 'rax=rax<rbx;'
			case this.token_greater_than:
				return 'rax=rax>rbx;'
			case this.token_equal_less_than:
				return 'rax=rax<=rbx;'
			case this.token_equal_greater_than:
				return 'rax=rax>=rbx;'
			// in of instanceof
			case this.token_in:
				return 'if(rsi==0)rdi=any_to_obj(rax);if(rsi<rdi[-1])rbx=key_in_ptr(rdi,rsi++);else{rsi=0;break;}'
			case this.token_of:
				return 'if(rsi==0)rdi=any_to_obj(rax);if(rsi<rdi[-1])rbx=val_of_ptr(rdi,rsi++);else{rsi=0;break;}'
			case this.token_instanceof:
				return 'rax=rax==rcx[-3]'
			case this.token_concatenation:
				return 'if(any_is_flt(rax)&&any_is_flt(rbx))' + this.compile_operator_epilogue(this.token_addition, child, frame, stack, index) + 'else{rax=any_to_con(rax,rbx);}'
			// + -
			case this.token_addition:
				return 'rax=flt_to_int(int_to_flt(rax)+int_to_flt(rbx));'
			case this.token_subtract:
				return 'rax=flt_to_int(int_to_flt(rax)-int_to_flt(rbx));'
			// % / *
			case this.token_modulous:
				return 'rax=ftl_to_int(int_to_flt(rax)/int_to_flt(rbx));'
			case this.token_division:
				return 'rax=ftl_to_int(int_to_flt(rax)%int_to_flt(rbx));'
			case this.token_multiply:
				return 'rax=ftl_to_int(int_to_flt(rax)*int_to_flt(rbx));'
			// **
			case this.token_exponent:
				return 'rax=flt_to_int(pow(int_to_flt(rax),int_to_flt(rbx)));'
			// |
			case this.token_bitwise_or:
				return 'rax=rax|rbx;'
			// ^
			case this.token_bitwise_xor:
				return 'rax=rax^rbx;'
			// &
			case this.token_bitwise_and:
				return 'rax=rax&rbx;'
			// << >> <<< >>>
			case this.token_shift_left:
				return 'rax=rax<<rbx;'
			case this.token_shift_right:
				return 'rax=rax>>rbx;'
			case this.token_shift_left_unsigned:
				return 'rax=rax>>rbx;'
			case this.token_shift_right_unsigned:
				return 'rax=rax<<rbx;'
			// keyword operators
			case this.token_void:
				return 'rax=NIL;'
			case this.token_await:
				return 'rax=await(rax);'
			case this.token_keyof:
				return 'rax=keyof(rax);'
			case this.token_typeof:
				return 'rax=types(any_to_tag(rax));'
			case this.token_sizeof:
				return 'rax=sizes(rax);'
			case this.token_delete:
				return ''
			// ! ~ ++ --
			case this.token_logical_not:
				return 'rax=!rbx;'
			case this.token_bitwise_not:
				return 'rax=~rbx;'
			case this.token_increment:
				return child[0].token == this.token_operator ? 'rax=++*rcx;' : 'rax=*rcx++'
			case this.token_decrement:
				return child[0].token == this.token_operator ? 'rax=--*rcx;' : 'rax=*rcx++'
			// . ?.
			case this.token_properties:
			case this.token_properties_optional:
				return '{static i64 rsi;rcx=any_to_obj(rbx);if(rax!=rcx[-5-rcx[-1]+rsi]){rsi=obj_to_idx(rsi,rcx,rax);}if(rsi<0){/*TODO:key undefined*/}else{rcx=&rcx[rsi];rax=*rcx;}}'
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
		return stack.join('') + 'static void eval(i64 argc, char** argv){do{' + value + '}while(0);}'
	}
	compile_assemble_epilogue () {
		return 'int main(int argc, char** argv){eval(argc, argv);return 0;}'
	}
}

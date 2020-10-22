import {Parser} from './Parser.js'

export class Compiler extends Parser {
	compile_program (value, child, frame, stack, index) {
		return this.compile_assemble(this.compile_children(value, child, frame = child, stack = [], index = 0), child, frame, stack, index)
	}
	/*
	 * Compiler
	 */
	compile_assemble (value, child, frame, stack, index) {
		return stack.join('') + 'i64 main(i64 argc, char** argv){do{' + value + '}while(0);return 0;}'
	}
	compile_dispatch (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
				return this.compile_literal(value, child, frame, stack, stack.length)
			case this.token_statement:
				return this.compile_statement(value, child.child, frame, stack, index)
			case this.token_subroutine:
				return this.compile_subroutine(value, child, frame, stack, index)
			case this.token_membership:
				return this.compile_membership(value, child, frame, stack, index)
			case this.token_identifier:
				return this.compile_identifier(value, child, frame, stack, index)
			case this.token_expression:
				return this.compile_expression(value, child, frame, stack, index)
			default:
				return ''
		}
	}
	/*
	 * Literal
	 */
	compile_literal (value, child, frame, stack, index) {
		switch (child.value) {
			case this.token_string:
				return this.compile_string(value, child, frame, stack, index)
			case this.token_float:
			case this.token_integer:
				return this.compile_number(value, child, frame, stack, index)
			case this.token_variable:
				return this.compile_variable(value, child, frame, stack, index)
			case this.token_function:
			case this.token_definition:
				return this.compile_function(value, stack[index] = this.compile_function_prototype(value, child, frame, stack, index), child, frame, stack, index)
		}
	}
	compile_string (value, child, frame, stack, index) {
		return '{static i64 rbx=(i64)("' + child.child.join('') + '");rax=str_to_any(rbx);}'
	}
	compile_number (value, child, frame, stack, index) {
		return '{static f64 rbx=(f64)(' + child.props + ');rax=flt_to_int(rbx);}'
	}
	compile_variable (value, child, frame, stack, index) {
		return '{static f64 rbx=(f64)(' + child.props + ');rax=var_to_any(rbx);}'
	}
	/*
	 * Function
	 */
	compile_function (value, child, frame, stack, index) {
		return '{' + (frame.state ? 'static i64 fun[4];' : 'i64 fun=fun_to_new(argx);') + 'fun=fun+4;fun[-3]=argx;fun[-2]=(i64)(&fun' + index + ');fun[-1]=0;i64 rbx=(i64)fun;rax=fun_to_any(rbx);}'
	}
	compile_function_prototype (value, child, frame, stack, index) {
		return 'static i64 fun' + index + '(i64 argc,p64 argv,p64 arge){do{' + this.compile_children(this.token_enviroment, child, frame, stack, index) + '}while(0);return rax;}'
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
		return child.child ? this.compile_identifier_property(value, child, frame, stack, index) : ''
	}
	compile_identifier_identity (value, child, frame, stack, index) {
		return 'argx' + value + '[' + child.index + ']' // while (index--) { value += '[-2]' }
	}
	compile_identifier_property (value, child, frame, stack, index) {
		return 'argx[-5-' + index + ']=rax;' // TODO
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		return '{' + child.child.reduce((state, entry, index) => {
			return state + this.compile_children_prologue(value, entry, child, entry, index) + this.compile_dispatch(value, entry, child, stack, index) + this.compile_children_epilogue(value, entry, child, entry, index)
		}, this.compile_children_elements(value, child, frame, stack, index)) + '}'
	}
	compile_children_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_parameters:
				return '{' + this.compile_parameters(child.token, child, frame, stack, index) + '}'
			default:
				return ''
		}
	}
	compile_children_epilogue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_expression:
				return 'argx[' + index + ']=rax;'
			case this.token_membership:
				return 'argv[' + index + ']=rax;'
			default:
				return ''
		}
	}
	compile_children_elements (value, child, frame, stack, index) {
		switch (value) {
			case this.token_enviroment:
				return 'rax=ptr_to_any(argx);i64 argc=' + child.count + (child.types ? ';p64 argx=env_to_new(argc);' : 'i64 argx[argc+4];argc=-argc;') + 'argx=argx+4;argx[-1]=argc;argv[-2]=rax;rax=obj_to_any(argx);'
			case this.token_subroutine:
				return 'rax=ptr_to_any(argx);i64 argc=' + child.count + (child.types ? ';p64 argx=sub_to_new(argc);' : 'i64 argx[argc+4];argc=-argc;') + 'argx=argx+4;argx[-1]=argc;argv[-2]=rax;rax=sub_to_any(argx);'
			case this.token_membership:
				return 'rax=ptr_to_any(argx);i64 argc=' + child.child.length + (child.types ? ';p64 argv=mem_to_new(argc);' : 'i64 argv[argc+4];argc=-argc') + 'argx=argx+1;argv[-1]=argc;argv[2]=argv;rax=mem_to_any(argx);'
			case this.token_expression:
				return 'rax=ptr_to_any(argv);i64 argc=' + child.child.length + (child.types ? ';i64 argv[argc];' : '') + 'rax=ptr_to_any(argv);'
			default:
				return ''
		}
	}
	compile_parameters (value, child, frame, stack, index) {
		switch (value) {
			case this.token_identifier:
				return (child.types ? 'i64 argi=(i64)(' + child.index + ');if(argi < argc)argx[argi]=argv[' + index + '];' : '')
			case this.token_expression:
				return (child.index > hild.state ? this.compile_parameters(this.token_identifier, child, frame, stack, index) : '')
			default:
				return ''
		}
	}
	/*
	 * Membership
	 */
	compile_membership (value, child, frame, stack, index) {
		return this.compile_children(child.value, child, frame, stack, index)
	}
	/*
	 * Subroutine
	 */
	compile_subroutine (value, child, frame, stack, index) {
		return this.compile_children(child.value, child, frame, stack, index)
	}
	/*
	 * Expression
	 */
	compile_expression (value, child, frame, stack, index) {
		switch (child.value) {
			case this.token_operator:
				return this.compile_operator(child.props, child.child, frame, stack, index)
			case this.token_expression:
				return this.compile_children(child.props, child, frame, stack, index)
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
			case this.token_conditional:
				return this.compile_if(value, [child[0], child[1].child[0], child[1].child[1]], frame, stack, index)
			case this.token_logical_and:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'if(any_to_int(rax)){' + this.compile_dispatch(value, child[1], frame, stack, index) + '}'
			case this.token_logical_or:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'if(!any_to_int(rax)){' + this.compile_dispatch(value, child[1], frame, stack, index) + '}'
			case this.token_nullish:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'if(any_to_cmp(rax,nil)){' + this.compile_dispatch(value, child[1], frame, stack, index) + '}'
			case this.token_assignment_optional:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'if(any_to_cmp(rax,nil)){i64 rbx=rax;' + this.compile_dispatch(value, child[1], frame, stack, index) + '}'
			default:
				return this.compile_dispatch(value, child[0], frame, stack, index) + 'i64 rbx=rax;' + this.compile_dispatch(value, child[1], frame, stack, index)
		}
	}
	compile_operator_epilogue (value, child, frame, stack, index) {
		switch (value) {
			default:
				return 'ops_' + (value < 0 ? -value : value) + '(' + this.compile_operator_identity(0, child[0], frame, stack, index) + ',' + this.compile_operator_identity(1, child[1], frame, stack, index) + ');'
		}
	}
	compile_operator_identity (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_identifier:
				return this.compile_identifier_identity(value, child, frame, stack, index)
			case this.token_membership:
			case this.token_expression:
				if (child.value == this.token_operator) {
					switch (child.props) {
						case this.token_properties:
						case this.token_membership:
							return value ? '*rbx' : '*rax'
					}
				}
			default:
				return value ? 'rbx' : 'rax'
		}
	}
	/*
	 * Statement
	 */
	compile_statement (value, child, frame, stack, index) {
		switch (child.props) {
			case this.token_do: return this.compile_do(value, child, frame, stack, index)
			case this.token_if: return this.compile_if(value, child, frame, stack, index)
			case this.token_for: return this.compile_for(value, child, frame, stack, 0)
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
	compile_if (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'zfg=any_to_int(rax);if(zfg){' + this.compile_dispatch(value, child[1], frame, stack, index) + '}'
	}
	compile_else (value, child, frame, stack, index) {
		return 'if(!zfg){' + this.compile_dispatch(value, child, frame, stack, index) + '}'
	}
	compile_switch (value, child, frame, stack, index) {
		return this.compile_do_prologue(value, child, frame, stack, index) + this.compile_do_epilogue(value, child, frame, stack, index)
	}
	compile_switch_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index)
	}
	compile_switch_epilogue (value, child, frame, stack, index) {
		return 'do{i64 rbx=rax;' + this.compile_dispatch(value, child[1], frame, stack, index) + '}while(0);'
	}
	compile_case (value, child, frame, stack, index) {
		return this.compile_do_prologue(value, child, frame, stack, index) + this.compile_do_epilogue(value, child, frame, stack, index)
	}
	compile_case_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'zfg=any_to_cmp(rbx,rax);if(zfg)rbx=rax;'
	}
	compile_case_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index)
	}
	compile_do (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_do_prologue(value, child, frame, stack, index) + this.compile_do_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_do_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index)
	}
	compile_do_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[1], frame, stack, index) + 'zfg=any_to_int(rax);if(!zfg)break;'
	}
	compile_while (value, child, frame, stack) {
		return 'while(1){' + this.compile_while_prologue(value, child, frame, stack, index) + this.compile_while_epilogue(value, child, frame, stack, index) + '}'
	}
	compile_while_prologue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'zfg=any_to_int(rax);if(!zfg)break;'
	}
	compile_while_epilogue (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[1], frame, stack, index)
	}
	compile_for (value, child, frame, stack, index) {
		return this.compile_for_prologue(value, child[0], frame, stack, 0) + 'while(1){' + this.compile_for_epilogue(value, child, frame, stack, 0) + '}'
	}
	compile_for_prologue (value, child, frame, stack, index) {
		return 'i64 rbx=0;i64 rcx=0;' + child.child.reduce((state, entry, index, array) => index < array.length - 2 ? state + this.compile_dispatch(value, entry, frame, stack, index) : value, '')
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
}

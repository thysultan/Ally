import {Parser} from './Parser.js'

export class Compiler extends Parser {
	/*
	 * Entry
	 */
	compile_program (value, child, frame, stack, index) {
		return this.compile_assemble('do{' + this.compile_subroutine(child.value, child, frame, stack, index) + '}while(0);', child, frame, stack, index)
	}
	/*
	 * Assemble
	 */
	compile_assemble (value, child, frame, stack, index) {
		return stack.join('') + 'i64 main(i64 argc, char** argc){' + value + 'return 0;}'
	}
	/*
	 * Literal
	 */
	compile_literal (value, child, frame, stack, index) {
		switch (child.value) {
			case this.token_float:
			case this.token_integer:
				return this.compile_number(value, child, frame, stack, index)
			case this.token_string:
				return this.compile_string(value.join('\\n\\'), child, frame, stack, index)
			case this.token_function:
				return this.compile_function(stack[index = stack.length] = this.compile_function_prototype(value, child, child.child, stack, index), child, frame, stack, index)
			default:
				return this.compile_variable(value, child, frame, stack, index)
		}
	}
	compile_number (value, child, frame, stack, index) {
		return '{static f64 rbx=(f64)(' + value + ');rax=flt_to_int(rbx);}'
	}
	compile_string (value, child, frame, stack, index) {
		return '{static i64 str=(i64)(' + value + ');rax=str_to_any(str);}'
	}
	compile_variable (value, child, frame, stack, index) {
		return '{static i64 var=(i64)(' + value + ');rax=var_to_any(var);}'
	}
	compile_function (value, child, frame, stack, index) {
		return '{static i64 fun=(i64)(&fun' + index + ');rax=fun_to_any(fun);}'
	}
	compile_function_prototype (value, child, frame, stack, index) {
		return 'i64 fun' + index + '(i64 argc,p64 argv,p64 arge){' + this.compile_function_arguments(value, frame[0], frame, stack, child.count) + this.compile_function_procedure(value, frame[1], frame, stack, index) + '}'
	}
	compile_function_arguments (value, child, frame, stack, index) {
		return this.compile_enviroment(child.props, child, frame, stack, index) + this.compile_expression(child.props, child, frame, stack, index)
	}
	compile_function_procedure (value, child, frame, stack, index) {
		return 'do{' + this.compile_subroutine(value, child[1], frame, stack, index) + '}while(0);return rax;'
	}
	/*
	 * Identifier
	 */
	compile_identifier (value, child, frame, stack, index) {
		return this.compile_identify(value, child, frame, stack, child.index) + ';'
	}
	compile_identify (value, child, frame, stack, index) {// TODO 0 should index into either 0, 1, 2 for locals, arguments, enviroment recursively
		return 'args[0][' + index + ']'
	}
	compile_property (value, child, frame, stack, index) { // TODO get real value
		return child.token == this.token_identifier ? 'static i64 rbx=(' + child.value + ');' : 'static i64 rbx=' + this.compile_identify(child)
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		return child.child.reduce((state, child, index) => {
			return state + this.compile_dispatch(value, child, frame, stack, index) + '{' + this.compile_definition(value, child, frame, stack, index) + '}'
		}, '{i64 rax;i64 rbx;' + this.compile_enviroment(value, child, frame, stack, index)) + '}'
	}
	compile_dispatch (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
				return this.compile_literal(child.props, child, frame, stack, child.index)
			case this.token_statement:
				return this.compile_statement(child.props, child.child, frame, stack, index)
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
	compile_statement (value, child, frame, stack, index) {
		switch (value) {
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
	compile_subroutine (value, child, frame, stack, index) {
		return this.compile_children(value == this.token_expression ? child.token : value, child, frame, stack, index)
	}
	compile_membership (value, child, frame, stack, index) {
		return this.compile_children(child.token, child, frame, stack, index)
	}
	compile_definition (value, child, frame, stack, index) {
		switch (value) {
			case this.token_identifier:
				return 'argx[' + index + ']=rax;argx[' + index + '+argc-1]=rbx;'
			case this.token_expression:
			case this.token_membership:
				return 'argx[' + index + ']=rax;'
			case this.token_subroutine:
				return child.props == this.token_assignment ? this.compile_definition(this.token_membership, child, frame, stack, index) + this.compile_definition(this.token_identifier, child.child[0], frame, stack, index) : 'rbx=-1;'
			default:
				return ''
		}
	}
	compile_enviroment (value, child, frame, stack, index) {
		switch (value) {
			case this.token_membership:
				return 'i64 argc=' + index + ';p64 argx=env_to_any(argc);'
			case this.token_subroutine:
				return 'i64 argc=' + index * 2 + ';p64 argx=env_to_any(argc);'
			default:
				return index ? 'i64 argc=' + index + ';p64 argx[' + index + '];p64 args[3]={argx,argv,arge};' : ''
		}
	}
	compile_expression (value, child, frame, stack, index) {
		switch (child?.value) {
			case this.token_operator:
				return '{' + this.compile_operation(child.props, child.child, frame, stack, index) + this.compile_operator(child.props, child.child, frame, stack, index) + '}'
			case this.token_expression:
				return this.compile_children(value = child.props, child, frame, stack, value == child.value ? child.count : 0)
		}
	}
	/*
	 * Operator
	 */
	compile_operation (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'i64 rbx=rax;' + this.compile_dispatch(value, child[1], frame, stack, index)
	}
	compile_operator (value, child, frame, stack, index) {
		return 'ops_' + (value < 0 -value : value) + '(' + this.compile_operand(0, child[0], frame, stack, index) + ',' + this.compile_operand(1, child[1], frame, stack, index) + ');'
	}
	compile_operand (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_identifier:
				return this.compile_identify(value, child, frame, stack, child.index)
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
	 * Keyword
	 */
	compile_break (value, child, frame, stack, index) {
		return this.compile_expression(value, child, frame, stack, index)
	}
	compile_return (value, child, frame, stack, index) {
		return this.compile_expression(value, child, frame, stack, index)
	}
	compile_continue (value, child, frame, stack, index) {
		return this.compile_expression(value, child, frame, stack, index)
	}
	/*
	 * Statement
	 */
	compile_else (value, child, frame, stack, index) {
		return child ? 'else if(1){' + this.compile_dispatch(value, child, frame, stack, index) + '}' : ''
	}
	compile_do (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_dispatch(value, child[0], frame, stack, index) + this.compile_dispatch(value, child[1], frame, stack, index) + 'if(!any_to_int(rax))break;' + '}'
	}
	compile_while (value, child, frame, stack) {
		return 'while(1){' + this.compile_dispatch(value, child[0], frame, stack, index) + 'if(!any_to_int(rax))break;' + this.compile_dispatch(value, child[1], frame, stack, index) + '}'
	}
	compile_if (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'if(any_to_int(rax)){' + this.compile_dispatch(value, child[1], frame, stack, index) + '}' + this.compile_else(value, child[2], frame, stack, index)
	}
	compile_case (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'if(any_to_cmp(rcx,rax)){' + this.compile_dispatch(value, child[1], frame, stack, index) + '}' + this.compile_dispatch(value, child[2], frame, stack, index)
	}
	compile_switch (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + 'do{i64 rcx=rax;' + this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_dispatch(value, child[2], frame, stack, index) + '}while(0);'
	}
	compile_for (value, child, frame, stack, index) {
		return '{i64 rbp=0;i64 rsp=0;' + this.compile_for_initilize('', child[0], frame, stack, 0) + 'while(1){' + this.compile_for_condition(value, child[0], frame, stack, 0) + this.compile_for_subroutine(value, child, frame, stack, 0) + '}}'
	}
	compile_for_initilize (value, child, frame, stack, index) {
		return index < child.child.length - 2 ? this.compile_for_initilize(value + this.compile_dispatch(value, child.child[index], frame, stack, index), child, frame, stack, index + 1) : value
	}
	compile_for_condition (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 2], frame, stack, index) + 'if(!any_to_int(rax))break;'
	}
	compile_for_iteration (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child.child[child.child.length - 1], frame, stack, index)
	}
	compile_for_procedure (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_for_iteration(value, child[0], frame, stack, index)
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

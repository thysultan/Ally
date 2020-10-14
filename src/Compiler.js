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
		return stack.join('') + 'i64 main(i64 argc, char** argv){' + value + 'return 0;}'
	}
	/*
	 * Dispatch
	 */
	compile_dispatch (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
				return this.compile_literal(child.props, child, frame, stack, stack.length)
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
	/*
	 * Literal
	 */
	compile_literal (value, child, frame, stack, index) {
		switch (child.value) {
			case this.token_float:
			case this.token_integer:
				return this.compile_number(value, child, frame, stack, index)
			case this.token_string:
				return this.compile_string('"' + value.join('') + '"', child, frame, stack, index)
			case this.token_variable:
				return this.compile_variable(value, child, frame, stack, index)
			case this.token_function:
			case this.token_definition:
				return this.compile_function('&fun' + index, stack[index] = this.compile_function_prototype(value, child, frame, stack, index), child, frame, stack, index)
		}
	}
	compile_number (value, child, frame, stack, index) {
		return '{static f64 num=(f64)(' + value + ');rax=flt_to_int(num);}'
	}
	compile_string (value, child, frame, stack, index) {
		return '{static i64 str=(i64)(' + value + ');rax=str_to_any(str);}'
	}
	compile_variable (value, child, frame, stack, index) {
		return '{static i64 var=(i64)(' + value + ');rax=var_to_any(var);}'
	}
	/*
	 * Function
	 */
	compile_function (value, child, frame, stack, index) {
		return '{' + this.compile_function_interface(value, child, frame, stack, index) + ');obj[1]=argx;obj[2]=' + value + ';i64 fun=3+(i64)obj;rax=fun_to_any(fun);}'
	}
	compile_function_interface (value, child, frame, stack, index) {
		return frame.state ? 'static i64 obj[4];' : 'i64 obj=fun_to_new(argx);'
	}
	compile_function_prototype (value, child, frame, stack, index) {
		return 'static i64 fun' + index + '(i64 argc,p64 argv,p64 arge){do{' + this.compile_children(this.token_enviroment, child, frame, stack, index) + '}while(0);return rax;}'
	}
	/*
	 * Identifier
	 */
	compile_identifier (value, child, frame, stack, index) {
		return '{' + this.compile_identifier_property(value, child, frame, stack, index) + 'rax=' + this.compile_identifier_identity('', child, frame, stack, index) + ';}'
	}
	compile_identifier_identity (value, child, frame, stack, index) {
		// while (index--) { value += '[-2]' }
		return 'argx' + value + '[' + child.index + ']'
	}
	compile_identifier_property (value, child, frame, stack, index) {
		return child.child ? this.compile_string(child.child, child.child = null, child, stack, index) + 'argx[-1-' + child.index + ']=rax;' : ''
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		return '{' + this.compile_children_epilogue(child.child.reduce((state, entry, index) => {
			return state + this.compile_dispatch(value, entry, child, stack, index) + this.compile_children_properties(value, entry, child, stack, index)
		}, this.compile_children_prologue(value, child, frame, stack, index)), child, frame, stack, index) + '}'
	}
	compile_children_prologue (value, child, frame, stack, index) {
		switch (value) {
			case this.token_enviroment:
				return child.types ? 'i64 argx=env_to_new(' + child.count + ');rax=obj_to_any(argx);' : 'i64 argx[' + child.count + '];'
			case this.token_subroutine:
				return child.types ? 'i64 argx=sub_to_new(' + child.count + ');rax=sub_to_any(argx);' : 'i64 argx[' + child.count + '];'
			case this.token_membership:
				return child.types ? 'i64 argx=mem_to_new(' + child.child.length + ');rax=obj_to_any(argx);' : 'i64 argx[' + child.child.length + '];'
			case this.token_expression:
				return child.types ? 'i64 argx[' + child.child.length + '];' : ''
			default:
				return ''
		}
	}
	compile_children_epilogue (value, child, frame, stack, index) {
		switch (child.token) {
			// TODO: how to handle object spread {a = 1, ...b, c = 3} [a=1,b=ptr,c=3] then flat/copy on epilogue, the spread operator will increment a local argc counter to signal when this should be done at runtime.
			case this.token_subroutine:
				return child.types ? 'i64 argc=0;' + value + 'if(argc)argx=obj_to_cpy(argc,argx);' : value
			default:
				return value
		}
	}
	compile_children_properties (value, child, frame, stack, index) {
		switch (value) {
			case this.token_membership:
				return 'argx[' + index + ']=rax;'
			case this.token_expression:
				return 'argx[' + index + ']=rax;'
			default:
				return ''
		}
	}
	/*
	 * Membership
	 */
	compile_membership (value, child, frame, stack, index) {
		return this.compile_children(this.token_membership, child, frame, stack, index)
	}
	/*
	 * Subroutine
	 */
	compile_subroutine (value, child, frame, stack, index) {
		return this.compile_children(this.token_subroutine, child, frame, stack, index)
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
		}
	}
	/*
	 * Operation
	 */
	compile_operator (value, child, frame, stack, index) {
		return this.compile_dispatch(value, child[0], frame, stack, index) + '{i64 rbx=rax;' + this.compile_dispatch(value, child[1], frame, stack, index) + this.compile_operator_operate(value, child, frame, stack, index) + '}'
	}
	compile_operator_operate (value, child, frame, stack, index) {
		return 'ops_' + (value < 0 ? -value : value) + '(' + this.compile_operator_operand(0, child[0], frame, stack, index) + ',' + this.compile_operator_operand(1, child[1], frame, stack, index) + ');'
	}
	compile_operator_operand (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_identifier:
				return this.compile_identifier_identity(value, child, frame, stack, child.state)
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
		return '{i64 rbx=0;i64 rdx=0;' + this.compile_for_construct('', child[0], frame, stack, 0) + 'while(1){' + this.compile_for_condition(value, child[0], frame, stack, 0) + this.compile_for_procedure(value, child, frame, stack, 0) + '}}'
	}
	compile_for_construct (value, child, frame, stack, index) {
		return index < child.child.length - 2 ? this.compile_for_construct(value + this.compile_dispatch(value, child.child[index], frame, stack, index), child, frame, stack, index + 1) : value
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
	compile_break (value, child, frame, stack, index) {
		return this.compile_expression(value, child, frame, stack, index)
	}
	compile_return (value, child, frame, stack, index) {
		return this.compile_expression(value, child, frame, stack, index)
	}
	compile_continue (value, child, frame, stack, index) {
		return this.compile_expression(value, child, frame, stack, index)
	}
}

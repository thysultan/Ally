import {Parser} from './Parser.js'

export class Compiler extends Parser {
	/*
	 * Entry
	 */
	compile_program (value, child, frame, stack, index) {
		return this.compile_assemble(stack.push(this.compile_breakable(this.compile_procedure(child.value, child, frame, stack, child.index))), child, frame, stack, index)
	}
	/*
	 * Assemble
	 */
	compile_assemble (value, child, frame, stack, index) {
		return stack.join('')
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
				return this.compile_string(value, child, frame, stack, index)
			case this.token_function:
				return this.compile_function(value, child, frame, stack, index)
			default:
				return this.compile_variable(value, child, frame, stack, index)
		}
	}
	compile_number(value, child, frame, stack, index) {
		return '{f64 rbx=' + value + ';rax=flt_to_int(rbx);}'
	}
	compile_string (value, child, frame, stack, index) {
		return '{static p64 str_ ' + index + '=(p64)(' + value + ');' + 'static i64 rbx=0; if(rbx==0){rbx=str_to_any(map_to_mem(str_' + index + '));}rax=rbx;}'
	}
	compile_variable(value, child, frame, stack, index) {
		return ''
	}
	compile_function(value, child, frame, stack, index) {
		// value = '' // compile function arguments
		// value = '' // compile function procedure
		// stack[stack.length] = value // push function to stack

		switch (child.scope.token) {
			case this.token_program:
				return '{static rbx fun_to_top(arity, fun_to_any(address), env_to_top())}'
			default:
				return 'fun_to_env(arity, fun_to_any(address), env_to_env())'
		}

	}
	/*
	 * Identify
	 */
	compile_identify (value, child, frame, stack, index) {
		return 'uid_' + index
	}
	compile_identifier (value, child, frame, stack, index) {
		return this.compile_identify(value, child, frame, stack, index) + ';'
	}
	/*
	 * Definition
	 */
	compile_definition (value, child, frame, stack, index) {
		while (index < child.count) {
			frame[frame.length] = 'i64 ' + this.compile_identifier(value, child, frame, stack, index++)
		}
	}
	/*
	 * Children
	 */
	compile_children (value, child, frame, stack, index) {
		switch (child?.token) {
			case this.token_literal:
				return this.compile_literal(child.props, child, frame, stack, child.index)
			case this.token_statement:
				return this.compile_statement(child.props, child.child, frame, stack, index)
			case this.token_procedure:
				return this.compile_procedure(value, child, [], stack, child.index)
			case this.token_identifier:
				return this.compile_identifier(value, child, frame, stack, child.index)
			case this.token_expression:
				return this.compile_expression(value, child, frame, stack, index)
			default:
				return ''
		}
	}
	compile_procedure (value, child, frame, stack, index) {
		this.compile_definition(value, child, child.token ? frame : stack, stack, index)

		for (var entry of child.child) {
			frame[frame.length] = this.compile_children(value, entry, frame, stack, index)
		}

		return this.compile_assemble(value, child, frame, frame, index)
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
		switch (child?.value) {
			case this.token_operator:
				return '{' + this.compile_operation(value = child.props, child = child.child, frame, stack, index) + this.compile_operator(value, child, frame, stack, index) + '}'
			default:
				return ''
		}
	}
	/*
	 * Operator
	 */
	compile_operation (value, child, frame, stack, index) {
		switch (value) {
			case this.token_sequence:
				throw 'TODO: sequence'
			case this.token_argument:
				throw 'TODO: argument'
			default:
				return this.compile_children(value, child[0], frame, stack, index) + 'i64 rbx=rax;' + this.compile_children(value, child[1], frame, stack, index)
		}
	}
	compile_operator (value, child, frame, stack, index) {
		return 'ops_' + Math.abs(value) + '(' + this.compile_operand(0, child[0], frame, stack, index) + ',' + this.compile_operand(1, child[1], frame, stack, index) + ');'
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
		return this.compile_operation(value, child, frame, stack, index)
	}
	compile_return (value, child, frame, stack, index) {
		return this.compile_operation(value, child, frame, stack, index)
	}
	compile_continue (value, child, frame, stack, index) {
		return this.compile_operation(value, child, frame, stack, index)
	}
	/*
	 * Statement
	 */
	compile_else (value, child, frame, stack, index) {
		return child ? 'else if(1){' + this.compile_children(value, child, frame, stack, index) + '}' : ''
	}
	compile_do (value, child, frame, stack, index) {
		return 'while(1){' + this.compile_children(value, child[0], frame, stack, index) + this.compile_children(value, child[1], frame, stack, index) + 'if(!any_to_int(rax))break;' + '}'
	}
	compile_while (value, child, frame, stack) {
		return 'while(1){' + this.compile_children(value, child[0], frame, stack, index) + 'if(!any_to_int(rax))break;' + this.compile_children(value, child[1], frame, stack, index) + '}'
	}
	compile_if (value, child, frame, stack) {
		return this.compile_children(value, child[0], frame, stack, index) + 'if(any_to_int(rax)){' + this.compile_children(value, child[1], frame, stack, index) + '}' + this.compile_else(value, child[2], frame, stack, index)
	}
	compile_case (value, child, frame, stack) {
		return this.compile_children(value, child[0], frame, stack, index) + 'if(any_to_cmp(rcx,rax)){' + this.compile_children(value, child[1], frame, stack, index) + '}' + this.compile_children(value, child[2], frame, stack, index)
	}
	compile_switch (value, child, frame, stack) {
		return this.compile_children(value, child[0], frame, stack, index) + 'do{i64 rcx=rax;' + this.compile_children(value, child[1], frame, stack, index) + this.compile_children(value, child[2], frame, stack, index) + '}while(0);'
	}
	compile_for (value, child, frame, stack) {
		throw 'TODO: for'
	}
	compile_try (value, child, frame, stack) {
		throw 'TODO: try'
	}
	compile_catch (value, child, frame, stack) {
		throw 'TODO: catch'
	}
	compile_finally (value, child, frame, stack) {
		throw 'TODO: finally'
	}
	/*
	 * Utility
	 */
	compile_argument (value, child, frame, stack) {
		throw 'TODO: argument'
	}
	compile_breakable (value) {
		return 'do{' + value + '}while(0);'
	}
}

import {Parser} from './Parser.js'

const op = ['#define op2620402760(a,b)(bit_to_var(a.bit = b.bit))\n']

export class Compiler extends Parser {
	compile_program (value, child, frame, stack) {
		return this.compile_assemble(stack.push('int main(int argc, char** argv){' + this.compile_procedure(0, child, frame, stack) + '}'), child, frame, stack)
	}
	compile_assemble (value, child, frame, stack) {
		return stack.join(';') + ';'
	}
	compile_register (value, child) {
		return value + '=' + child + ';'
	}
	compile_identify (value) {
		return value > 0 ? value : -value
	}
	compile_identifier (value, child, frame, stack) {
		return child.ident = 'id' + child.index + '_' + child.scope
	}
	compile_literal (value, child, frame, stack) {
		switch (child.types) {
			case this.token_string:
				return 'str_to_var(' + child.props + ')'
			case this.token_float:
			case this.token_integer:
				return 'flt_to_var(' + child.props + ')'
			case this.token_literal:
				return this.compile_literal(value, child.child[0], frame, stack)
		}
	}
	compile_statement (value, child, frame, stack) {
		switch (value) {
			case this.token_as: return this.compile_as(value, child, frame, stack)
			case this.token_do: return this.compile_do(value, child, frame, stack)
			case this.token_if: return this.compile_if(value, child, frame, stack)
			case this.token_for: return this.compile_for(value, child, frame, stack)
			case this.token_try: return this.compile_try(value, child, frame, stack)
			case this.token_else: return this.compile_else(value, child, frame, stack)
			case this.token_case: return this.compile_case(value, child, frame, stack)
			case this.token_catch: return this.compile_catch(value, child, frame, stack)
			case this.token_while: return this.compile_while(value, child, frame, stack)
			case this.token_switch: return this.compile_switch(value, child, frame, stack)
			case this.token_import: return this.compile_import(value, child, frame, stack)
			case this.token_extends: return this.compile_extends(value, child, frame, stack)
			case this.token_finally: return this.compile_finally(value, child, frame, stack)
		}
	}
	compile_procedure (value, child, frame, stack) {
		for (var entry of child.stack) {
			frame.push(this.compile_definition(value, entry, frame, stakc))
		}

		for (var entry of child.child) {
			switch (entry.value) {
				case this.token_statement: frame.push(this.compile_statement(entry.types, entry.child[0], frame, stack))
					break
				case this.token_expression: frame.push(this.compile_register(this.compile_expression(entry.types, entry, frame, stack)))
					break
			}
		}

		return this.compile_assemble(value, child, frame, frame)
	}
	compile_expression (value, child, frame, stack) {
		switch (child.types) {
			case this.token_operator:
				return this.compile_operator(child.props, child.child, frame, stack)
			case this.token_literal:
				return this.compile_register('r64', this.compile_literal(value, child, frame, stack))
			case this.token_typing:
			case this.token_identifier:
				return this.compile_register('r64', child.ident)
			case this.token_operator:
				return this.compile_register('r64', 'r64')
			default:
				return ''
		}
	}
	compile_operator (value, child, frame, stack) {
		switch (value) {
			case this.token_throw:
			case this.token_break:
			case this.token_return:
			case this.token_continue:
				throw 'TODO: keywords'
			case this.token_sequence:
				throw 'TODO: sequence'
			case this.token_argument:
				throw 'TODO: argument'
			default:
				return '{' + this.compile_expression(value, child[0]) + this.compile_register('u64 l64', 'r64') + this.compile_expression(value, child[1]) + this.compile_operation(value, child, frame, stack) + '}'
		}
	}
	compile_operation (value, child, frame, stack) {
		return this.compile_register('r64', 'op' + this.compile_identify(value) + '(' + this.compile_operand(0, child[0], frame, stack) + ',' + this.compile_operand(1, child[1], frame, stack) + ')')
	}
	compile_operand (value, child, frame, stack) {
		return child.index ? child.ident : !value ? 'l64' : 'r64'
	}
	compile_definition (value, child, frame, stack) {
		return 'u64 ' + this.compile_identifier(value, entry, frame, stack)
	}
	compile_try (value, child, frame, stack) {
		throw 'TODO: try'
	}
	compile_catch (value, child, frame, stack) {
		throw 'TODO: catch'
	}
	compile_extends (value, child, frame, stack) {
		throw 'TODO: extends'
	}
	compile_finally (value, child, frame, stack) {
		throw 'TODO: finally'
	}
	compile_for (value, child, frame, stack) {
		throw 'TODO: for'
		// return 'for(' + this.compile_expression(value, child.child[0], frame, stack) + ')' + '{' + this.compile_procedure(value, child.child[1], [], stack) + '}'
	}
	compile_do (value, child, frame, stack) {
		throw 'TODO: do'
		// return 'do{' + this.compile_procedure(value, child.child[0], [], stack) + '}'
	}
	compile_else (value, child, frame, stack) {
		return 'else{' + this.compile_procedure(value, child.child[0], [], stack) + '}'
	}
	compile_while (value, child, frame, stack) {
		return 'while(1)' + '{' + this.compile_if(value, child, frame, stack) + 'else{break;}' '}'
	}
	compile_if (value, child, frame, stack) {
		return this.compile_expression(value, child.child[0], frame, stack) + 'if(var_to_bit(r64))' + '{' + this.compile_procedure(value, child.child[1], [], stack) + '}'
	}
	compile_switch (value, child, frame, stack) {
		return this.compile_expression(value, child.child[0], frame, stack) + 'switch(0)' + '{default:' + this.compile_procedure(value, child.child[1], [], stack) + '}'
	}
	compile_case (value, child, frame, stack) {
		return this.compile_if(value, child, frame, stack)
	}
	compile_argument (value, child, frame, stack) {
		return ''
	}
	compile_throw (value, child, frame, stack) {
		return this.compile_operator(value, child, frame, stack, child)
	}
	compile_break (value, child, frame, stack) {
		return this.compile_operator(value, child, frame, stack, child)
	}
	compile_return (value, child, frame, stack) {
		return this.compile_operator(value, child, frame, stack, child)
	}
	compile_continue (value, child, frame, stack) {
		return this.compile_operator(value, child, frame, stack, child)
	}
}

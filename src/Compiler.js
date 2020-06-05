import {Parser} from './Parser.js'

const op = ['#define op2620402760(a,b)a=b\n']

export class Compiler extends Parser {
	compile_program (value, child) {
		return op.join('') + this.compile_procedure(0, child, [])
	}
	compile_register (value, child) {
		return value + '=' + child + ';'
	}
	compile_identify (value) {
		return value > 0 ? value : -value
	}
	compile_identifier (value, child) {
		return child.ident = 'id' + child.index
	}
	compile_literal (value, child) {
		switch (child.types) {
			case this.token_float:
			case this.token_integer:
				return this.compile_register('rax', child.props + 'LL')
			case this.token_string:
				return ''
			case this.token_literal:
				return this.compile_literal(value, child.child[0])
		}
	}
	compile_operation (value, child, right) {
		return '{' + right + this.compile_register('rax', 'op' + this.compile_identify(value) + '(' + (child.index ? child.ident : 'rdx') + ',rax)') + '}'
	}
	compile_operator (value, child, right) {
		switch (value) {
			case this.token_throw:
			case this.token_break:
			case this.token_return:
			case this.token_continue:
				return child.child.length ? '{' + this.compile_expression(value, child.child[0]) + compile_identify(value) + '(rax);' + '}' : '{' + compile_identify(value) + '(0);' + '}'
			default:
				return this.compile_operation(value, child, this.compile_expression(value, child) + this.compile_register('var rdx', 'rax') + this.compile_expression(value, right))
		}
	}
	compile_expression (value, child) {
		switch (child.types) {
			case this.token_operator:
				return this.compile_operator(child.props, child.child[0], child.child[1])
			case this.token_literal:
				return this.compile_literal(value, child)
			case this.token_identifier:
				return this.compile_register('rax', child.ident)
		}

		return ''
	}
	compile_statement (value, child) {
		switch (value) {
			case this.token_as: return this.compile_as(value, child)
			case this.token_do: return this.compile_do(value, child)
			case this.token_if: return this.compile_if(value, child)
			case this.token_for: return this.compile_for(value, child)
			case this.token_try: return this.compile_try(value, child)
			case this.token_else: return this.compile_else(value, child)
			case this.token_case: return this.compile_case(value, child)
			case this.token_catch: return this.compile_catch(value, child)
			case this.token_while: return this.compile_while(value, child)
			case this.token_switch: return this.compile_switch(value, child)
			case this.token_import: return this.compile_import(value, child)
			case this.token_extends: return this.compile_extends(value, child)
			case this.token_finally: return this.compile_finally(value, child)
		}
	}
	compile_procedure (value, child, frame) {
		for (var entry of child.scope) {
			frame.push(this.compile_register('var ' + this.compile_identifier(value, entry), 0))
		}

		for (var entry of child.child) {
			switch (entry.value) {
				case this.token_statement: frame.push(this.compile_statement(entry.types, entry.child[0]))
					break
				case this.token_expression: frame.push(this.compile_expression(entry.types, entry))
					break
			}
		}

		return frame.join('')
	}
	compile_try (child) {
		throw 'TODO: try'
	}
	compile_catch (value, child) {
		throw 'TODO: catch'
	}
	compile_extends (value, child) {
		throw 'TODO: extends'
	}
	compile_finally (value, child) {
		throw 'TODO: finally'
	}
	compile_for (child) {
		switch (child.value) {
			case this.token_statement:
				return this.compile_expression(value, child.child[0]) + 'for(rax)' + '{' + this.compile_procedure(value, child.child[1], []) + '}'
		}
	}
	compile_switch (value, child) {
		switch (child.value) {
			case this.token_statement:
				return this.compile_expression(value, child.child[0]) + 'switch(rax)' + '{default:' + this.compile_procedure(value, child.child[1], []) + '}'
		}
	}
	compile_case (value, child) {
		switch (child.value) {
			case this.token_statement:
				return this.compile_if(value, child)
		}
	}
	compile_do (value, child) {
		switch (child.value) {
			case this.token_expression:
				return 'do{' + this.compile_expression(value, child) + '}'
			default:
				return 'do{' + this.compile_procedure(value, child.child[0], []) + '}'
		}
	}
	compile_else (value, child) {
		switch (child.value) {
			case this.token_expression:
				return 'else{' + this.compile_expression(value, child) + '}'
			case this.token_statement:
				return 'else{' + this.compile_procedure(value, child.child[0], []) + '}'
		}
	}
	compile_if (value, child) {
		switch (child.value) {
			case this.token_expression:
				return this.compile_expression(value, child) + 'if(rax)'
			case this.token_statement:
				return this.compile_expression(value, child.child[0]) + 'if(rax){' + this.compile_procedure(value, child.child[1], []) + '}'
		}
	}
	compile_while (value, child) {
		switch (child.value) {
			case this.token_expression:
				return this.compile_expression(value, child) + 'while(rax)'
			case this.token_statement:
				return this.compile_expression(value, child.child[0]) + 'while(rax){' + this.compile_procedure(value, child.child[1], []) + '}'
		}
	}
	compile_arguments(value, child) {
		return ''
	}
	compile_await (value, child) {
		return this.compile_operator(value, child)
	}
	compile_throw (value, child) {
		return this.compile_operator(value, child)
	}
	compile_break (value, child) {
		return this.compile_operator(value, child)
	}
	compile_return (value, child) {
		return this.compile_operator(value, child)
	}
	compile_continue (value, child) {
		return this.compile_operator(value, child)
	}
}

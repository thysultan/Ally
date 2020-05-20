import {Lexer} from './Lexer.js'

export class Parser extends Lexer {
	parse_program () {
		return this.parse_validate(this.parse_delimiter(0, [], 0), this.scan_prev(), [])
	}
	parse_validate (value, owner, scope) {
		value.owner = owner
		value.scope = scope

		for (var entry of value.child) {
			switch (entry.value) {
				case this.token_statement:
					switch (entry.props) {
						case this.token_procedure: this.parse_validate(entry, entry, entry.scope = [])
							break
						default:
							this.parse_validate(entry, owner, scope)
					}
					break
				case this.token_expression:
					switch (entry.props) {
						case this.token_declaration: scope.push(entry)
					}
				default:
					this.parse_validate(entry, owner, scope)
			}
		}

		return value
	}
	parse_delimiter (value, child, index) {
		while (this.parse_next()) {
			child[index++] = this.parse_maybe(0, this.scan_prev())
		}

		return this.scan_node(value, 0, 0, child)
	}
	parse_node () {
		switch (this.scan_char(0)) {
			// ] } ) \0
			case 93: case 125: case 41: case 0: this.scan_move(0)
				return
			// [ { (
			case 91: case 123: case 40:
				return this.parse_delimiter(this.scan_read(), [], this.scan_move(0))
			// \t \n \s ;
			case 9: case 10: case 32: this.lexer_whitespace(this.scan_move(32))
				return this.parse_node()
			// # ; @
			case 35: case 59: case 64: this.scan_move(0)
				return this.parse_node()
			// " '
			case 34: case 39:
				return this.parse_string(this.scan_addr() - this.lexer_string(this.scan_move(this.scan_read())))
			// /
			case 47:
				if (this.lexer_comment(this.scan_look(1))) {
					return this.parse_node()
				}
		}

		if (this.scan_numb(this.scan_read())) {
			return this.parse_number(this.lexer_number(0))
		} else if (this.scan_word(this.scan_read())) {
			return this.parse_symbol(this.lexer_identifier(2166136261, this.scan_addr()))
		} else {
			return this.parse_operator(this.lexer_operator(2166136261, this.scan_addr()))
		}
	}
	parse_peek () {
		if (this.scan_next()) {
			return this.scan_prev(this.scan_next())
		} else {
			return this.scan_prev(this.scan_next(this.parse_node()))
		}
	}
	parse_next () {
		try {
			return this.parse_peek()
		} finally {
			this.scan_next(null)
		}
	}
	parse_maybe (value, child) {
		return this.parse_operation(value, this.parse_token(value, child), this.parse_peek())
	}
	parse_token (value, child) {
		switch (child?.value) {
			case this.token_typing:
				return this.parse_typing(child, this.parse_next())
			case this.token_literal:
				return this.parse_literal(child)
			case this.token_keyword:
				return this.parse_keyword(child.props, child)
			case this.token_operator:
				return this.parse_operation(value, child, child)
			case this.token_procedure:
				return this.parse_expression(value, child.value, child)
			case this.token_identifier:
			case this.token_membership:
			case this.token_expression:
				return this.parse_identifier(value, child, this.parse_peek())
		}

		return child
	}
	parse_operation (value, child, right) {
		switch (right?.value) {
			case this.token_operator:
				if (child == right || this.token_unary(right.props)) {
					return this.parse_maybe(value, this.parse_expression(0, right.props, [child, this.parse_token(right.props, this.parse_next())]))
				} else if (this.token_precedence(right.props) > this.token_precedence(value)) {
					return this.parse_maybe(value, this.parse_expression(0, right.props, [child, this.parse_next(), this.parse_maybe(right.props, this.parse_next())]))
				}
		}

		return child
	}
	parse_typing (value, child) {
		switch (child?.value) {
			case this.token_identifier:
				return this.parse_expression(value.props, this.token_declaration, [value, child])
			case this.token_expression:
				return this.parse_expression(value.props, this.token_typing, [value, child])
		}

		return this.parse_exception(this.token_typing, child.value, [value, child])
	}
	parse_literal (value) {
		switch (value.types) {
			case this.token_string:
				return this.parse_expression(value.types, value.value, [value])
			case this.token_integer:
				return this.parse_expression(value.types, value.value, [value])
		}

		return this.parse_expression(value.types, value.props, [value])
	}
	parse_identifier (value, child, right) {
		switch (right?.value) {
			case this.token_membership:
				return this.parse_identifier(value, this.parse_expression(0, -this.token_membership, [child, this.parse_next()]), this.parse_peek())
			case this.token_expression:
				return this.parse_identifier(value, this.parse_expression(0, -this.token_expression, [child, this.parse_next()]), this.parse_peek())
			case this.token_operator:
				switch (right.props) {
					case this.token_returns:
						return this.parse_statement(0, this.token_procedure, [child, this.parse_expression(0, right.props, [this.parse_maybe(0, this.parse_next())])])
				}
				break
			case this.token_procedure:
				if (value != this.token_sequence) {
					return this.parse_statement(0, this.token_procedure, [child, this.parse_next()])
				}
		}

		return this.parse_expression(0, child.props, [child])
	}
	parse_keyword (value, child) {
		switch (value) {
			case this.token_if:
			case this.token_for:
			case this.token_try:
			case this.token_else:
			case this.token_case:
			case this.token_await:
			case this.token_catch:
			case this.token_while:
			case this.token_switch:
			case this.token_extends:
			case this.token_finally:
			case this.token_break:
			case this.token_throw:
			case this.token_return:
			case this.token_continue:
				switch ((child = this.parse_maybe(0, this.parse_next())).value) {
					case this.token_statement:
					case this.token_expression:
						return this.parse_statement(0, value, [child])
				}
				break
			case this.token_import:
				switch ((child = this.parse_maybe(0, this.parse_next())).value) {
					case this.token_expression:
						return this.parse_statement(0, value, [child, this.parse_maybe(0, this.parse_next())])
				}
				break
			case this.token_as:
				switch ((child = this.parse_maybe(0, this.parse_next())).value) {
					case this.token_expression:
						return this.parse_statement(0, value, [child])
				}
				break
			case this.token_true:
			case this.token_false:
				return this.parse_literal(child)
		}

		return this.parse_exception(this.token_statement, value, [child])
	}
	parse_number (value) {
		return this.scan_node(this.token_literal, value % 1 ? this.token_float : this.token_integer, value, [])
	}
	parse_string (value) {
		return this.scan_node(this.token_literal, this.token_string, value, [])
	}
	parse_symbol (value) {
		return this.scan_node(this.token_identify(value), 0, value, [])
	}
	parse_operator (value) {
		return this.scan_node(this.token_operator, 0, value, [])
	}
	parse_statement (types, props, child) {
		return this.scan_node(this.token_statement, types, props, child)
	}
	parse_expression (types, props, child) {
		return this.scan_node(this.token_expression, types, props, child)
	}
	parse_exception (types, props, child) {
		throw new Error(types)
	}
}

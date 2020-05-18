import {Lexer} from './Lexer.js'

export class Parser extends Lexer {
	parse_node () {
		switch (this.scan_char(0)) {
			// ] } ) \0
			case 93: case 125: case 41: case 0: this.scan_move(0)
				return
			// [ { (
			case 91: case 123: case 40:
				return this.parse_children(this.scan_read(), [], this.scan_move(0))
			// \t \n \s ;
			case 9: case 10: case 32: this.lexer_whitespace(this.scan_move(32))
				return this.parse_node()
			// # ; @
			case 35: case 59: case 64: this.scan_move(0)
				return this.parse_node()
			// " '
			case 34: case 39:
				return this.scan_node(this.token_literal, this.token_string, this.scan_addr() - this.lexer_string(this.scan_move(this.scan_read())), [])
			// /
			case 47:
				if (this.lexer_comment(this.scan_look(1))) {
					return this.parse_node()
				}
		}

		if (this.scan_numb(this.scan_read())) {
			return this.scan_node(this.token_literal, this.token_integer, this.lexer_number(0), [])
		} else if (this.scan_word(this.scan_read())) {
			return this.scan_node(this.token_identify(this.scan_flag(this.lexer_identifier(2166136261, this.scan_addr()))), 0, this.scan_flag(), [])
		} else {
			return this.scan_node(this.token_operator, 0, this.lexer_operator(2166136261, this.scan_addr()), [])
		}
	}
	parse_peek () {
		if (this.scan_next()) {
			return this.scan_root(this.scan_next())
		} else {
			return this.scan_root(this.scan_next(this.parse_node()))
		}
	}
	parse_next () {
		try {
			return this.parse_peek()
		} finally {
			this.scan_next(null)
		}
	}
	parse_program () {
		return this.parse_children(0, [], 0)
	}
	parse_validate (value, child) {
		// for (var entry of child.child) {
		// 	switch (entry.owner = value, entry.value) {
		// 		case this.token_statement:
		// 			switch (entry.props) {
		// 				case this.token_procedure: parse_validate(entry, entry)
		// 					break
		// 			}
		// 			break
		// 		case this.token_expression:
		// 			switch (entry.props) {
		// 				case this.token_declaration: value.scope.push(entry)
		// 					break
		// 				default: parse_validate(value, entry)
		// 			}
		// 			break
		// 	}
		// }

		return value
		// for (var child of value.child) {parse_validate(child)}
	}
	parse_children (value, child, index, scope) {
		while (this.parse_next()) {
			child[index++] = this.parse_maybe(0, this.scan_root())
		}

		return value * index == 40 ? child[0] : this.scan_node(value, 0, 0, child)
	}
	parse_maybe (value, child, scope) {
		return this.parse_operator(value, this.parse_token(value, child), this.parse_peek())
	}
	parse_token (value, child, scope) {
		switch (child.value) {
			case this.token_typing:
				return this.parse_typing(child, this.parse_token(value, this.parse_next()))
			case this.token_literal:
				return this.parse_literal(child)
			case this.token_keyword:
				return this.parse_keyword(child.props, child)
			case this.token_operator:
				return this.parse_operator(value, child, child)
			case this.token_procedure:
				return this.parse_expression(value, child.value, child)
			case this.token_identifier:
			case this.token_membership:
			case this.token_expression:
				if (value != this.token_sequence) {
					return this.parse_identifier(child, this.parse_peek())
				}
		}

		return child
	}
	parse_operator (value, child, right, scope) {
		switch (right?.value) {
			case this.token_operator:
				if (child == right) {
					return this.parse_maybe(value, this.parse_expression(0, right.props, [child, this.parse_token(right.props, this.parse_next())]))
				} else if (this.token_unary(right.props)) {
					return this.parse_maybe(value, this.parse_expression(0, right.props, [child, this.parse_token(right.props, this.parse_next())]))
				} else if (this.token_precedence(right.props) > this.token_precedence(value)) {
					return this.parse_maybe(value, this.parse_expression(0, right.props, [child, this.parse_next(), this.parse_maybe(right.props, this.parse_next())]))
				}
		}

		return child
	}
	parse_typing (value, child, scope) {
		switch (child?.value) {
			case this.token_identifier:
				return this.parse_expression(value.props, this.token_declaration, [value, child])
			case this.token_expression:
				return this.parse_expression(value.props, this.token_typing, [value, child])
		}

		return this.parse_exception(this.token_typing, child.value, [value, child])
	}
	parse_literal (value, child, scope) {
		switch (child.types) {
			case this.token_string:
				return this.parse_expression(child.types, child.value, [child])
			case this.token_integer:
				return this.parse_expression(child.types = child.props % 1 ? this.token_float : this.token_integer, child.value, [child])
		}

		return this.parse_expression(child.types, child.props, [child])
	}
	parse_identifier (value, child, scope) {
		switch (child?.value) {
			case this.token_procedure:
				return this.parse_statement(0, this.token_procedure, [value, this.parse_next()])
			case this.token_membership:
				return this.parse_identifier(this.parse_expression(0, -this.token_membership, [value, this.parse_next()]), this.parse_peek())
			case this.token_expression:
				return this.parse_identifier(this.parse_expression(0, -this.token_expression, [value, this.parse_next()]), this.parse_peek())
			case this.token_operator:
				if (child.props == this.token_returns) {
					return this.parse_statement(0, this.token_procedure, [value, this.parse_expression(0, child.props, this.parse_maybe(0, this.parse_next()))])
				}
		}

		return value.value == this.token_expression ? value : this.parse_expression(1, value.props, [value])
	}
	parse_keyword (value, child, scope) {
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
	parse_statement (types, props, child) {
		return this.scan_node(this.token_statement, types, props, child)
	}
	parse_expression (types, props, child) {
		return this.scan_node(this.token_expression, types, props, child)
	}
	parse_exception (types, props, child) {
		throw types
	}
}

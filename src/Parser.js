import {Lexer} from './Lexer.js'

export class Parser extends Lexer {
	parse_program (value, child, frame, stack, index) {
		throw this.parse_validate(value, child = this.parse_group(value, child, []), frame, stack, index, child)
	}
	parse_validate (value, child, frame, stack, index, scope) {
		for (var [offset, entry] of child.child.entries()) {
			entry.index = index = scope.count
			child.frame = frame
			child.scope = scope

			switch (entry.token) {
				case this.token_identifier:
					switch (entry.types) {
						case this.token_undefined: child.child[offset] = this.parse_reference(entry.props, entry, frame, stack, index)
							break
						default: frame[scope.count++] = entry
					}
					continue
				case this.token_literal:
					switch (entry.types) {
						case this.token_function:
							stack[stack.length] = entry
					}
					continue
				default: this.parse_validate(entry.props, entry, frame, [], index, scope)
			}
		}

		for (var entry of stack) {
			this.parse_validate(scope.value, entry, frame, [], index, entry)
		}

		return child
	}
	parse_reference (value, child, frame, stack, index) {
		while (index--) {
			if (value == frame[index].props) {
				return frame[index]
			}
		}

		throw this.parse_exception('cannot find variable')
	}
	/*
	 * Provider
	 */
	parse_number (value) {
		return this.lexer_node(this.token_literal, value % 1 ? this.token_float : this.token_integer, value, [])
	}
	parse_string (value) {
		return this.lexer_node(this.token_literal, this.token_string, value, [])
	}
	parse_symbol (value) {
		return this.lexer_node(this.token_identify(value), value, value, [])
	}
	parse_operator (value) {
		return this.lexer_node(this.token_operator, 0, value, [])
	}
	parse_function (value, props, child) {
		return this.lexer_node(this.token_literal, this.token_function, props, child)
	}
	parse_statement (value, props, child) {
		return this.lexer_node(this.token_statement, value, props, child)
	}
	parse_procedure (value, props, child) {
		return this.lexer_node(this.token_procedure, value, props, child)
	}
	parse_expression (value, props, child) {
		return this.lexer_node(this.token_expression, value, props, child)
	}
	/*
	 * Consumer
	 */
	parse_node () {
		switch (this.lexer_char(0)) {
			// ] } ) \0
			case 93: case 125: case 41: case 0:
				return
			// [ { (
			case 91: case 123: case 40:
				return this.parse_group(this.lexer_move(this.lexer_read()), null, [])
			// \t \n \r \s ;
			case 9: case 10: case 13: case 32: this.lexer_whitespace(this.lexer_move(0))
				return this.parse_node()
			// " '
			case 34: case 39:
				return this.parse_string(this.lexer_addr() - this.lexer_string(this.lexer_move(this.lexer_read())))
			// /
			case 47:
				if (this.lexer_comment(this.lexer_look(1))) {
					return this.parse_node()
				}
			default:
				if (this.lexer_numb(this.lexer_read())) {
					return this.parse_number(this.lexer_number(0))
				} else if (this.lexer_word(this.lexer_read())) {
					return this.parse_symbol(this.lexer_identifier(2166136261, this.lexer_addr()))
				} else {
					return this.parse_operator(this.lexer_operator(2166136261, this.lexer_addr()))
				}
		}
	}
	parse_next () {
		try {
			return this.parse_peek()
		} finally {
			this.lexer_root(null)
		}
	}
	parse_peek () {
		return this.lexer_root() || this.lexer_root(this.parse_node())
	}
	parse_group (value, child, frame) {
		while (child = this.parse_next()) {
			if (child = this.parse_dispatch(value, child)) {
				frame[frame.length] = child
			}
		}

		return this.lexer_node(this.lexer_move(value), value, value, frame)
	}
	/*
	 * Parser
	 */
	parse_typings (value, child) {
		switch (child?.token) {
			case this.token_literal:
			case this.token_expression:
			case this.token_identifier:
				return this.parse_literal(value.props, child)
			default:
				return this.parse_typings(value, this.parse_next())
		}
	}
	parse_literal (value, child) {
		switch (child.token) {
			case this.token_literal:
				switch (child.value) {
					case this.token_float:
					case this.token_string:
					case this.token_integer:
						child.types = child.value
				}
			default:
				child.types = value
		}

		return child
	}
	parse_keyword (value, child, right, props) {
		switch (value) {
			case this.token_do:
				if (child = this.parse_dispatch(value, this.parse_next())) {
					switch (this.parse_next()?.props) {
						case this.token_while:
							return this.parse_statement(this.token_keyword, value, [child, this.parse_dispatch(value, this.parse_next())])
					}
				}
				break
			case this.token_if:
			case this.token_for:
			case this.token_while:
			case this.token_switch:
				if (child = this.parse_dispatch(value, this.parse_next())) {
					switch (child.token) {
						case this.token_procedure:
						case this.token_statement:
							right = child
							child = this.parse_symbol(this.token_true)
						default:
							if (right.token == this.token_keyword ? right = this.parse_dispatch(value, this.parse_next()) : right) {
								return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_else ? [child, right, this.parse_dispatch(value, this.parse_next())] : [child, right])
							}
					}
				}
				break
			case this.token_else:
				if (child = this.parse_dispatch(value, this.parse_next())) {
					switch (props) {
						case this.token_if:
						case this.token_while:
						case this.token_switch:
							return this.parse_statement(this.token_keyword, value, [child])
					}
				}
				break
			case this.token_case:
				if (child = this.parse_dispatch(value, this.parse_next())) {
					if (right = this.parse_dispatch(value, this.parse_next())) {
						return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_case ? [child, right, this.parse_dispatch(value, this.parse_next())] : [child, right])
					}
				}
				break
			case this.token_try:
				if (child = this.parse_dispatch(value, this.parse_next())) {
					switch (child.props) {
						case this.token_catch:
						case this.token_finally:
							break
						default:
							if (right = this.parse_dispatch(value, this.parse_next())) {
								switch (right.props) {
									case this.token_catch:
										return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_finally ? [child, right, this.parse_dispatch(value, this.parse_next())] : [child, right])
									case this.token_finally:
										return this.parse_statement(this.token_keyword, value, [child, right])
								}
							}
					}
				}
				break
			case this.token_catch:
				switch (props) {
					case this.token_try:
					case this.token_catch:
						if (child = this.parse_dispatch(value, this.parse_next())) {
							switch (child.token) {
								case this.token_statement:
								case this.token_procedure:
									right = child
									child = this.parse_expression(value, value, [])
								default:
									if (right.token == this.token_keyword ? right = this.parse_dispatch(value, this.parse_next()) : right) {
										return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_catch ? [child, right, this.parse_dispatch(value, this.parse_next())] : [child, right])
									}
							}
						}
				}
				break
			case this.token_finally:
				if (child = this.parse_dispatch(value, this.parse_next())) {
					switch (props) {
						case this.token_try:
						case this.token_finally:
							return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_finally ? [child, this.parse_dispatch(value, this.parse_next())] : [child])
					}
				}
				break
			case this.token_import:
				if (child = this.parse_next()) {
					switch (child.token) {
						case this.token_literal:
						case this.token_identifier:
							return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_as ? [child, this.parse_dispatch(value, this.parse_next())] : [child])
					}
				}
				break
			case this.token_as:
				if (child = this.parse_next()) {
					switch (props) {
						case this.token_import:
							switch (child.token) {
								case this.token_literal:
								case this.token_procedure:
								case this.token_identifier:
									return this.parse_statement(this.token_keyword, value, [child])
							}
					}
				}
				break
			case this.token_throw:
			case this.token_break:
			case this.token_return:
			case this.token_continue:
				switch (this.lexer_whitespace(this.token_undefined)) {
					case this.token_undefined:
						if (child = this.parse_peek()) {
							switch (child.token) {
								case this.token_keyword:
									if (this.token_intermediate(child.props)) {
										break
									}
								default:
									return this.parse_statement(this.token_keyword, value, [this.parse_dispatch(value, this.parse_next())])
							}
						}
					default:
						return this.parse_statement(this.token_keyword, value, [])
				}
		}

		return this.parse_exception('keyword syntax')
	}
	parse_dispatch (value, child) {
		return this.parse_operation(value, this.parse_children(value, child), this.parse_peek())
	}
	parse_children (value, child) {
		switch (child?.token) {
			case this.token_typings:
				return this.parse_typings(child, this.parse_next())
			case this.token_literal:
				return this.parse_literal(child.value, child)
			case this.token_keyword:
				return this.parse_keyword(child.props, child, child, value)
			case this.token_operator:
				return this.parse_operation(value, child, child)
			case this.token_identifier:
			case this.token_expression:
				return this.parse_identifier(value, child, this.parse_peek())
			default:
				return child
		}
	}
	parse_operation (value, child, right) {
		switch (right?.token) {
			case this.token_expression:
				return this.parse_definition(child.types, child, right)
			case this.token_operator:
				if (this.token_collection(value) && this.token_terminal(right.props)) {
					this.parse_next()
				} else if (child == right || this.token_unary(right.props)) {
					return this.parse_dispatch(value, this.parse_expression(this.token_operator, right.props, [child, this.parse_children(right.props, this.parse_next())]))
				} else if (this.token_precedence(right.props) > this.token_precedence(value)) {
					return this.parse_dispatch(value, this.parse_expression(this.token_operator, right.props, [child, this.parse_dispatch(this.parse_next().props, this.parse_next())]))
				}
		}

		return child
	}
	parse_identifier (value, child, right) {
		switch (right?.token) {
			case this.token_membership:
			case this.token_expression:
				return this.parse_children(value, this.parse_expression(this.token_operator, right.token, [child, this.parse_dispatch(value, this.parse_next())]))
			case this.token_operator:
				if (right.props == this.token_subroutine) {
					if (this.token_identify(value) == this.token_identifier) {
						switch (child.token) {
							case this.token_identifier:
								child = this.parse_expression(this.token_expression, value, [child])
							case this.token_expression:
								value = this.token_subroutine
						}
					}
				} else {
					break
				}
			case this.token_procedure:
				if (child.value == this.token_expression) {
					switch (this.token_identify(value)) {
						case this.token_identifier:
							return this.parse_literal(value, this.parse_function(value, value, [child, value == this.token_subroutine ? this.parse_dispatch(value, this.parse_next()) : this.parse_next()]))
					}
				}
		}

		return child
	}
	parse_definition (value, child, right) {
		switch (value) {
			case this.token_function:
			case this.token_definition:
				return this.parse_expression(this.token_operator, this.token_assignment, [child, this.parse_dispatch(this.token_assignment, this.parse_next())])
			default:
				return child
		}
	}
	/*
	 * Exception
	 */
	parse_exception (value, props, child) {
		throw new Error(value)
	}
}

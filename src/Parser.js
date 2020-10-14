import {Lexer} from './Lexer.js'

export class Parser extends Lexer {
	parse_program (value, child, frame, stack, index) {
		throw this.parse_validate(value, child = this.parse_group(value, child, []), child, stack, index, 0, [])
	}
	parse_validate (value, child, frame, stack, index, state, queue) {
		for (var entry of child.child) {
			entry.index = index - frame.index
			entry.frame = frame

			switch (entry.token) {
				case this.token_identifier:
					switch (this.token_identify(entry.types)) {
						case this.token_identifier:
							switch (value) {
								case this.token_object: entry.child = this.parse_property(value, value, entry)
								case this.token_parameters: child.props == value ? value : value = -value
									break
								default:
									if (this.parse_reference(value, entry, child, stack, index)) {
										continue
									} else {
										this.parse_deference(child.token, entry, frame, child.child, 0)
									}
							}
						default: stack[index++] = entry
					}
					continue
				case this.token_literal:
					switch (entry.types) {
						case this.token_function:
						case this.token_definition:
							queue[queue.length] = entry
						default:
							continue
					}
				case this.token_subroutine:
					switch (child.token) {
						case this.token_expression:
						case this.token_membership: this.parse_validate(entry.types = this.token_object, entry, entry, stack, index, state + 1, queue)
							continue
						default: this.parse_validate(value, entry, entry, stack, index, state + 1, queue)
							continue
					}
				default:
					switch (entry.props) {
						case this.token_parameters: this.parse_validate(entry.props, entry, frame, stack, index, state, queue)
							break
						default:
							this.parse_validate(value, entry, frame, stack, index, state, queue)
					}
			}

			index = index + frame.count
		}

		frame.count = index - frame.index

		switch (child.token) {
			case this.token_expression:
				switch (child.props) {
					case this.token_assignment:
					case this.token_assignment_optional:
						child.child[0].types = child.child[1]
				}
				break
			default:
				for (var entry of queue) {
					this.parse_validate(value, entry, entry, stack, 0, state + 1, [])
				}
		}

		return child
	}
	parse_reference (value, child, frame, stack, index) {
		while (index--) {
			if (value = stack[index]) {
				if (child.props == value.props) {
					return frame.child[child.index] = value
				}
			}
		}
	}
	parse_deference (value, child, frame, stack, index) {
		switch (value) {
			case this.token_assignment:
			case this.token_definition:
				if (child == stack[index++]) {
					return child.types = stack[index].types
				}
		}

		return this.parse_exception(child.child, value, child)
	}
	/*
	 * Provider
	 */
	parse_number (value) {
		return this.lexer_node(this.token_literal, value % 1 ? this.token_float : this.token_integer, value, null)
	}
	parse_string (value, props, child) {
		return props == 64 ? this.parse_template(value, this.parse_string(value, value, child)) : this.lexer_node(this.token_literal, this.token_string, value, child)
	}
	parse_template (value, child) {
		return this.parse_expression(this.token_operator, this.token_addition, [child, this.parse_expression(this.token_operator, this.token_addition, [this.parse_root(), this.parse_node(value, [])])])
	}
	parse_property (value, props, child) {
		return this.lexer_subs(child.value, child.caret)
	}
	parse_identity (value, props) {
		return this.lexer_node(this.token_identify(value), props, value, null)
	}
	parse_operator (value, props) {
		return this.lexer_node(this.token_operator, value, value, null)
	}
	parse_function (value, props, child) {
		return this.lexer_node(this.token_literal, this.token_function, props, child)
	}
	parse_statement (value, props, child) {
		return this.lexer_node(this.token_subroutine, this.token_statement, props, [this.lexer_node(this.token_statement, value, props, child)])
	}
	parse_subroutine (value, props, child) {
		return this.lexer_node(this.token_subroutine, value, props, child)
	}
	parse_expression (value, props, child) {
		return this.lexer_node(this.token_expression, value, props, child)
	}
	/*
	 * Consumer
	 */
	parse_next () {
		try {
			return this.parse_peek()
		} finally {
			this.lexer_root(null)
		}
	}
	parse_peek () {
		return this.lexer_root() || this.lexer_root(this.parse_root())
	}
	parse_root () {
		return this.parse_node(this.lexer_char(0), null)
	}
	parse_node (value, child) {
		switch (value) {
			// ] } ) \0
			case 93: case 125: case 41: case 0:
				return
			// [ { (
			case 91: case 123: case 40:
				return this.parse_group(this.lexer_move(value), value, [])
			// \t \n \s
			case 9: case 10: case 32: this.lexer_whitespace(this.lexer_move(value))
				return this.parse_root()
			// @
			case 64: this.lexer_move(value)
				return this.parse_root()
			// " '
			case 34: case 39:
				return this.parse_string(value, this.lexer_string(child ? value : this.lexer_move(value), this.lexer_addr(), 0, child ? child : child = []), child)
			// /
			case 47:
				if (this.lexer_comment(this.lexer_look(1))) {
					return this.parse_root()
				}
			default:
				if (this.lexer_numb(value)) {
					return this.parse_number(this.lexer_number(0))
				} else if (this.lexer_word(value)) {
					return this.parse_identity(this.lexer_identity(0, value = this.lexer_addr()), value)
				} else {
					return this.parse_operator(this.lexer_operator(0, value = this.lexer_addr()), value)
				}
		}
	}
	parse_group (value, child, frame) {
		while (child = this.parse_next()) {
			if (child = this.parse_dispatch(value/value, child)) {
				frame[frame.length] = child
			}
		}

		return this.lexer_node(value ? this.lexer_move(value) : value, value, value, frame)
	}
	/*
	 * Parser
	 */
	parse_literal (value, child) {
		switch (child.token) {
			case this.token_literal:
				value = child.value
			default:
				child.types = value
		}

		return child
	}
	parse_typings (value, child, right) {
		switch (right?.token) {
			case this.token_literal:
			case this.token_expression:
				return this.parse_expression(this.token_operator, right.types = value, [right, right])
			case this.token_identifier:
				switch (right.types = value) {
					case this.token_function:
					case this.token_definition:
						return this.parse_declaration(value, right, this.parse_peek())
				}
				break
			default:
				return this.parse_typings(value, child, this.parse_next())
		}

		return right
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
						case this.token_statement:
						case this.token_subroutine:
							right = child
							child = this.parse_identity(this.token_true)
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
								case this.token_subroutine:
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
								case this.token_subroutine:
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
				switch (this.lexer_whitespace(value)) {
					case value:
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
			case this.token_literal:
				return this.parse_literal(child.value, child)
			case this.token_typings:
				return this.parse_typings(child.props, child, this.parse_next())
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
			case this.token_membership:
			case this.token_expression:
				right.types = this.token_object
			case this.token_operator:
				switch (right.props) {
					case this.token_separator:
						if (value != right.props) {
							switch (value) {
								case value:
									return this.parse_dispatch(value, this.parse_separator(right.props, [child], right))
								default: this.parse_next()
							}
						}
						break
					default:
						if (child == right || this.token_unary(right.props)) {
							return this.parse_dispatch(value, this.parse_expression(this.token_operator, right.props, [child, this.parse_children(right.props, this.parse_next())]))
						} else if (this.token_precedence(right.props) > this.token_precedence(value)) {
							return this.parse_dispatch(value, this.parse_expression(this.token_operator, right.props, [child, this.parse_dispatch(this.parse_next().props, this.parse_next())]))
						}
				}
		}

		return child
	}
	parse_separator (value, child, right) {
		while (value == this.parse_peek()?.props) {
			child[child.length] = this.parse_next().token == this.parse_peek()?.token ? this.parse_expression(value, value, []) : this.parse_dispatch(value, this.parse_next())
		}

		return this.parse_expression(this.token_operator, right.props, child)
	}
	parse_identifier (value, child, right) {
		switch (right?.token) {
			case this.token_operator:
				if (right.props == this.token_deroutine) {
					if (this.token_identify(value) == this.token_identifier) {
						switch (child.token) {
							case this.token_identifier:
								child = this.parse_expression(this.token_expression, value, [child])
							case this.token_expression:
								right = this.parse_subroutine(value = this.token_subroutine, value, [this.parse_expression(this.token_operator, this.token_return, [right, this.parse_dispatch(value, this.parse_next())])])
						}
					}
				} else {
					break
				}
			case this.token_subroutine:
				if (child.value == this.token_expression) {
					if (this.token_identify(value) == this.token_identifier) {
						return this.parse_literal(value, this.parse_function(child.props = this.token_parameters, right.token = right.value = right.props = child.value, [child, value == this.token_subroutine ? right : this.parse_next()]))
					}
				}
		}

		return child
	}
	parse_declaration (value, child, right) {
		switch (right?.token) {
			case this.token_expression:
				return this.parse_expression(this.token_operator, this.token_assignment, [child, this.parse_dispatch(this.token_assignment, this.parse_next())])
			case this.token_subroutine:
				return this.parse_identifier(this.token_operator, this.parse_expression(this.token_expression, value, []), this.parse_next())
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

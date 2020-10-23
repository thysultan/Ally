import {Lexer} from './Lexer.js'

export class Parser extends Lexer {
	/*
	 * Scan
	 */
	parse_node () {
		return this.parse_scan(this.lexer_char(0), null)
	}
	parse_peek () {
		return this.lexer_next() || this.lexer_next(this.parse_node())
	}
	parse_next () {
		try {
			return this.parse_peek()
		} finally {
			this.lexer_next(null)
		}
	}
	parse_skip () {
		return this.parse_next() this.parse_next()
	}
	parse_prev (value) {
		return this.lexer_next(value)
	}
	parse_scan (value, child) {
		switch (value) {
			// ] } ) \0
			case 93: case 125: case 41: case 0:
				return
			// [ { (
			case 91: case 123: case 40:
				return this.lexer_move(this.parse_collection(this.lexer_move(value), value, []))
			// @
			case 64: this.lexer_move(value)
				return this.parse_node()
			// \t \n \s
			case 9: case 10: case 32: this.lexer_whitespace(this.lexer_move(value))
				return this.parse_node()
			// " '
			case 34: case 39:
				return this.parse_template(value, this.lexer_template(child ? value : this.lexer_move(value), this.lexer_addr(), child ? child : child = []), child)
			// /
			case 47:
				if (this.lexer_comment(this.lexer_look(1))) {
					return this.parse_node()
				}
			default:
				if (this.lexer_numb(value)) {
					return this.parse_number(this.lexer_number(0))
				} else if (this.lexer_word(value)) {
					return this.parse_identity(this.lexer_identity(0, value = this.lexer_addr(), 0), value)
				} else {
					return this.parse_operator(this.lexer_operator(0, value = this.lexer_addr(), 0), value)
				}
		}
	}
	/*
	 * Node
	 */
	parse_number (value) {
		return this.lexer_node(this.token_literal, value % 1 ? this.token_float : this.token_integer, value, null)
	}
	parse_string (value, props, child) {
		return this.lexer_node(this.token_literal, this.token_string, value, child)
	}
	parse_template (value, props, child) {
		return props == 64 ? this.parse_substrings(value, props, this.parse_string(value, value, child)) : this.parse_string(value, props, child)
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
		return this.lexer_node(this.token_subroutine, this.token_enviroment, props, [this.lexer_node(this.token_statement, value, props, child)])
	}
	parse_expression (value, props, child) {
		return this.lexer_node(this.token_expression, value, props, child)
	}
	parse_substrings (value, props, child) {
		return this.lexer_node(this.token_expression, this.token_operator, this.token_addition, [child, this.parse_expression(this.token_operator, this.token_concatenation, [this.parse_node(), this.parse_scan(value, [])])])
	}
	parse_collection (value, props, child) {
		while (value = this.parse_next()) {
			if (value = this.parse_dispatch(props, value, value, props)) {
				child[child.length] = value
			}
		}

		return this.lexer_node(props, props, props, child)
	}
	/*
	 * Parse
	 */
	parse_program (value, child) {
		return this.parse_verify(0, child = this.parse_collection(value, this.token_subroutine, []), child, [], 0, 0, 0, [])
	}
	parse_literal (value, child) {
		switch (child.token) {
			case this.token_literal: value = child.value
			default: child.types = value
		}

		return child
	}
	parse_typings (value, child, right, props) {
		switch (right?.token) {
			case this.token_literal:
			case this.token_expression:
				return this.parse_expression(this.token_operator, this.token_typings, [child, right])
			case this.token_subroutine:
				break
			case this.token_identifier:
				switch (right.types = value) {
					case this.token_function:
					case this.token_definition:
						if (child = this.parse_peek()) {
							switch (child.token) {
								case this.token_expression: child = this.parse_dispatch(this.token_operator, this.parse_next(), child, this.token_expression)
									break
								case this.token_subroutine: child = this.parse_identifier(this.token_operator, this.parse_expression(this.token_expression, value, []), this.parse_next(), props)
									break
							}
							switch (child.value) {
								case this.token_function:
									return this.parse_expression(this.token_operator, this.token_assignment, [right, this.parse_literal(value, child)])
							}
						}
				}
				break
			default:
				return this.parse_typings(value, child, this.parse_next(), props)
		}

		return right
	}
	parse_dispatch (value, child, right, props) {
		return this.parse_priority(value, this.parse_children(value, child, child, props), this.parse_peek(), props)
	}
	parse_children (value, child, right, props) {
		switch (child?.token) {
			case this.token_literal:
				return this.parse_literal(value, child)
			case this.token_typings:
				return this.parse_typings(child.props, child, this.parse_next(), props)
			case this.token_keyword:
				return this.parse_keywords(child.props, child, child, value)
			case this.token_operator:
				return this.parse_priority(value, child, child, props)
			case this.token_membership:
				return this.parse_membership(value, child, child, props)
			case this.token_subroutine:
				return this.parse_subroutine(value, child, child, props)
			case this.token_expression:
			case this.token_identifier:
				return this.parse_identifier(value, child, this.parse_peek(), props)
			default:
				return child
		}
	}
	parse_priority (value, child, right, props) {
		switch (right?.token) {
			case this.token_expression: right.types = this.token_object
			case this.token_membership:
			case this.token_operator:
				switch (props = right.props) {
					case this.token_terminate:
					case this.token_separator:
						if (child != right) {
							if (value != props) {
								switch (value) {
									case this.token_expression:
									case this.token_membership:
									case this.token_subroutine: this.parse_next()
										break
									default: this.parse_separate(value, child = this.parse_expression(this.token_expression, props, [child]), right, props)
								}
							}
						} else {
							return this.parse_expression(value = this.token_expression, value, [this.parse_prev(right)])
						}
						break
					default:
						switch (child == right ? 3 : this.token_argument(props)) {
							case 1: return this.parse_priority(value, this.parse_expression(this.token_operator, props, [child, this.parse_next()]), this.parse_peek(), props)
							case 2: return this.parse_dispatch(value, this.parse_expression(this.token_operator, props, [child, this.parse_dispatch(props, this.parse_skip(), child, this.token_expression)]))
							case 3: return this.parse_priority(value, this.parse_expression(this.token_operator, props, [child, this.parse_dispatch(props, this.parse_next(), child, this.token_expression)]), this.parse_peek(), props)
						}
				}
				break
		}

		return child
	}
	parse_separate (value, child, right, props) {
		do {
			if (value = this.parse_next()) {
				if (value = this.parse_dispatch(props, this.parse_next(), child, this.token_expression)) {
					child.child[child.child.length] = value
				}
			}
		} while (props == this.parse_peek()?.props)
	}
	parse_keywords (value, child, right, props) {
		switch (value) {
			case this.token_do:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					if (right = this.parse_next()) {
						switch (right.props) {
							case this.token_while:
								if (right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
									return this.parse_statement(this.token_keyword, value, [child, right])
								}
						}
					}
				}
				break
			case this.token_if:
			case this.token_for:
			case this.token_while:
			case this.token_switch:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					switch (child.token) {
						case this.token_statement:
						case this.token_subroutine:
							right = child
							child = this.parse_number(value)
						default:
							if (right.token == this.token_keyword ? right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword) : right) {
								return this.parse_statement(this.token_keyword, value, [child, right])
							}
					}
				}
				break
			case this.token_else:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					return this.parse_statement(this.token_keyword, value, [child])
				}
				break
			case this.token_case:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					switch (child.props) {
						case this.token_separator: child.props = this.token_membership
						default:
							if (right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
								return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_case ? [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)] : [child, right])
							}
					}
				}
				break
			case this.token_try:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					switch (child.props) {
						case this.token_catch:
						case this.token_finally:
							break
						default:
							if (right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
								switch (right.props) {
									case this.token_catch:
										return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_finally ? [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)] : [child, right])
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
						if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
							switch (child.token) {
								case this.token_statement:
								case this.token_subroutine:
									right = child
									child = this.parse_expression(value, value, [])
								default:
									if (right.token == this.token_keyword ? right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword) : right) {
										return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_catch ? [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)] : [child, right])
									}
							}
						}
				}
				break
			case this.token_finally:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					switch (props) {
						case this.token_try:
						case this.token_finally:
							return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_finally ? [child, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)] : [child])
					}
				}
				break
			case this.token_import:
				if (child = this.parse_next()) {
					switch (child.token) {
						case this.token_literal:
						case this.token_identifier:
							return this.parse_statement(this.token_keyword, value, this.parse_peek()?.props == this.token_as ? [child, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)] : [child])
					}
				}
				break
			case this.token_as:
				switch (props) {
					case this.token_import:
						if (child = this.parse_next()) {
							switch (child.token) {
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
									switch (child.props) {
										case this.token_do:
										case this.token_if:
										case this.token_for:
										case this.token_try:
										case this.token_while:
										case this.token_switch:
											break
										default:
											child = null
									}
								default:
									return this.parse_statement(this.token_keyword, value, child ? [this.parse_dispatch(value, this.parse_next(), child, this.token_expression)] : [])
							}
						}
					default:
						return this.parse_statement(this.token_keyword, value, [])
				}
		}

		return this.parse_report('keyword syntax')
	}
	parse_identifier (value, child, right, props) {
		switch (right?.token) {
			case this.token_operator:
				if (right.props == this.token_direction) {
					switch (props) {
						case this.token_keyword:
							break
						default:
							switch (child.token) {
								case this.token_identifier:
									child = this.parse_expression(this.token_expression, value, [child])
								case this.token_expression:
									right = this.parse_expression(this.token_expression, value, [this.parse_expression(this.token_operator, value = this.token_return, [right, this.parse_dispatch(value, this.parse_next(), child, this.token_expression)])])
							}
					}
				} else {
					break
				}
			case this.token_subroutine:
				if (child.value == this.token_expression) {
					switch (props) {
						case this.token_keyword:
							break
						default: child = this.parse_function(child.props = this.token_parameters, right.token = child.value, [child, value == this.token_subroutine ? right : this.parse_next()])
					}
				}
		}

		return child
	}
	parse_membership (value, child, right, props) {
		switch (props) {
			case this.token_expression:
			case this.token_membership: child.types = this.token_object
			case this.token_subroutine:
				break
		}

		return child
	}
	parse_subroutine (value, child, right, props) {
		switch (props) {
			case this.token_expression:
			case this.token_membership: child.types = this.token_object
			case this.token_subroutine:
				break
		}

		return child
	}
	parse_definition (value, child) {
		switch (value.types) {
			case this.token_definition: child.types = this.token_object
			default: return child
		}
	}
	parse_parameters (value, child) {
		for (var entry of child.child) {
			switch (entry.token) {
				case this.token_identifier: entry.types ? value : entry.types = this.token_variable
					break
				case this.token_expression:
					switch (entry.props) {
						switch this.token_assignment: entry.props = this.token_assignment_optional
						default:
							if (this.token_assignee(entry.props)) {
								for (var entry of entry.child) {
									return this.parse_parameters(value, entry)
								}
							}
					}
			}
		}
	}
	/*
	 * Verify
	 */
	parse_lookup (value, child, frame, stack, index, count) {
		while (count--) {
			if (value = stack[count]) {
				if (child.props == value.props) {
					return frame.child[index] = value
				}
			}
		}
	}
	parse_verify (value, child, frame, stack, index, count, state, queue) {throw console.log(child)
		for (var entry of child.child) {
			entry.index = index = count - frame.index
			entry.state = state
			entry.count = count
			entry.frame = frame

			switch (entry.token) {
				case this.token_identifier:
					if (entry.types == 0) {
						if (this.parse_lookup(value, entry, child, stack, index, count)) {
							continue
						} else {
							switch (child.props) {
								case this.token_assignment:
									if (index == 0) {
										break
									}
								default: this.parse_report(value, value, child)
							}
						}
					}
					switch (frame.types) {
						case this.token_object: entry.child = this.parse_property(value, value, entry)
						default: stack[count++] = entry
					}
					continue
				case this.token_literal:
					switch (entry.value) {
						case this.token_float:
						case this.token_string:
						case this.token_integer:
							break
						case this.token_function:
							queue[queue.length] = entry
						default:
							if (index == 1) {
								if (child.props == this.token_assignment) {
									this.parse_definition(child.child[index - 1], entry)
								}
							}
					}
					continue
				case this.token_operator:
					switch (child.props) {}
					continue
				case this.token_subroutine:
					switch (child.token) {
						case this.token_expression:
						case this.token_membership: entry.types = this.token_object
						default: this.parse_verify(entry.types, entry, entry, stack, 0, count, entry.token == this.token_membership ? state : state + 1, queue)
					}
					continue
				default:
					switch (entry.props) {
						case this.token_spread_iterable: this.parse_verify(value, entry, frame, stack, value == this.token_object ? child.count++ : value, count, state, queue)
							break
						case this.token_parameters: this.parse_verify(value, entry, frame, stack, this.parse_parameters(value, entry), count, -1, queue)
							break
						default:
							this.parse_verify(entry.props, entry, frame, stack, 0, count, state, queue)
					}
			}

			count = entry.count
		}

		child.count = count
		frame.count = count - frame.index

		switch (child.token) {
			case this.token_expression: child.index = -1
				if (child.index == state) {
					if (this.token_assignee(child.props)) {
						for (var entry of child.child) {
							switch (entry.token) {
								case this.token_identifier: child.index = entry.index
								default: return child
							}
						}
					}
				}
				break
			default:
				for (var entry of queue) {
					this.parse_verify(entry.token, entry, entry, stack, 0, count, state + 1, [])
				}
		}

		return child
	}
	/*
	 * Report
	 */
	parse_report (value, props, child) {
		throw new Error(value)
	}
}

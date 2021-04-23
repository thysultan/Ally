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
			case 34: case 39: case -34: case -39:
				return this.parse_template(this.lexer_template(value < 0 ? -value : this.lexer_move(value), value = this.lexer_head(), child = []), value, child)
			// /
			case 47:
				if (this.lexer_comment(this.lexer_look(1))) {
					return this.parse_node()
				}
			default:
				if (this.lexer_numb(value)) {
					return this.parse_number(this.lexer_number(0))
				} else if (this.lexer_word(value)) {
					return this.parse_identity(this.lexer_identity(0, value = this.lexer_head(), 0), value, this.lexer_head())
				} else {
					return this.parse_operator(this.lexer_operator(0, value = this.lexer_head(), 0), value, this.lexer_head())
				}
		}
	}
	/*
	 * Node
	 */
	parse_number (value) {
		return this.lexer_node(this.token_literal, this.token_number, this.lexer_tail(), value)
	}
	parse_string (value, props, child) {
		return this.lexer_node(this.token_literal, this.token_string, this.lexer_head() - props - 1, child)
	}
	parse_variable (value) {
		return this.lexer_node(this.token_literal, this.token_variable, value, value)
	}
	parse_template (value, props, child) {
		return value < 0 ? this.parse_substrings(value, props, this.parse_string(value, props, child)) : this.parse_string(value, props, child)
	}
	parse_identity (value, props, child) {
		return this.lexer_node(this.token_identity(value), this.token_identifier, this.token_identify(value), this.lexer_subs(props, child))
	}
	parse_operator (value, props, child) {
		return this.lexer_node(this.token_operator, this.token_operator, value, 0)
	}
	parse_function (value, props, child) {
		return this.lexer_node(this.token_literal, this.token_function, this.token_enviroment, child)
	}
	parse_statement (value, props, child) {
		return this.lexer_node(this.token_statement, value, value, child)
	}
	parse_procedure (value, props, child) {
		return this.lexer_node(this.token_subroutine, this.token_enviroment, value, [this.parse_statement(value, value, child)])
	}
	parse_operation (value, props, child) {
		return this.lexer_node(this.token_expression, this.token_operations, props, child)
	}
	parse_expression (value, props, child) {
		return this.lexer_node(this.token_expression, value, props, child)
	}
	parse_substrings (value, props, child) {
		return this.lexer_node(this.token_expression, this.token_operations, this.token_addition, [child, this.parse_operation(value, this.token_addition, [this.parse_node(), this.parse_scan(value, child)])])
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
		return this.parse_verify(value, child = this.parse_collection(value, this.token_subroutine, []), child, [], 0, 0, 0, child, [])
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
				return this.parse_operation(value, value, [child, right])
			case this.token_identifier:
				switch (right.types = value) {
					case this.token_function:
					case this.token_definite:
						if (child = this.parse_peek()) {
							switch (child.token) {
								case this.token_expression: child = this.parse_dispatch(props, this.parse_next(), child, this.token_properties)
									break
								case this.token_subroutine: child = this.parse_identifier(props, this.parse_expression(this.token_expression, props, []), this.parse_next(), props)
									break
							}
							switch (child.value) {
								case this.token_function:
									return this.parse_operation(value, this.token_assignment, [right, child])
								default: this.parse_prev(child)
							}
						}
				}
				break
			case this.token_membership:
			case this.token_subroutine: this.parse_identifiee(value, right, right, props)
				break
			default: this.parse_report('invalid variable')
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
			case this.token_expression:
			case this.token_identifier:
				return this.parse_identifier(value, child, this.parse_peek(), props)
			case this.token_membership:
			case this.token_subroutine:
				switch (props) {
					case this.token_membership:
					case this.token_expression: child.types = child.token
				}
			default:
				return child
		}
	}
	parse_priority (value, child, right, props) {
		switch (right?.value) {
			case this.token_identifier:
				if (right.token == this.token_operator) {
					if (this.token_property(value)) {
						return this.parse_children(value, child, child.token = this.token_identifier, props)
					}
				} else {
					break
				}
			case this.token_operator:
				switch (props) {
					case this.token_keyword: value = props
					default:
						switch (props = right.props) {
							case this.token_terminate:
							case this.token_separator:
								if (child != right) {
									if (value != props) {
										switch (value) {
											case this.token_keyword: this.parse_separate(value, child = this.parse_expression(this.token_expression, props, [child]), right, props)
												break
											default: this.parse_next()
										}
									}
								} else {
									return this.parse_expression(value = this.token_expression, value, [this.parse_prev(right)])
								}
								break
							default:
								if (child == right) {
									return this.parse_dispatch(value, this.parse_operation(value, props, [child, this.parse_children(props, this.parse_next(), child, this.token_expression)]), child, props)
								} else {
									switch (this.token_argument(props)) {
										case 1:
											return this.parse_dispatch(value, this.parse_operation(value, props, [child, this.parse_next()]), child, props)
										case 2:
											if (this.token_priority(props) >= this.token_priority(value)) {
												return this.parse_dispatch(value, this.parse_operation(value, props, [child, this.parse_next() && this.parse_dispatch(props, this.parse_next(), child, this.token_expression)]), child, props)
											}
									}
								}
						}
				}
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
									switch (this.parse_peek()?.props) {
										case this.token_else:
											return this.parse_procedure(value, value, [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)])
										default:
											return this.parse_procedure(value, value, [child, right])
									}
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
							child = this.parse_variable(this.token_true)
						default:
							if (right.token == this.token_keyword ? right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword) : right) {
								switch (this.parse_peek()?.props) {
									case this.token_else:
										return this.parse_procedure(value, value, [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)])
									default:
										return this.parse_procedure(value, value, [child, right])
								}
							}
					}
				}
				break
			case this.token_case:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					if (right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
						switch (child.props) {
							case this.token_separator:
								child = this.parse_expression(this.token_expression, value, child.child.map(child => this.parse_statement(value, value, [child])))
							default:
								switch (this.parse_peek()?.props) {
									case this.token_case:
									case this.token_else:
										return this.parse_statement(value, value, [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)])
									default:
										return this.parse_statement(value, value, [child, right])
								}
						}
					}
				}
				break
			case this.token_else:
				if (child = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)) {
					return this.parse_statement(value, value, [child])
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
										return this.parse_procedure(value, value, this.parse_peek()?.props == this.token_finally ? [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)] : [child, right])
									case this.token_finally:
										return this.parse_procedure(value, value, [child, right])
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
									child = this.parse_expression(this.token_expression, value, [])
								default:
									if (right.token == this.token_keyword ? right = this.parse_dispatch(value, this.parse_next(), child, this.token_keyword) : right) {
										switch (this.parse_peek()?.props) {
											case this.token_catch:
												return this.parse_statement(value, value, [child, right, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)])
											default:
												return this.parse_statement(value, value, [child, right])
										}
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
							return this.parse_statement(value, value, this.parse_peek()?.props == this.token_finally ? [child, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)] : [child])
					}
				}
				break
			case this.token_import:
				if (child = this.parse_next()) {
					switch (child.token) {
						case this.token_literal:
						case this.token_identifier:
							switch (this.parse_peek()?.props) {
								case this.token_as:
									return this.parse_statement(value, value, [child, this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)])
								default:
									return this.parse_statement(value, value, [child])
							}
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
									return this.parse_statement(value, value, [child])
							}
						}
				}
				break
			case this.token_throw:
			case this.token_break:
			case this.token_return:
			case this.token_continue:
				if (this.lexer_whitespace(value) == value) {
					if (child = this.parse_peek()) {
						switch (child.token) {
							case this.token_keyword:
								switch (child.props) {
									case this.token_else:
									case this.token_case:
									case this.token_catch:
									case this.token_finally: child = right
								}
								break
							case this.token_operator:
								switch (child.props) {
									case this.token_terminate:
									case this.token_separator: child = right
									case this.token_properties: this.parse_next()
								}
								break
						}
					} else {
						child = right
					}
				}

				return this.parse_statement(value, value, child == right ? [] : [this.parse_dispatch(value, this.parse_next(), child, this.token_expression)])
		}

		return this.parse_report('keyword syntax', child)
	}
	parse_indexation (value, child, right, props) {
		return child.child.reduce((child, right) => this.parse_operation(value, this.token_membership, [child, right]), child)
	}
	parse_invocation (value, child, right, props) {
		return this.parse_children(value, this.parse_operation(value, this.token_expression, [child, right]), right.props = this.token_membership, props)
	}
	parse_identifier (value, child, right, props) {
		switch (right?.token) {
			case this.token_operator:
				if (right.props == this.token_direction) {
					switch (props) {
						case this.token_keyword:
							return child
						default:
							switch (child.value) {
								case this.token_identifier: child = this.parse_expression(this.token_expression, value, [child])
								case this.token_expression: right = this.parse_operation(value, value = right.props, [this.parse_next(), this.parse_dispatch(value, this.parse_next(), child, props)])
							}
					}
				} else {
					break
				}
			case this.token_subroutine:
				if (child.value == this.token_expression) {
					switch (props) {
						case this.token_keyword:
							return child
						default: this.parse_parameters(child.types = child.props = this.token_parameters, child, right, props)
							return this.parse_function(right.token = right.props = right.value = this.token_expression, child, [child, value == this.token_direction ? right : this.parse_next()])
					}
				}
				break
			case this.token_membership: return this.token_property(value) ? child : this.parse_indexation(value, child, this.parse_next(), props)
			case this.token_expression: return this.token_property(value) ? child : this.parse_invocation(value, child, this.parse_next(), props)
		}

		return child
	}
	parse_identifiee (value, child, right, props) {
		switch (child.token) {
			case this.token_iterable:
			case this.token_membership:
			case this.token_subroutine: this.parse_parameters(value, child, child.token = this.token_expression, props)
				break
			case this.token_identifier: value ? child.types ||= this.token_variable : value
				break
			case this.token_expression:
				switch (child.props) {
					case this.token_initialize:
					case this.token_assignment: child.props = this.token_assignment_optional
					default:
						if (this.token_assignee(child.props)) {
							this.parse_identifiee(value, child.child[value - value], right, props)
						}
				}
				break
		}
	}
	parse_parameters (value, child, right, props) {
		for (var entry of child.child) {
			this.parse_identifiee(value, entry, right, props)
		}
	}
	/*
	 * Verify
	 */
	parse_verify (value, child, frame, stack, index, count, state, scope, queue) {
		for (var entry of child.child) {
			entry.frame = frame
			entry.scope = scope
			entry.state = state
			entry.index = count

			switch (entry.token) {
				case this.token_literal:
					switch (entry.value) {
						case this.token_function: queue[queue.length] = entry
							if (index) {
								switch (child.props) {
									case this.token_initialize:
									case this.token_assignment:
										switch (child.child[index - index].types) {
											case this.token_definite: entry.types = entry.child[index].types = this.token_subroutine
												break
										}
								}
							}
					}
				case this.token_operator:
					break
				case this.token_identifier: entry.index = count - frame.index
					if (!entry.types) {
						if (this.token_property(index ? child.props : index)) {
							break
						} else if (this.parse_lookup(value, entry, frame, stack, 0, count, state, scope)) {
							if (child.types == this.token_subroutine) {
								child.child[index] = this.parse_operation(entry = {...entry, index, state}, this.token_assignment, [entry, child.child[index]])
							} else {
								break
							}
						} else {
							switch (child.props) {
								case this.token_initialize:
								case this.token_assignment:
									if (!index) {
										break
									}
								default: this.parse_report('undefined variable', entry)
							}
						}
					} else if (this.parse_lookup(value, entry, frame, stack, child.types == this.token_subroutine ? frame.index : count, count, state, scope)) {
						break
					}
				case this.token_identifier: stack[count++] = entry.types = entry
					break
				case this.token_subroutine: this.parse_verify(value, entry, entry, stack, 0, count, state + 1, scope, [])
					break
				default:
					switch (entry.props) {
						case this.token_iterable:
							switch (child.token) {
								case this.token_subroutine:
									if (child.token != child.types) {
										break
									}
								case this.token_membership: child.stack++
							}
							break
						case this.token_in:
						case this.token_of:
						case this.token_initialize:
						case this.token_assignment:
						case this.token_assignment_optional:
							switch (entry.child[index - index].value) {
								case this.token_membership:
								case this.token_subroutine: this.parse_identifiee(value, entry.child[entry.value = index - index], child, value)
									break
								case this.token_identifier:
									switch (child.types) {
										case this.token_subroutine: entry.child[index - index].types ||= this.token_variable
									}
							}
							break
					}

					count = this.parse_verify(value, entry, frame, stack, 0, count, state, scope, queue).count
			}

			index++
		}

		child.count = count

		if (child == frame) {
			frame.count = count - frame.index

			for (var entry of queue) {
				this.parse_verify(value, entry, entry, stack, 0, count, state + 1, entry, []).index
			}
		}

		return child
	}
	parse_lookup (value, child, frame, stack, index, count, state, scope) {
		while (count > index) {
			if (value = stack[--count]) {
				if (child.props == value.props) {
					child.types = 0
					child.index = index = value.index
					child.state = state = value.state

					if (state < scope.state) {
						while (scope = scope.frame, state < scope.state) {
							scope.types ||= this.token_enviroment
						}
					}

					return value
				}
			}
		}
	}
	/*
	 * Report
	 */
	parse_report (value, child) {
		throw console.error(value, child?.child)
	}
}

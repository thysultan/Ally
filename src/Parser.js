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
				return this.parse_template(this.lexer_template(value < 0 ? -value : this.lexer_move(value), value = this.state_index, child = []), value, child)
			// #
			case 35:
				return this.parse_number(this.lexer_number(0))
			// /
			case 47:
				if (this.lexer_comment(this.lexer_look(1))) {
					return this.parse_node()
				}
			default:
				if (this.lexer_numb(value)) {
					return this.parse_number(this.lexer_number(this.state_caret = 0))
				} else if (this.lexer_word(value)) {
					return this.parse_identity(this.lexer_identity(0, value = this.state_index, 0), value, this.state_index)
				} else {
					return this.parse_operator(this.lexer_operator(0, value = this.state_index, 0), value, this.state_index)
				}
		}
	}
	/*
	 * Node
	 */
	parse_number (value) {
		return this.lexer_node(this.token_literal, this.token_number, this.state_caret, value)
	}
	parse_string (value, props, child) {
		return this.lexer_node(this.token_literal, this.token_string, this.state_index - props - 1, child)
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
		return this.lexer_node(this.token_statement, value, props, child)
	}
	parse_procedure (value, props, child) {
		return this.lexer_node(this.token_subroutine, this.token_enviroment, value, [this.parse_statement(value, value, child)])
	}
	parse_operation (value, props, child) {
		return this.lexer_node(this.token_expression, this.token_operator, props, child)
	}
	parse_expression (value, props, child) {
		return this.lexer_node(this.token_expression, value, props, child)
	}
	parse_substrings (value, props, child) {
		return this.lexer_node(this.token_expression, this.token_operator, this.token_addition, [child, this.parse_operation(value, this.token_addition, [this.parse_node(), this.parse_scan(value, child)])])
	}
	parse_subroutine (value, props, child) {
		return this.lexer_node(this.token_subroutine, value, props, child)
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
		return this.parse_verify(value, child = this.parse_collection(0, this.token_subroutine, []), child, [], 0, 0, 0, child, [])
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
											switch (this.lexer_look(-3)) {
												// \t \n \s
												case 9: case 10: case 32:
													return child
											}
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
			case this.token_export:
				if (child = this.parse_next()) {
					switch (child.token) {
						case this.token_identifier: child = this.parse_subroutine(value, value, [this.parse_dispatch(value, this.parse_next(), child, this.token_keyword)])
						case this.token_subroutine: child.types = this.token_subroutine
							if (this.parse_next()?.props == this.token_from) {
								if (right = this.parse_next()) {
									switch (right.token) {
										case this.token_literal:
										case this.token_identifier:
											return this.parse_statement(value, value, [this.parse_statement(this.token_import, this.token_import, [right, this.parse_identifiee(value, child, right, props)]), {...child, child: child.child.filter(child => {
												return child.token == this.token_identifier
											}).map(child => {
												return {...child}
											})}])
									}
								}
							} else {
								return this.parse_statement(value, value, [this.parse_expression(this.token_expression, value, []), child])
							}
					}
				}
				break
			case this.token_import:
				if (child = this.parse_next()) {
					switch (child.token) {
						case this.token_literal:
							return this.parse_statement(value, value, [child, this.parse_expression(this.token_expression, value, [])])
						case this.token_identifier:
						case this.token_subroutine: this.parse_identifiee(value, child, right, props)
							if (this.parse_next()?.props == this.token_from) {
								if (right = this.parse_next()) {
									switch (right.token) {
										case this.token_literal:
										case this.token_identifier:
											return this.parse_statement(value, value, [right, child])
									}
								}
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
		return right.child.reduce((right, child) => this.parse_operation(value, this.token_membership, [child, right]), child)
	}
	parse_invocation (value, child, right, props) {
		return this.parse_operation(right.props = this.token_membership, this.token_expression, [child, right])
	}
	parse_identifier (value, child, right, props) {
		switch (right?.token) {
			case this.token_operator:
				switch (props) {
					case this.token_keyword:
						break
					default:
						// parse arrow functions i.e a => ...
						if (right.props == this.token_direction) {
							switch (child.value) {
								case this.token_identifier: child = this.parse_expression(this.token_expression, value, [child])
								case this.token_expression: child = this.parse_identifier(value, child, this.parse_subroutine(value, value, [this.parse_prev(this.parse_dispatch(value, this.parse_next(this.parse_next()), right, props))]), props)
							}
						}
				}
				break
			case this.token_subroutine:
				// parse functions i.e () {} or (a) {} but avoid keyword prefixed i.e if (a) {}
				if (child.value == this.token_expression) {
					switch (props) {
						case this.token_keyword:
							return child
						default:
							return this.parse_function(this.parse_parameters(child.props = this.token_parameters, child, right, props), right.token = right.props = right.value = this.token_expression, [child, this.parse_next()])
					}
				}
				break
			// either single access or multiplex access i.e a[0] or a[0,1,2] which is unrolled to a[0][1][2]
			case this.token_membership: if (this.token_property(value)) break
				return this.parse_identifier(value, this.parse_indexation(value, child, this.parse_next(), props), this.parse_peek(), props)
			// either meethod invocation or something else i.e a.b vs a.b()
			case this.token_expression: if (this.token_property(value)) break
				return this.parse_identifier(value, this.parse_invocation(value, child, this.parse_next(), props), this.parse_peek(), props)
		}

		return child
	}
	parse_identifiee (value, child, right, props) {
		switch (child.token) {
			case this.token_membership:
			case this.token_subroutine: this.parse_parameters(value, child, child.token = this.token_expression, props)
				break
			case this.token_identifier: value ? child.types ||= this.token_variable : value
				break
			case this.token_expression:
				switch (child.props) {
					case this.token_as:
						for (var entry of child.child) {
							if (entry.token == this.token_identifier) {
								right = entry
							} else {
								return
							}
						}

						return this.parse_identifiee(value, child.child[value - index], right, child.child[value - index].props = right.props)
					case this.token_initialize:
					case this.token_assignment: child.props = this.token_assignment_optional
					default:
						if (this.token_assignee(child.props))  {
							this.parse_identifiee(value, child.child[value - value], right, props)
						}
				}
				break
		}

		return child
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
			entry.stack = count
			entry.index = count - frame.stack

			switch (entry.token) {
				case this.token_literal:
					switch (entry.value) {
						case this.token_function: queue[queue.length] = entry
							if (index) {
								switch (child.props) {
									case this.token_initialize:
									case this.token_assignment:
										switch (child.child[0].types) {
											// convert classes to functions that return an object
											// i.e def bar (a) { var b = a } is converted to fun bar (a) return {a, b: a}
											case this.token_definite: entry.types = entry.child[index].types = this.token_subroutine
												break
										}
								}
							}
					}
				case this.token_operator:
					break
				case this.token_identifier:
					// if not a definition, else if definition already defined in scope witin object, reuse initial definition i.e {var a = 1 var a = 2} is {var a = 1 a = 2}
					if (!entry.types) {
						// ignore if a property access i.e access.property
						if (this.token_property(index ? child.props : index)) {
							break
						} else if (this.parse_lookup(value, entry, frame, stack, 0, count, state, scope)) {
							// found variable, if object namespace convert i.e {a, b, c} to {a: a, b: b, c: c}
							if (child.types == this.token_subroutine) {
								child.child[index] = this.parse_operation(entry = {...entry, index, state}, this.token_assignment, [entry, child.child[index]])
							} else {
								break
							}
						} else {
							// only error if not implicit assignment, i.e a = 1 is valid if a is not in any scope a is created within scope i.e a = 1 converted to var a = 1
							switch (child.props) {
								case this.token_initialize:
								case this.token_assignment:
									if (!index) {
										break
									}
								default: this.parse_report('undefined variable', entry, child)
							}
						}
					} else if (this.parse_lookup(value, entry, frame, stack, child.types == this.token_subroutine ? frame.stack : count, count, state, scope)) {
						break
					} else {
						// value is the stack reference offset of the current module
						entry.value = value + entry.index
					}
				case this.token_identifier: stack[count++] = entry.types = entry
					break
				case this.token_subroutine: this.parse_verify(value, entry, entry, stack, 0, count, state + 1, scope, [])
					break
				default:
					switch (entry.props) {
						// upgrade reference identifier to declaration
						case this.token_as: this.parse_identifiee(value, entry, child, value)
							break
						case this.token_in:
						case this.token_of:
							// upgrade to special in/of operator used in for statements i.e for var a in b {}
							if (child.props == this.token_for) {
								entry.props = -entry.props
							}
						case this.token_initialize:
						case this.token_assignment:
						case this.token_assignment_optional:
							switch (entry.child[0].value) {
								// update destructuring syntax i.e {a, b} = c
								case this.token_membership:
								case this.token_subroutine: this.parse_identifiee(0, entry.child[0], child, entry.value = entry.props)
									break
								// a = 1
								case this.token_identifier:
									switch (child.types) {
										// upgrade assignment identifier to declaration if not already
										case this.token_subroutine: entry.child[0].types ||= this.token_variable
									}
							}
							break
						case this.token_export: this.parse_export(value, entry, frame, stack, index, count, state, scope)
							break
						case this.token_import: this.parse_import(value, entry, frame, stack, index, count, state, scope)
							break
						case this.token_membership:
						case this.token_properties:
						case this.token_properties_optional:
							// if the parent is a assigment variant
							if (this.token_assignee(child.props)) {
								entry.props = -entry.props
							}
					}

					// recurse on subexpressions, updating the count after in case where there are more declaration
					count = this.parse_verify(value, entry, frame, stack, 0, count, state, scope, queue).count
			}

			// mostly 0 or 1 for expressions, where 0 denotes the left hand side of an expression and 1 is the right
			index++
		}

		if (child == frame) {
			// traverse into function scopes
			for (var entry of queue) {
				this.parse_verify(value, entry, entry, stack, 0, count, state + 1, entry, [])
			}

			child.count = count - child.stack
		} else {
			child.count = count
		}

		return child
	}
	parse_lookup (value, child, frame, stack, index, count, state, scope) {
		while (count > index) {
			var entry = stack[--count]

			if (entry) {
				// found reference
				if (child.props == entry.props) {
					child.types = 0
					child.index = entry.index
					child.state = frame.state - entry.state

					// not a global variable or stack variable i.e is closure/object variable
					if (state = entry.state) {
						// not within the same scope i.e reference is higher up the scope chain
						if (state < scope.state) {
							// traverse up the scope chain, upgrading the scopes to heap allocated scopes as needed
							while (scope = scope.frame, state < scope.state) {
								scope.types ||= this.token_enviroment
							}
						}
					} else {
						// offset by the current modules offset
						child.value = value + entry.index
					}

					return entry
				}
			}
		}
	}
	parse_export (value, child, frame, stack, index, count, state, scope) {
		// top-level import only
		if (frame.frame) {
			return this.parse_report('invalid export', entry)
		}
	}
	parse_import (value, child, frame, stack, index, count, state, scope) {
		// top-level import only
		if (frame.frame) {
			return this.parse_report('invalid import', entry)
		}

		// WIP mambo-jambo, passes an offset to parse_program to be used for offset where globals should be registered in the stack
		for (var entry of child.child) {
			switch (entry.token) {
				case this.token_literal:
					switch (entry.value) {
						case this.token_string: index = child.index = this.state_files.indexOf(entry = child.child.join(''))
							// if the file already exits exit early
							if (index == -1) {// TODO: parse url
								return fetch(this.state_files[index = child.index = this.state_queue++] = entry).then(response => response.text()).then(value => {
									this.state_count += (child.child[0] = this.parse_program(this.state_count, this.lexer_open(value))).count
								}).then(value => {
									--this.state_queue || console.log('compile', child)
								}).catch(value => {
									this.parse_report(value, entry)
								})
							}
					}
			}
		}
	}
	/*
	 * Report
	 */
	parse_report (value, child) {
		throw console.error(value, child)
	}
}

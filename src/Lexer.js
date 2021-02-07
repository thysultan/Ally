export class Lexer {
	/*
	 * Enum
	 */
	constructor (value) {
		// state
		this.state_value = null
		this.state_child = null
		this.state_input = value
		this.state_index = 0
		this.state_token = 1
		// token nodes
		this.token_typings = 0
		this.token_literal = 1
		this.token_keyword = 2
		this.token_operator = 3
		this.token_statement = 4
		this.token_operations = 5
		this.token_identifier = 6
		this.token_enviroment = 7
		this.token_expression = 40
		this.token_parameters = 41
		this.token_membership = 91
		this.token_subroutine = 123
		// token types(int, flt, str, obj, def, fun, var, asm, nil)
		this.token_integer = -1010090581
		this.token_float = -1035006294
		this.token_string = -927081939
		this.token_object = -961308749
		this.token_definite = -1051988511
		this.token_function = -1034415909
		this.token_variable = -903543805
		this.token_assembly = -1075854633
		this.token_nullable = -969111059
		// token literals
		this.token_null = -2806273074
		this.token_true = 1853055989
		this.token_false = -1072102688
		// token keywords
		this.token_do = 1677993041
		this.token_if = 1678321027
		this.token_for = -1034809499
		this.token_try = -918951625
		this.token_else = 2979449664
		this.token_case = 1327398711
		this.token_catch = -130785800
		this.token_while = 2264520430
		this.token_switch = 3028315292
		this.token_extends = -6732737417
		this.token_finally = 2779395649
		this.token_throw = -1079622077
		this.token_break = -1009323364
		this.token_return = 3624757432
		this.token_continue = -1763732208
		this.token_import = 1926321549
		this.token_as = 1677796248
		// token keyword operators
		this.token_in = 1678321035
		this.token_of = 1678714621
		this.token_is = 1678321040
		this.token_or = 1678714633
		this.token_not = -968717457
		this.token_and = -1076182637
		this.token_void = -906308613
		this.token_yield = -3298744406
		this.token_await = 1721527123
		this.token_keyof = -734729869
		this.token_typeof = 2430491513
		this.token_sizeof = 221262240
		this.token_instanceof = -4091102314
		// token symbol operators
		this.token_terminate = -2620402762
		this.token_separator = -2620402777
		this.token_direction = 1675434631
		this.token_initialize = -2620402763
		this.token_assignment = -2620402760
		this.token_assignment_concatenation = 2620402778
		this.token_assignment_addition = 1674253848
		this.token_assignment_subtract = 1674385046
		this.token_assignment_division = 1674516244
		this.token_assignment_modulous = 1673860254
		this.token_assignment_bitwise_or = 1679567367
		this.token_assignment_bitwise_xor = 1677599397
		this.token_assignment_bitwise_and = 1673925853
		this.token_assignment_multiply = 1674188249
		this.token_assignment_exponent = -1535026183
		this.token_assignment_shift_left = -1385138311
		this.token_assignment_shift_right = -1368484103
		this.token_assignment_shift_left_unsigned = 4934952648
		this.token_assignment_shift_right_unsigned = -2077153338
		this.token_assignment_optional = 1675565828
		this.token_less_than = -2620402761
		this.token_greater_than = -2620402759
		this.token_equal_less_than = 1675369031
		this.token_equal_greater_than = 1675500229
		this.token_logical_if = -2620402758
		this.token_logical_or = 1679567430
		this.token_logical_and = 1673925830
		this.token_logical_null = 1675565830
		this.token_bitwise_or = -2620402697
		this.token_bitwise_xor = -2620402727
		this.token_bitwise_and = -2620402783
		this.token_compare = 1675434630
		this.token_uncompare = 1673597858
		this.token_deep_compare = -1376811207
		this.token_deep_uncompare = -1608133347
		this.token_shift_left = 1675369030
		this.token_shift_right = 1675500230
		this.token_shift_left_unsigned = -1385138312
		this.token_shift_right_unsigned = -1368484102
		this.token_concatenation = 2620402778
		this.token_addition = -2620402778
		this.token_subtract = -2620402776
		this.token_modulous = -2620402784
		this.token_division = -2620402774
		this.token_multiply = -2620402779
		this.token_exponent = 1674188230
		this.token_logical_not = -2620402788
		this.token_bitwise_not = -2620402695
		this.token_increment = 1674253830
		this.token_decrement = 1674385030
		this.token_properties = -2620402775
		this.token_properties_optional = 1675565813
		this.token_generate = 1674450630
		this.token_iterable = -1501717782
	}
	/*
	 * Scan
	 */
	lexer_addr () {
		return this.state_index
	}
	lexer_blob () {
		return this.state_input
	}
	lexer_jump (value) {
		return this.state_index = value
	}
	lexer_move (value) {
		return this.lexer_jump(this.lexer_addr() + 1), value
	}
	lexer_back (value) {
		return this.lexer_jump(this.lexer_addr() - 1), value
	}
	lexer_code (value) {
		return this.state_token ? this.state_token = this.lexer_blob().charCodeAt(value) | 0 : this.state_token
	}
	lexer_char (value) {
		return this.state_token = this.lexer_look(value)
	}
	lexer_scan () {
		return this.state_token
	}
	lexer_look (value) {
		return this.lexer_code(this.lexer_addr() + value)
	}
	lexer_hash (value, index) {
		return this.lexer_scan() + ((value ? value : value = 2166136261) << 6) + (value << 16) - value + index
	}
	lexer_subs (value, index) {
		return this.lexer_blob().substring(value, index)
	}
	lexer_numb (value) {
		return (value > 47 && value < 58) | 0
	}
	lexer_word (value) {
		return ((value == 95 || value > 127) || (value > 64 && value < 91) || (value > 96 && value < 123)) | 0
	}
	lexer_sign (value) {
		return ((value == 33 || value == 37 || value == 38 || value == 94 || value == 124 || value == 126) || (value > 41 && value < 48) || (value > 57 && value < 65)) | 0
	}
	lexer_next (value) {
		return arguments.length ? this.state_value = value : this.state_value
	}
	lexer_node (token, value, props, child) {
		return {token: token, value: value, props: props, child: child, caret: this.lexer_addr(), types: 0, index: 0, count: 0, state: 0, stack: 0, frame: null, scope: null}
	}
	/*
	 * Lexer
	 */
	lexer_whitespace (value) {
		while (this.lexer_char(0)) {
			if (this.lexer_scan() > 32) {
				break
			} else if (this.lexer_scan() == this.lexer_move(10)) {
				value = 10
			}
		}

		return value
	}
	lexer_comment (value) {
		switch (value) {
			// //
			case 47: this.lexer_move(this.lexer_move(0))
				while (this.lexer_char(0)) {
					if (this.lexer_move(this.lexer_scan()) == 10) {
						break
					}
				}
				return 1
			// /*
			case 42: this.lexer_move(this.lexer_move(0))
				while (this.lexer_char(0)) {
					if (this.lexer_move(this.lexer_scan()) == value) {
						if (this.lexer_char(0) == 47) {
							return this.lexer_move(1)
						}
					} else {
						this.lexer_move(0)
					}
				}
				return 1
			default: this.lexer_look(0)
		}

		return 0
	}
	lexer_number (value) {
		if (this.lexer_scan() != 48) {
			return this.lexer_decimal(0, 0)
		} else if (this.lexer_char(1) == 120) {
			return this.lexer_hexadecimal(this.lexer_move(this.lexer_move(0)))
		} else if (this.lexer_numb(this.lexer_scan())) {
			return this.lexer_octal(this.lexer_move(0))
		} else {
			return this.lexer_move(value)
		}
	}
	lexer_octal (value) {
		do {
			if (this.lexer_numb(this.lexer_scan())) {
				value = this.lexer_move(value * 8 + this.lexer_scan() - 48)
			} else if (this.lexer_word(this.lexer_scan())) {
				this.lexer_move(0)
			} else {
				break
			}
		} while (this.lexer_char(0))

		return value
	}
	lexer_binary (value, index) {
	  while (this.lexer_char(0)) {
	  	if (this.lexer_numb(this.lexer_scan())) {
	  		value += this.lexer_move(this.lexer_scan() == 49 ? index : 0)
	  		index *= 2
	  	} else if (this.lexer_word(this.lexer_scan())) {
	  		this.lexer_move(0)
	  	} else {
	  		break
	  	}
	  }

	  return value
	}
	lexer_decimal (value, index) {
		do {
			if (this.lexer_numb(this.lexer_scan())) {
				value = this.lexer_move(value * 10 + this.lexer_scan() - 48)
			} else if (this.lexer_scan() == 46 && this.lexer_look(1) != 46) {
				index = this.lexer_move(this.lexer_addr() + 1)
			} else if (this.lexer_word(this.lexer_scan())) {
				switch (this.lexer_move(this.lexer_scan())) {
					case 98:
						return this.lexer_binary(0, 1)
					case 101:
						return this.lexer_exponent(
							this.lexer_exponent(value, index ? index - this.lexer_addr() : 0),
							(this.lexer_numb(this.lexer_char(0)) || this.lexer_move((this.lexer_scan() != 45) * this.lexer_char(1)) ? 1 : -1) * this.lexer_number(0)
						)
				}
			} else {
				break
			}
		} while (this.lexer_char(0))

		return index ? this.lexer_exponent(value, index - this.lexer_addr()) : value
	}
	lexer_exponent (value, index) {
		while (index > 0) {
			value *= 10
			index -= 1
		}

		while (index < 0) {
			value /= 10
			index += 1
		}

		return value
	}
	lexer_hexadecimal (value) {
		while (this.lexer_char(0)) {
			if (this.lexer_numb(this.lexer_scan()) || this.lexer_word(this.lexer_scan())) {
				value = this.lexer_move(value * 16 + (this.lexer_scan() & 15) + (this.lexer_scan() > 65 ? 9 : 0))
			} else {
				break
			}
		}

		return value
	}
	lexer_template (value, index, props) {
		while (this.lexer_char(0)) {
			if (this.lexer_scan() == value || this.lexer_scan() == -value) {
				break
			} else {
				switch (this.lexer_scan()) {
					// "
					case 34:
					// '
					case 39: props[props.length] = this.lexer_subs(index, this.lexer_move(index = this.lexer_addr())) + '\\'
						break
					// \n
					case 10: props[props.length] = this.lexer_subs(index, this.lexer_move(index = this.lexer_addr())) + '\\n\\'
						break
					// @
					case 64: this.lexer_look(1) == 40 ? value = -value : this.lexer_move(value)
						break
					// /
					case 92: this.lexer_move(value)
					default: this.lexer_move(value)
				}
			}
		}

		props[props.length] = this.lexer_subs(index, index = this.lexer_move(this.lexer_addr()))

		return value
	}
	lexer_identity (value, index, props) {
		do {
			if (this.lexer_word(this.lexer_scan())) {
				this.lexer_move(value = this.lexer_hash(props = value, this.lexer_addr() - index))
			} else {
				break
			}
		} while (this.lexer_char(0))

		return value
	}
	lexer_operator (value, index, props) {
		do {
			if (this.lexer_sign(this.lexer_scan())) {
				if (this.token_argument(this.lexer_move(value = this.lexer_hash(props = value, this.lexer_addr() - index))) < 2) {
					return value
				}
			} else {
				break
			}
		} while (this.lexer_char(0))

		return value
	}
	/*
	 * Token
	 */
	token_priority (value) {
		switch (value) {
			// () [] {}
			case this.token_expression:
			case this.token_membership:
			case this.token_subroutine:
				return 0
			// =>
			case this.token_direction:
				return 10
			// .. ...
			case this.token_generate:
			case this.token_iterable:
				return 11
			// ?
			case this.token_logical_if:
			// ?=
			case this.token_assignment_optional:
			// :
			case this.token_initialize:
			// =
			case this.token_assignment:
				return 12
			// += -= /= %=
			case this.token_assignment_addition:
			case this.token_assignment_subtract:
			case this.token_assignment_division:
			case this.token_assignment_modulous:
			// |= ^= &=
			case this.token_assignment_bitwise_or:
			case this.token_assignment_bitwise_xor:
			case this.token_assignment_bitwise_and:
			// *= **=
			case this.token_assignment_multiply:
			case this.token_assignment_exponent:
			// <<= >>= <<<= >>>=
			case this.token_assignment_shift_left:
			case this.token_assignment_shift_right:
			case this.token_assignment_shift_left_unsigned:
			case this.token_assignment_shift_right_unsigned:
				return 13
			// ||
			case this.token_logical_or:
				return 14
			// &&
			case this.token_logical_and:
				return 15
			// ??
			case this.token_logical_null:
				return 16
			// == != === !==
			case this.token_compare:
			case this.token_uncompare:
			case this.token_deep_compare:
			case this.token_deep_uncompare:
				return 17
			// < > <= >=
			case this.token_less_than:
			case this.token_greater_than:
			case this.token_equal_less_than:
			case this.token_equal_greater_than:
				return 18
			// in of instanceof
			case this.token_in:
			case this.token_of:
			case this.token_instanceof:
				return 19
			// + -
			case this.token_addition:
				return 20
			case this.token_subtract:
				return 21
			// % / *
			case this.token_modulous:
			case this.token_division:
			case this.token_multiply:
				return 22
			// **
			case this.token_exponent:
				return 23
			// |
			case this.token_bitwise_or:
				return 24
			// ^
			case this.token_bitwise_xor:
				return 25
			// &
			case this.token_bitwise_and:
				return 26
			// << >> <<< >>>
			case this.token_shift_left:
			case this.token_shift_right:
			case this.token_shift_left_unsigned:
			case this.token_shift_right_unsigned:
				return 27
			// keyword operators
			case this.token_void:
			case this.token_await:
			case this.token_keyof:
			case this.token_typeof:
			case this.token_sizeof:
				return 28
			// ! ~ ++ --
			case this.token_logical_not:
			case this.token_bitwise_not:
			case this.token_increment:
			case this.token_decrement:
				return 29
			// . ?.
			case this.token_properties:
			case this.token_properties_optional:
				return 30
			default:
				return value == this.token_keyword ? value : 32
		}
	}
	token_identity (value) {
		switch (value) {
			// types
			case this.token_character:
			case this.token_integer:
			case this.token_float:
			case this.token_string:
			case this.token_object:
			case this.token_definite:
			case this.token_function:
			case this.token_variable:
			case this.token_assembly:
			case this.token_nullable:
				return this.token_typings
			// literals
			case this.token_null:
			case this.token_true:
			case this.token_false:
				return this.token_literal
			// keywords
			case this.token_do:
			case this.token_if:
			case this.token_for:
			case this.token_try:
			case this.token_else:
			case this.token_case:
			case this.token_catch:
			case this.token_while:
			case this.token_switch:
			case this.token_extends:
			case this.token_finally:
			case this.token_throw:
			case this.token_break:
			case this.token_return:
			case this.token_continue:
			case this.token_import:
			case this.token_as:
				return this.token_keyword
			// operators
			case this.token_in:
			case this.token_of:
			case this.token_is:
			case this.token_or:
			case this.token_not:
			case this.token_and:
			case this.token_void:
			case this.token_await:
			case this.token_keyof:
			case this.token_typeof:
			case this.token_sizeof:
			case this.token_instanceof:
				return this.token_operator
			default:
				return this.token_identifier
		}
	}
	token_identify (value) {
		switch (value) {
			// is as ==
			case this.token_is:
				return this.token_compare
			// or as ||
			case this.token_or:
				return this.token_logical_or
			// not as !=
			case this.token_not:
				return this.token_uncompare
			// and as &&
			case this.token_and:
				return this.token_logical_and
			default:
				return value
		}
	}
	token_property (value) {
		switch (value) {
			// . ?.
			case this.token_properties:
			case this.token_properties_optional:
				return 1
			default:
				return 0
		}
	}
	token_argument (value) {
		switch (value) {
			// keyword operators
			case this.token_void:
			case this.token_yield:
			case this.token_keyof:
			case this.token_typeof:
			case this.token_sizeof:
			// =>
			case this.token_direction:
			// ...
			case this.token_iterable:
			// ! ~
			case this.token_logical_not:
			case this.token_bitwise_not:
				return 0
			// ++ --
			case this.token_increment:
			case this.token_decrement:
				return 1
			default:
				return 2
		}
	}
	token_assignee (value) {
		switch (value) {
			case this.token_assignment:
			case this.token_assignment_addition:
			case this.token_assignment_subtract:
			case this.token_assignment_division:
			case this.token_assignment_modulous:
			case this.token_assignment_bitwise:
			case this.token_assignment_bitwise_xor:
			case this.token_assignment_bitwise_or:
			case this.token_assignment_multiply:
			case this.token_assignment_exponent:
			case this.token_assignment_shift_left:
			case this.token_assignment_shift_right:
			case this.token_assignment_shift_left_unsigned:
			case this.token_assignment_shift_right_unsigned:
			case this.token_assignment_optional:
				return 1
			default:
				return 0
		}
	}
}

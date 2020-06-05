export class Lexer {
	constructor (value) {
		// scan
		this.scan_value = null
		this.scan_child = null
		this.scan_input = value
		this.scan_index = 0
		this.scan_state = 0
		this.scan_token = 1
		// node
		this.token_program = 0
		this.token_typing = 1
		this.token_literal = 2
		this.token_keyword = 3
		this.token_operator = 4
		this.token_statement = 5
		this.token_identifier = 6
		this.token_procedure = 123
		this.token_expression = 40
		this.token_membership = 91
		// typing(chr, int, flt, str, obj, def, fun, var)
		this.token_character = -1060053207
		this.token_integer = -1010090581
		this.token_float = -1035006294
		this.token_string = -927081939
		this.token_object = -961308749
		this.token_definition = -1051988511
		this.token_function = -1034415909
		this.token_variable = -903543805
		// literal
		this.token_null = -2806273074
		this.token_true = 1853055989
		this.token_false = -1072102688
		// keyword
		this.token_do = 1677993041,
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
		// keyword(operators)
		this.token_in = 1678321035
		this.token_of = 1678714621
		this.token_pick = -1344827128
		this.token_yield = NaN
		this.token_await = 1721527123
		this.token_delete = 629840307
		this.token_keyof = -734729869
		this.token_typeof = 2430491513
		this.token_sizeof = 221262240
		this.token_instanceof = -4091102314
		// symbol(operators)
		this.token_sequence = -2620402777
		this.token_returns = 1675434631
		this.token_assignment = -2620402760
		this.token_add_equal = 1674253848
		this.token_subtract_equal = 1674385046
		this.token_divide_equal = 1674516244
		this.token_modulo_equal = 1673860254
		this.token_bitwise_and_equal = 1673925853
		this.token_bitwise_xor_equal = 1677599397
		this.token_bitwise_or_equal = 1679567367
		this.token_multiply_equal = 1674188249
		this.token_exponent_equal = -1535026183
		this.token_shift_left_equal = -1385138311
		this.token_shift_right_equal = -1368484103
		this.token_shift_left_unsigned_equal = 4934952648
		this.token_shift_right_unsigned_equal = -2077153338
		this.token_ternary_condition = -2620402758
		this.token_ternary_default = 2166136261
		this.token_logical_or = 1679567430
		this.token_logical_and = 1673925830
		this.token_nullish = 1675565830
		this.token_bitwise_or = -2620402697
		this.token_bitwise_xor = -2620402727
		this.token_bitwise_and = -2620402783
		this.token_compare = 1675434630
		this.token_uncompare = 1673597858
		this.token_deep_compare = -1376811207
		this.token_deep_uncompare = -1608133347
		this.token_less_than = -2620402761
		this.token_less_than_equal = 1675369031
		this.token_greater_than = -2620402759
		this.token_greater_than_equal = 1675500229
		this.token_shift_left = 1675369030
		this.token_shift_right = 1675500230
		this.token_shift_left_unsigned = -1385138312
		this.token_shift_right_unsigned = -1368484102
		this.token_add = -2620402778
		this.token_subtract = -2620402776
		this.token_modulo = -2620402784
		this.token_divide = -2620402774
		this.token_multiply = -2620402779
		this.token_exponent = 1674188230
		this.token_logical_not = -2620402788
		this.token_bitwise_not = -2620402695
		this.token_increment = 1674253830
		this.token_decrement = 1674385030
		this.token_property = -2620402775
		this.token_optional_chaining = 1675565813
	}
	/*
	 * scanner
	 */
	scan_addr () {
		return this.scan_index
	}
	scan_jump (value) {
		return this.scan_index = value
	}
	scan_move (value) {
		return value + (this.scan_jump(this.scan_addr() + 1) * 0)
	}
	scan_code (value) {
		return this.scan_token ? this.scan_token = this.scan_input.charCodeAt(value) | 0 : this.scan_token
	}
	scan_char (value) {
		return this.scan_token = this.scan_look(value)
	}
	scan_read () {
		return this.scan_token
	}
	scan_look (value) {
		return this.scan_code(this.scan_addr() + value)
	}
	scan_hash (value, count) {
		return this.scan_read() + (value << 6) + (value << 16) - value + count
	}
	scan_numb (value) {
		return (value > 47 && value < 58) | 0
	}
	scan_word (value) {
		return ((value == 95 || value > 127) || (value > 64 && value < 91) || (value > 96 && value < 123)) | 0
	}
	scan_sign (value) {
		return ((value == 33 || value == 37 || value == 38 || value == 94 || value == 124 || value == 126) || (value > 41 && value < 48) || (value > 59 && value < 64)) | 0
	}
	scan_flag (value) {
		return arguments.length ? this.scan_state = value : this.scan_state
	}
	scan_next (value) {
		return arguments.length ? this.scan_value = value : this.scan_value
	}
	scan_prev (value) {
		return arguments.length ? this.scan_child = value : this.scan_child
	}
	scan_node (value, types, props, child) {
		return this.scan_prev({value, types, props, child, index: 0, ident: '', owner: null, scope: null, caret: this.scan_addr()})
	}
	/*
	 * lexer
	 */
	lexer_string (value) {
		while (this.scan_char(0)) {
			if (this.scan_read() == value) {
				return this.scan_move(this.scan_addr() + 1)
			} else {
				this.scan_move(0)
			}
		}

		return this.scan_addr()
	}
	lexer_operator (value, index) {
		do {
			if (this.scan_sign(this.scan_read())) {
				this.scan_move(value = this.scan_hash(value, this.scan_addr() - index))
			} else {
				break
			}
		} while (this.scan_char(0))

		return value
	}
	lexer_identifier (value, index) {
		do {
			if (this.scan_word(this.scan_read())) {
				this.scan_move(value = this.scan_hash(value, this.scan_addr() - index))
			} else {
				break
			}
		} while (this.scan_char(0))

		return value
	}
	lexer_whitespace (value) {
		while (this.scan_char(0)) {
			if (this.scan_read() > value) {
				break
			} else {
				this.scan_move(0)
			}
		}

		return value
	}
	lexer_number (value) {
		if (this.scan_read() != 48) {
			return this.lexer_decimal(0, 0)
		} else if (this.scan_char(1) == 120) {
			return this.lexer_hexadecimal(this.scan_move(this.scan_move(0)))
		} else if (this.scan_numb(this.scan_read())) {
			return this.lexer_octal(this.scan_move(0))
		} else {
			return this.scan_move(value)
		}
	}
	lexer_decimal (value, count) {
		do {
			if (this.scan_numb(this.scan_read())) {
				value = this.scan_move(value * 10 + this.scan_read() - 48)
			} else if (this.scan_read() == 46 && this.scan_look(1) != 46) {
				count = this.scan_move(this.scan_addr() + 1)
			} else if (this.scan_word(this.scan_read())) {
				switch (this.scan_move(this.scan_read())) {
					case 98:
						return this.lexer_binary(0, 1)
					case 101:
						return this.lexer_exponent(
							this.lexer_exponent(value, count ? count - this.scan_addr() : 0),
							(this.scan_numb(this.scan_char(0)) || this.scan_move((this.scan_read() != 45) * this.scan_char(1)) ? 1 : -1) * this.lexer_number(0)
						)
				}
			} else {
				break
			}
		} while (this.scan_char(0))

		return count ? this.lexer_exponent(value, count - this.scan_addr()) : value
	}
	lexer_hexadecimal (value) {
		while (this.scan_char(0)) {
			if (this.scan_numb(this.scan_read()) || this.scan_word(this.scan_read())) {
				value = this.scan_move(value * 16 + (this.scan_read() & 15) + (this.scan_read() > 65 ? 9 : 0))
			} else {
				break
			}
		}

		return value
	}
	lexer_octal (value) {
		do {
			if (this.scan_numb(this.scan_read())) {
				value = this.scan_move(value * 8 + this.scan_read() - 48)
			} else if (this.scan_word(this.scan_read())) {
				this.scan_move(0)
			} else {
				break
			}
		} while (this.scan_char(0))

		return value
	}
	lexer_binary (value, count) {
	  while (this.scan_char(0)) {
	  	if (this.scan_numb(this.scan_read())) {
	  		value += this.scan_move(this.scan_read() == 49 ? count : 0)
	  		count *= 2
	  	} else if (this.scan_word(this.scan_read())) {
	  		this.scan_move(0)
	  	} else {
	  		break
	  	}
	  }

	  return value
	}
	lexer_exponent (value, count) {
		while (count > 0) {
			value *= 10
			count -= 1
		}
		while (count < 0) {
			value /= 10
			count += 1
		}

		return value
	}
	lexer_comment (value) {
		switch (value) {
			// //
			case 47: this.scan_move(this.scan_move(0))
				while (this.scan_char(0)) {
					if (this.scan_move(this.scan_read()) == 10) {
						break
					}
				}
				return 1
			// /*
			case 42: this.scan_move(this.scan_move(0))
				while (this.scan_char(0)) {
					if (this.scan_move(this.scan_read()) == value) {
						if (this.scan_char(0) == 47) {
							return this.scan_move(1)
						}
					} else {
						this.scan_move(0)
					}
				}
				return 1
			default: this.scan_look(0)
		}

		return 0
	}
	/*
	 * token
	 */
	token_unary (value) {
		switch (value) {
			// yield delete keyof typeof
			case this.token_yield:
			case this.token_delete:
			case this.token_keyof:
			case this.token_typeof:
			case this.token_sizeof:
			// ! ~
			case this.token_logical_not:
			case this.token_bitwise_not:
			// ++ --
			case this.token_increment:
			case this.token_decrement:
				return 1
		}

		return 0
	}
	token_identify (value) {
		switch (value) {
			// types
			case this.token_character:
			case this.token_integer:
			case this.token_float:
			case this.token_string:
			case this.token_object:
			case this.token_definition:
			case this.token_function:
			case this.token_variable:
				return this.token_typing
			// literals
			case this.literal_true:
			case this.literal_false:
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
			case this.token_pick:
			case this.token_await:
			case this.token_delete:
			case this.token_keyof:
			case this.token_typeof:
			case this.token_sizeof:
			case this.token_instanceof:
				return this.token_operator
		}

		return this.token_identifier
	}
	token_precedence (value) {
		switch (value) {
			// , =>
			case this.token_sequence:
			case this.token_returns:
				return 1
			// =
			case this.token_assignment:
			// += -= /= %=
			case this.token_add_equal:
			case this.token_subtract_equal:
			case this.token_divide_equal:
			case this.token_modulo_equal:
			// &= ^= |=
			case this.token_bitwise_and_equal:
			case this.token_bitwise_xor_equal:
			case this.token_bitwise_or_equal:
			// *= **=
			case this.token_multiply_equal:
			case this.token_exponent_equal:
			// <<= >>= <<<= >>>=
			case this.token_shift_left_equal:
			case this.token_shift_right_equal:
			case this.token_shift_left_unsigned_equal:
			case this.token_shift_right_unsigned_equal:
				return 2
			// ? :
			case this.token_ternary_condition:
			case this.token_ternary_default:
				return 3
			// ||
			case this.token_logical_or:
				return 4
			// &&
			case this.token_logical_and:
				return 5
			// ??
			case this.token_nullish:
				return 6
			// == != === !==
			case this.token_compare:
			case this.token_uncompare:
			case this.token_deep_compare:
			case this.token_deep_uncompare:
				return 7
			// < <= > >=
			case this.token_less_than:
			case this.token_less_than_equal:
			case this.token_greater_than:
			case this.token_greater_than_equal:
				return 8
			// in of instanceof
			case this.token_in:
			case this.token_of:
			case this.token_pick:
			case this.token_instanceof:
				return 9
			// |
			case this.token_bitwise_or:
				return 10
			// ^
			case this.token_bitwise_xor:
				return 11
			// &
			case this.token_bitwise_and:
				return 12
			// << >> <<< >>>
			case this.token_shift_left:
			case this.token_shift_right:
			case this.token_shift_left_unsigned:
			case this.token_shift_right_unsigned:
				return 13
			// + -
			case this.token_add:
			case this.token_subtract:
				return 14
			// % / *
			case this.token_modulo:
			case this.token_divide:
			case this.token_multiply:
				return 15
			// **
			case this.token_exponent:
				return 16
			// await delete keyof typeof sizeof
			case this.token_await:
			case this.token_delete:
			case this.token_keyof:
			case this.token_typeof:
			case this.token_sizeof:
				return 17
			// ! ~ ++ --
			case this.token_logical_not:
			case this.token_bitwise_not:
			case this.token_increment:
			case this.token_decrement:
				return 18
			// ?. . [
			case this.token_optional_chaining:
			case this.token_property:
			case this.token_membership:
				return 19
			// (
			case this.token_expression:
				return 20
		}

		return 0
	}
}

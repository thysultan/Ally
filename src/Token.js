export var token = {
	offset: 2166136261,
	// nodes
	program: 1, typing: 2, literal: 3, keyword: 4, operator: 5, statement: 6, identifier: 7, procedure: 123, expression: 40, membership: 91, declaration: 61,
	// types(chr, int, flt, str, obj, def, fun, var)
	character: -1060053207, integer: -1010090581, float: -1035006294, string: -927081939, object: -961308749, definition: -1051988511, function: -1034415909, variable: -903543805,
	// literals
	null: -2806273074, true: 1853055989, false: -1072102688,
	// keywords
	if: 1678321027, for: -1034809499, try: -918951625, else: 2979449664, case: 1327398711, catch: -130785800, while: 2264520430, switch: 3028315292, extends: -6732737417, finally: 2779395649,
	throw: -1079622077, break: -1009323364, return: 3624757432, continue: -1763732208,
	import: 1926321549, as: 1677796248, export: 4383565212,
	// operators(keywords)
	in: 1678321035, of: 1678714621,
	pick: -1344827128, await: 1721527123, delete: 629840307,
	keyof: -734729869, typeof: 2430491513, sizeof: 221262240, instanceof: -4091102314,
	// operators(symbols)
	sequence: -2620402777, direction: 1675434631,
	add_equal: 1674253848, subtract_equal: 1674385046, divide_equal: 1674516244, modulo_equal: 1673860254, bitwise_and_equal: 1673925853, bitwise_xor_equal: 1677599397, bitwise_or_equal: 1679567367,
	multiply_equal: 1674188249, exponent_equal: -1535026183,
	shift_left_equal: -1385138311, shift_right_equal: -1368484103, shift_left_unsigned_equal: 4934952648, shift_right_unsigned_equal: -2077153338,
	ternary_condition: -2620402758, ternary_default: 2166136261,
	logical_or: 1679567430,
	logical_and: 1673925830,
	nullish: 1675565830,
	bitwise_or: -2620402697,
	bitwise_xor: -2620402727,
	bitwise_and: -2620402783,
	compare: 1675434630, uncompare: 1673597858, deep_compare: -1376811207, deep_uncompare: -1608133347,
	less_than: -2620402761, less_than_equal: 1675369031, greater_than: -2620402759, greater_than_equal: 1675500229,
	shift_left: 1675369030, shift_right: 1675500230, shift_left_unsigned: -1385138312, shift_right_unsigned: -1368484102,
	add: -2620402778, subtract: -2620402776,
	modulo: -2620402784, divide: -2620402774, multiply: -2620402779,
	exponent: 1674188230,
	logical_not: -2620402788, bitwise_not: -2620402695, increment: 1674253830, decrement: 1674385030,
	membership_access: -2620402775, optional_chaining: 1675565813
}

export function token_identify (value) {
	switch (value) {
		// types
		case token.boolean: case token.character: case token.integer: case token.float: case token.string: case token.object: case token.definition: case token.function: case token.variable:
			return token.typing
		// literals
		case token.true: case token.false:
			return token.literal
		// keywords
		case token.if: case token.for: case token.try: case token.else: case token.case: case token.catch: case token.while: case token.switch: case token.extends: case token.finally:
		case token.throw: case token.break: case token.return: case token.continue:
		case token.import: case token.as:
			return token.keyword
		// operators
		case token.in: case token.of:
		case token.pick: case token.await: case token.delete:
		case token.keyof: case token.typeof: case token.sizeof: case token.instanceof:
			return token.operator
		// identifiers
		default:
			return token.identifier
	}
}

export function token_unary (value) {
	switch (value) {
		// await delete keyof typeof
		case token.await: case token.delete: case token.keyof: case token.typeof:
		// ! ~ ++ --
		case token.logical_not: case token.bitwise_not: case token.increment: case token.decrement:
			return 1
	}

	return 0
}

export function token_precedence (value) {
	switch (value) {
		// , =>
		case token.sequence: case token.direction:
			return 1
		// =
		case token.declaration:
		// += -= /= %= &= ^= |=
		case token.add_equal: case token.subtract_equal: case token.divide_equal: case token.modulo_equal: case token.bitwise_and_equal: case token.bitwise_xor_equal: case token.bitwise_or_equal:
		// *= **=
		case token.multiply_equal: case token.exponent_equal:
		// <<= >>= <<<= >>>=
		case token.shift_left_equal: case token.shift_right_equal: case token.shift_left_unsigned_equal: case token.shift_right_unsigned_equal:
			return 2
		// ? :
		case token.ternary_condition: case token.ternary_default:
			return 3
		// ||
		case token.logical_or:
			return 4
		// &&
		case token.logical_and:
			return 5
		// ??
		case token.nullish:
			return 6
		// == != === !==
		case token.compare: case token.uncompare: case token.deep_compare: case token.deep_uncompare:
			return 7
		// < <= > >=
		case token.less_than: case token.less_than_equal: case token.greater_than: case token.greater_than_equal:
			return 8
		// in of instanceof
		case token.in: case token.of: case token.pick: case token.instanceof:
			return 9
		// |
		case token.bitwise_or:
			return 10
		// ^
		case token.bitwise_xor:
			return 11
		// &
		case token.bitwise_and:
			return 12
		// << >> <<< >>>
		case token.shift_left: case token.shift_right: case token.shift_left_unsigned: case token.shift_right_unsigned:
			return 13
		// + -
		case token.add: case token.subtract:
			return 14
		// % / *
		case token.modulo: case token.divide: case token.multiply:
			return 15
		// **
		case token.exponent:
			return 16
		// await delete keyof typeof
		case token.await: case token.delete: case token.keyof: case token.typeof:
			return 17
		// ! ~ ++ --
		case token.logical_not: case token.bitwise_not: case token.increment: case token.decrement:
			return 18
		// . ?. [
		case token.membership_access: case token.optional_chaining: case token.membership:
			return 19
		// (
		case token.expression:
			return 20
	}

	return 0
}

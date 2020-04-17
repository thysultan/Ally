// stack
export var stack = 0
export var track = 0
export var trace = 0

// input
export var index = 0
export var input = ''

// enums
export var token = {type: 0, program: 1, keyword: 2, literal: 3, operator: 4, separator: 5, statement: 6, procedure: 7, identifier: 8, expression: 9, declaration: 10}
export var types = {nil: -1, int: -2, flt: -3, num: -4, str: -5, obj: -6, ptr: -7, var: -8, def: -9, fun: -10, bool: -11, if: -12, in: -13, of: -14, as: -15, for: -16,
	try: -17, null: -18, true: -19, else: -20, case: -21, pick: -22, false: -23, break: -24, keyof: -25, throw: -26, catch: -27, super: -28, await: -29, return: -30,
	switch: -31, delete: -32, typeof: -33, sizeof: -34, import: -35, export: -36, default: -37, extends: -38, finally: -39, continue: -40, instanceof: -41}

// symbols
export var table = {}

/**
 * @param {string} value
 * @return {object}
 */
export function parse (value) {
	return lexer(index = stack++, value = node(token.program, input = value), value)
}

/**
 * @param {number} value
 * @param {object} child
 * @param {object} frame
 * @return {object}
 */
export function lexer (value, child, frame) {
	while (track = stack) {
		switch (trace = scan()) {
			// < <= <<=
			// > >= >>=
			// * *= **=
			case 42: case 60: case 62:
				switch (peek()) {
					// ** << >> **= <<= >>=
					case stack: push(child, child = node(token.operator, [hash(scan(), peek() == 61 ? scan() : 1), types.num]))
						break
					// *= <= >=
					case 61: push(child, child = node(token.operator, [hash(scan(), 1), types.bool]))
						break
					// < > *
					default: push(child, child = node(token.operator, [stack, types.bool]))
				}
				break
			// ! != !==
			// = == ===
			case 33: case 61:
				switch (peek()) {
					// != / == / !== / ===
					case 61: push(child, child = node(token.operator, [hash(stack, scan(), peek() == 61 ? scan() : 1), types.bool]))
						break
					// ! / =
					default: push(child, child = node(token.operator, [stack, stack == 33 ? types.bool : types.var]))
				}
				break
			// & && &=
			// + ++ +=
			// - -- -=
			// | || |=
			case 38: case 43: case 45: case 124:
				switch (peek()) {
					// &= += -= |= && ++ -- ||
					case 61: case stack: push(child, child = node(token.operator, [hash(scan(), 1), types.num]))
						break
					// & + - |
					default: push(child, child = node(token.operator, [stack, types.num]))
				}
				break
			// % %=
			// ^ ^=
			case 37: case 94:
				switch (peek()) {
					// %= ^=
					case 61: push(child, child = node(token.operator, [hash(scan(), 1), types.num]))
						break
					// % ^
					default: push(child, child = node(token.operator, [stack, types.num]))
				}
				break
			// / /=
			// // /*
			case 47:
				switch (peek()) {
					// /*
					case 42: comment(42)
						break
					// //
					case 47: comment(47)
						break
					// /=
					case 61: push(child, child = node(token.operator, [hash(scan(), 1), types.num]))
						break
					// /
					default: push(child, child = node(token.operator, [stack, types.num]))
				}
				break
			// ? ?. ??
			case 63:
				switch (peek()) {
					// ?.  ??
					case 46: case 63: push(child, child = node(token.operator, [hash(scan(), 1), types.var]))
						break
					// ?
					default: push(child, child = node(token.operator, [stack, types.bool]))
				}
				break
			// . .. ...
			case 46:
				switch (peek()) {
					// .. ...
					case 46: push(child, child = node(token.operator, [hash(scan(), peek() == 46 ? scan() : 1), types.ptr]))
						break
					// .
					default: push(child, child = node(token.operator, [stack, types.var]))
				}
				break
			// , ;
			case 44: case 59:
				break
			// ) ] }
			case value: return frame
			// [ {
			case 91: case 123: stack = stack + 1
			// (
			case 40: push(stack == 40 && track == 32 ? push(child, child = node(token.separator, [0, 0])) : child, lexer(stack = stack + 1, child = node(stack, [0, 0]), child)).props = child.child
				break
			// " '
			case 34: case 39: push(child, child = node(token.literal, [index - string(stack) - 1, types.str]))
				break
			// \t \n
			case 9: case 10: stack = 32
			// \s
			case 32: index = whitespace() - 1
				break
			// 0-9
			case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: push(child, child = node(token.literal, [number(0, 0, track == 45 ? -1 : 1 ), trace == 1 ? types.flt : types.int]))
				break
			// A-Z a-z _
			default: push(child, child = node(track == -1 ? token.operator : keyword(index, track = identifier(stack)), [track - index, trace]))
		}
	}

	return frame
}

/**
 * @return {number}
 */
export function scan () {
	return stack = code(input, index++)
}

/**
 * @return {number}
 */
export function peek () {
	return code(input, index)
}

/**
 * @param {number} value
 * @return {boolean}
 */
export function word (value) {
	return (value == 95 || value > 127) || (value > 64 && value < 91) || (value > 96 && value < 123)
}

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function code (value, index) {
	return value.charCodeAt(index) | 0
}

/*
 * @param {number} value
 * @param {number} depth
 * @return {number}
 */
export function hash (value, depth) {
	return trace * value * depth
}

/*
 * @param {object} value
 * @param {object} child
 * @return {object}
 */
export function push (value, child) {
	return value.child = child
}

/*
 * @param {number} value
 * @param {object} props
 * @return {object}
 */
export function node (value, props) {
	return {value, props, index, child: null, __proto__: null}
}

/**
 * @param {number} value
 * @param {number} point
 * @param {number} float
 * @return {number}
 */
export function number (value, point, float) {
	while (stack) {
		switch (scan()) {
			// .
			case 46: peek() == 46 ? stack = 0 : point = trace = 1
				break
			// _
		 	case 95:
		 		break
		 	// 0-9
		 	case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: value = value * 10 + stack - 48, float = point ? float / 10 : float
		 		break
			default: stack = 0
		}
	}

	return index += stack = -1, value * float
}

/**
 * @param {number} value
 * @return {number}
 */
export function string (value) {
	while (stack) {
		if (scan() == value) {
			break
		}
	}

	return index
}

/**
 * @param {number} value
 * @return {number}
 */
export function comment (value) {
	while (stack) {
		if (value == 47) {
			if (scan() == 10) {
				break
			}
		} else {
			if (scan() == 42 && scan() == 47) {
				break
			}
		}
	}

	return index
}

/**
 * @return {number}
 */
export function whitespace () {
	while (stack) {
		if (scan() > 32) {
			break
		}
	}

	return index
}

/**
 * @param {number} value
 * @return {number}
 */
export function identifier (value) {
	while (stack) {
		if (word(scan())) {
			value = stack + (value << 6) + (value << 16) - value
		} else {
			break
		}
	}

	return value
}

/**
 * @param {string} value
 * @param {number} count
 * @return {number}
 */
export function compare (value, count) {
	while (count) {
		if (code(value, --count) != code(input, index - count)) {
			return 0
		}
	}

	return 1
}

/**
 * @param {string} value
 * @param {string} count
 * @return {number}
 */
export function keyword (value, count) {
	switch (index) {
		case 2:
			if (compare('if', 2)) {
				return trace = types.if, token.keyword
			} else if (compare('in', 2)) {
				return trace = types.in, token.keyword
			} else if (compare('of', 2)) {
				return trace = types.of, token.keyword
			} else if (compare('as', 2)) {
				return trace = types.as, token.keyword
			} else {
				break
			}
		case 3:
		 	if (compare('int', 3)) {
		 		return trace = types.int, token.type
		 	} else if (compare('flt', 3)) {
		 		return trace = types.flt, token.type
		 	} else if (compare('num', 3)) {
		 		return trace = types.num, token.type
		 	} else if (compare('str', 3)) {
		 		return trace = types.str, token.type
		 	} else if (compare('obj', 3)) {
		 		return trace = types.obj, token.type
		 	} else if (compare('ptr', 3)) {
		 		return trace = types.ptr, token.type
		 	} else if (compare('var', 3)) {
		 		return trace = types.var, token.type
		 	} else if (compare('def', 3)) {
		 		return trace = types.def, token.type
		 	} else if (compare('fun', 3)) {
		 		return trace = types.fun, token.type
		 	} else if (compare('nil', 3)) {
		 		return trace = types.nil, token.type
		 	} else if (compare('for', 3)) {
		 		return trace = types.for, token.keyword
		 	} else if (compare('try', 3)) {
		 		return trace = types.try, token.keyword
		 	} else {
				break
			}
		case 4:
			if (compare('enum', 4)) {
				return types.enum
			} else if (compare('bool', 4)) {
				return trace = types.bool, token.type
			} else if (compare('null', 4)) {
				return trace = types.null, token.literal
			} else if (compare('true', 4)) {
				return trace = types.true, token.literal
			} else if (compare('else', 4)) {
				return trace = types.else, token.keyword
			} else if (compare('case', 4)) {
				return types.case
			} else if (compare('pick', 4)) {
				return trace = types.pick, token.keyword
			} else {
				break
			}
		case 5:
			if (compare('false', 5)) {
				return trace = types.false, token.literal
			} else if (compare('break', 5)) {
				return trace = types.break, token.keyword
			} else if (compare('keyof', 5)) {
				return trace = types.keyof, token.keyword
			} else if (compare('throw', 5)) {
				return trace = types.throw, token.keyword
			} else if (compare('catch', 5)) {
				return trace = types.catch, token.keyword
			} else if (compare('super', 5)) {
				return trace = types.super, token.keyword
			} else if (compare('await', 5)) {
				return trace = types.await, token.keyword
			} else {
				break
			}
		case 6:
			if (compare('return', 6)) {
				return trace = types.return, token.keyword
			} else if (compare('switch', 6)) {
				return trace = types.switch, token.keyword
			} else if (compare('delete', 6)) {
				return trace = types.delete, token.keyword
			} else if (compare('typeof', 6)) {
				return trace = types.typeof, token.keyword
			} else if (compare('sizeof', 6)) {
				return trace = types.sizeof, token.keyword
			} else if (compare('import', 6)) {
				return trace = types.import, token.keyword
			} else if (compare('export', 6)) {
				return trace = types.export, token.keyword
			} else {
				break
			}
		case 7:
			if (compare('default', 7)) {
				return trace = types.default, token.keyword
			} else if (compare('extends', 7)) {
				return trace = types.extends, token.keyword
			} else if (compare('finally', 7)) {
				return trace = types.finally, token.keyword
			} else {
				break
			}
		case 8:
			if (compare('continue', 8)) {
				return trace = types.continue, token.keyword
			} else {
				break
			}
		case 9:
			if (compare('instanceof', 9)) {
				return trace = types.instanceof, token.keyword
			} else {
				break
			}
	}

	return token.identifier
}

console.log(parse('abc'))
// console.log(parse('"100" var abc 123_000 111km 10e4'))

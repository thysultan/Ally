// stack
export var stack = 0
export var track = 0
export var trace = 0

// input
export var index = 0
export var input = ''

// token
export var token = {type: 0, program: 1, keyword: 2, literal: 3, operator: 4, separator: 5, statement: 6, procedure: 7, identifier: 8, expression: 9, declaration: 10}
export var types = {bit: 0, int: 1, flt: 2, num: 3, str: 4, obj: 5, ptr: 6, nil: 7, def: 8, fun: 9, var: 10}

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
					case stack: push(child, child = node(token.operator, [oper(stack, scan(), peek() == 61 ? scan() : 1), types.num]))
						break
					// *= <= >=
					case 61: push(child, child = node(token.operator, [oper(stack, scan(), 1), types.bit]))
						break
					// < > *
					default: push(child, child = node(token.operator, [stack, types.bit]))
				}
				break
			// ! != !==
			// = == ===
			case 33: case 61:
				switch (peek()) {
					// != / == / !== / ===
					case 61: push(child, child = node(token.operator, [oper(stack, scan(), peek() == 61 ? scan() : 1), types.bit]))
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
					case 61: case stack: push(child, child = node(token.operator, [oper(stack, scan(), 1), types.num]))
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
					case 61: push(child, child = node(token.operator, [oper(stack, scan(), 1), types.num]))
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
					case 61: push(child, child = node(token.operator, [oper(stack, scan(), 1), types.num]))
						break
					// /
					default: push(child, child = node(token.operator, [stack, types.num]))
				}
				break
			// ? ?. ??
			case 63:
				switch (peek()) {
					// ?.  ??
					case 46: case 63: push(child, child = node(token.operator, [oper(stack, scan(), 1), types.var]))
						break
					// ?
					default: push(child, child = node(token.operator, [stack, types.bit]))
				}
				break
			// . .. ...
			case 46:
				switch (peek()) {
					// .. ...
					case 46: push(child, child = node(token.operator, [oper(stack, scan(), peek() == 46 ? scan() : 1), types.ptr]))
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
			case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: push(child, child = node(token.literal, [number(trace = 0, 1), trace ? types.flt : types.int]))
				break
			// A-Z a-z _
			default: push(child, child = node(track == -1 ? token.operator : token.identifier, [index - 1, identifier(index)]))
		}
	}

	return frame
}

/**
 * @return {number}
 */
export function scan () {
	return stack = code(index++)
}

/**
 * @return {number}
 */
export function peek () {
	return code(index)
}

/**
 * @param {number} value
 * @return {number}
 */
export function code (value) {
	return input.charCodeAt(value) | 0
}

/**
 * @param {number} value
 * @return {boolean}
 */
export function word (value) {
	return (value == 95 || value > 127) || (value > 64 && value < 91) || (value > 96 && value < 123)
}

/*
 * @param {number} value
 * @param {number} child
 * @param {number} power
 * @return {number}
 */
export function oper (value, child, power) {
	return value * child * power
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
 * @return {number}
 */
export function number (value, point) {
	do {
		if (stack > 47 && stack < 58) {
			value = value * 10 + stack - 48, point = trace ? point / 10 : point
		} else if (stack == 46) {
			if (peek() != 46) {
				trace = 1
			} else {
				break
			}
		} else if (stack != 95) {
			break
		}
	} while (scan())

	return index += stack = -1, value * point
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
		if (!word(scan())) {
			break
		}
	}

	return index - value
}

console.log(parse('-123.23km'))
// console.log(parse('"100" var abc 123_000 111km 10e4'))

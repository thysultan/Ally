// stack
export var stack = 0
export var track = 0
export var trace = 0

// input
export var index = 0
export var input = ''

// enums
export var token = {type: 0, program: 1, keyword: 2, literal: 3, operator: 4, separator: 5, statement: 6, procedure: 7, identifier: 8, expression: 9, declaration: 10}
export var types = {nil: 0, int: 1, flt: 2, num: 3, str: 4, obj: 5, ptr: 6, var: 7, def: 8, fun: 9, bool: 10}

console.log(parse('"100" var abc 123_000 111km 10e4'))

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
			case 40: push(track == 40 && track == 32 ? push(child, child = node(token.separator, [0, 0])) : child, lexer(++stack, child = node(stack, [0, 0]), child)).props = child.child
				break
			// " '
			case 34: case 39: push(child, child = node(token.literal, [index - string(stack), types.str]))
				break
			// \t \n
			case 9: case 10: trace = 32
			// \s
			case 32: whitespace()
				break
			// 0-9 A-Z a-z _
			default:
				switch (alphanumeric(stack)) {
					case 1: push(child, child = node(token.literal, [number(0, 0, sign(track)), trace == 1 ? types.flt : types.int]))
						break
					case 2: push(child, child = node(numeric(track) ? token.operator : token.identifier, [index - identifier(), token.var]))
				}
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

/*
 * @param {number} value
 * @return {number}
 */
export function sign (value) {
	return value == 45 ? -1 : 1
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
	return {value, props, index, child: null}
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
			// _
		 	case 95:
		 		break
		 	// 0-9 A-Z a-z
			default: numeric(stack) ? (value = value * 10 + stack - 48, float = point ? float / 10 : float) : stack = 0
		}
	}

	return index += stack = -1, value *= float
}

/**
 * @param {number} value
 * @return {number}
 */
export function string (value) {
	while (stack) {
		if (value == scan()) {
			break
		} else if (stack == 92) {
			scan()
		}
	}

	return index - 1
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

	return --index
}

/**
 * @return {number}
 */
export function identifier () {
	while (stack) {
		if (!alphabetic(scan())) {
			break
		}
	}

	return --index
}

/**
 * @param {number} value
 * @return {number}
 */
export function numeric (value) {
	return value > 47 && value < 58 ? 1 : 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function alphabetic (value) {
	if (value == 95) {
		return 1
	} else if (value > 64 && value < 91) {
		return 2
	} else if (value > 96 && value < 123) {
		return 3
	} else {
		return 0
	}
}

/**
 * @param {number}
 * @return {number}
 */
export function alphanumeric (value) {
	if (numeric(value)) {
		return 1
	} else if (alphabetic(value)) {
		return 2
	} else if (value > 127) {
		return 3
	} else {
		return 0
	}
}

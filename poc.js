// stack
export var head = 0
export var tail = 0
export var flag = 0
export var root = null

// input
export var index = 0
export var input = ''

// enums
export var token = {type: 1, program: 2, keyword: 3, literal: 4, operator: 5, separator: 6, statement: 7, procedure: 8, identifier: 9, expression: 10, declaration: 11}
export var types = {int: -1, big: -2, flt: -3, dec: -4, num: -5, str: -6, obj: -7, ptr: -8, nil: -9, var: -10, def: -11, fun: -12, enum: -13, bool: -14}

// memory
export var offset = 0
export var length = 0
export var memory = []
export var symbol = {}

console.log(compile('"100" var a 1 23 b 111km 10'), memory, symbol)

/**
 * @param {string} value
 * @return {object}
 */
export function compile (value) {
	return tokenize(index = head++, input = value, root = node(token.program, value), root)
}

/**
 * @param {number} type
 * @param {any} props
 * @param {object} next
 * @param {object} root
 * @return {object}
 */
export function tokenize (type, props, next, root) {
	while (tail = head) {
		switch (flag = scan()) {
			// < <= <<=
			// > >= >>=
			// * *= **=
			case 42: case 60: case 62:
				switch (peek()) {
					// ** / << / >> / **= / <<= / >>=
					case flag: push(next, next = node(token.operator, [hash(flag, scan(), peek() == 61 ? scan() : 1), types.num]))
						break
					// *=/ <= / >=
					case 61: push(next, next = node(token.operator, [hash(flag, scan()), types.bool]))
						break
					// < / > / *
					default: push(next, next = node(token.operator, [flag, types.bool]))
				}
				break
			// ! != !==
			// = == ===
			case 33: case 61:
				switch (peek()) {
					// != / == / !== / ===
					case 61: push(next, next = node(token.operator, [hash(flag, scan(), peek() == 61 ? scan() : 1), types.bool]))
						break
					// ! / =
					default: push(next, next = node(token.operator, [flag, flag == 33 ? types.bool : types.var]))
				}
				break
			// & && &=
			// + ++ +=
			// - -- -=
			// | || |=
			case 38: case 43: case 45: case 124:
				switch (peek()) {
					// && / ++ / -- / &= / += / -= / |=
					case flag: case 61: push(next, next = node(token.operator, [hash(flag, scan()), types.num]))
						break
					// & / + / - / |
					default: push(next, next = node(token.operator, [flag, types.num]))
				}
				break
			// % %=
			// ^ ^=
			case 37: case 94:
				switch (peek()) {
					// %= / ^=
					case 61: push(next, next = node(token.operator, [hash(flag, scan()), types.num]))
						break
					// % / ^
					default: push(next, next = node(token.operator, [flag, types.num]))
				}
				break
			// / /=
			// // /*
			case 47:
				switch (peek()) {
					// /*
					case 42: flag = 42
					// //
					case 47: comment()
						break
					// /=
					case 61: push(next, next = node(token.operator, [hash(flag, scan()), types.num]))
						break
					// /
					default: push(next, next = node(token.operator, [flag, types.num]))
				}
				break
			// ? ?. ??
			case 63:
				switch (peek()) {
					// ?.  ??
					case 46: case 63: push(next, next = node(token.operator, [hash(flag, scan()), types.var]))
						break
					// ?
					default: push(next, next = node(token.operator, [flag, types.bool]))
				}
				break
			// . .. ...
			case 46:
				switch (peek()) {
					// .. / ...
					case 46: push(next, next = node(token.operator, [hash(flag, scan(), peek() == 46 ? scan() : 1), types.ptr]))
						break
					// .
					default: push(next, next = node(token.operator, [flag, types.var]))
				}
				break
			// , ;
			case 44: case 59:
				break
			// ) ] }
			case type:
				return root
			// [ {
			case 91: case 123: ++head
			// (
			case 40: push(tail == 40 && flag == 32 ? push(next, next = node(token.separator, props)) : next, parse(flag = ++head, props, next = node(flag, props), next)).props = next.next
				break
			// " '
			case 34: case 39: push(next, next = node(token.literal, [alloc(slice(index, string())), types.str]))
				break
			// \t \n
			case 9: case 10: flag = 32
			// \s
			case 32: whitespace()
				break
			// 0-9 / A-z / _
			default:
				switch (alphanumeric(flag)) {
					case 1: push(next, next = node(token.literal, [digit(slice(index - 1, number())), flag < 0 ? types.flt : types.int]))
						break
					case 2: push(next, next = node(tail = keyword(next = slice(index - 1, identifier())), [tail == token.identifier ? table(next) : hash(flag, head, -1), types.var]))
				}
		}
	}

	return root
}

/*
 * @param {number} type
 * @param {any} props
 * @return {object}
 */
export function node (type, props) {
	return {type: type, props: props, children: null, next: null, index: index}
}

/*
 * @param {object} next
 * @param {any} value
 * @return {object}
 */
export function push (next, value) {
	return next.next = value
}

/*
 * @param {number} head
 * @param {number} body
 * @param {number} tail
 * @return {number}
 */
export function hash (head, body, tail) {
	return head * body * tail
}

/**
 * @return {number}
 */
export function scan () {
	return head = code(index++)
}

/**
 * @return {number}
 */
export function peek () {
	return code(index)
}

/**
 * @param {number} offset
 * @return {number}
 */
export function code (offset) {
	return input.charCodeAt(offset) | 0
}

/**
 * @param {number} offset
 * @param {number} length
 * @return {string}
 */
export function slice (offset, length) {
	return input.slice(offset, length)
}

/**
 * @param {string} value
 * @return {number}
 */
export function digit (value) {
	return Number(value.replace(/[a-zA-Z\s]/g, ''))
}

/**
 * @param {string} value
 * @return {number}
 */
export function table (value) {
	return symbol.hasOwnProperty(value) ? symbol[value] : symbol[value] = length++
}

/**
 * @param {string} value
 * @return {number}
 */
export function alloc (value) {
	return memory[offset] = value, ++offset
}

/**
 * @return {number}
 */
export function number () {
	while (head) {
		// record offset when encounting a dot .
		// when done, add the second segment(if a float) a + (b / (10 ^ index - offset))
		// add sign from tail if tail is -
		switch (scan()) {
			case 46:
				if (flag > 0) {
					flag = -index
				} else {
					return index -= 2
				}
		 	case 95:
		 		break
	 	 	case 32:
	 	 		if (alphanumeric(peek()) == 1) {
	 	 			head = 48
	 	 		}
			default:
				switch (alphanumeric(head)) {
					case 0: return --index
					case 1: // value = value * 10 + head - 48 // number
						break
					case 2: return identifier()
				}
		}
	}

	return --index
}

/**
 * @return {number}
 */
export function string () {
	while (head) {
		if (scan() == flag) {
			break
		} else if (head == 92) {
			scan()
		}
	}

	return index - 1
}

/**
 * @return {number}
 */
export function comment () {
	while (head) {
		if (flag == 47) {
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
	while (head) {
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
	while (head) {
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
	if (value > 47 && value < 58) {
		return 1
	} else if (alphabetic(value)) {
		return 2
	} else if (value > 127) {
		return 3
	} else {
		return 0
	}
}

/**
 * @param {string} value
 * @return {number}
 */
export function keyword (value) {
	switch (value) {
		// types(numbers)
		case 'int': case 'big': case 'flt': case 'dec':
		// types(generic)
		case 'num': case 'str': case 'obj': case 'ptr': case 'var':
		// types(exotics)
		case 'def': case 'fun': case 'nil': case 'enum': case 'bool':
			return token.type
		// literals
		case 'null': case 'true': case 'false':
			return token.literal
		// imports/exports
		case 'as': case 'import': case 'export':
		// exceptions
		case 'try': case 'throw': case 'catch': case 'finally':
		// introspections
		case 'super': case 'keyof': case 'typeof': case 'sizeof': case 'instanceof':
		// actions
		case 'pick': case 'await': case 'delete':
		// modifiers
		case 'in': case 'of': case 'extends':
		// control flow
		case 'if': case 'else': case 'for': case 'switch': case 'case': case 'default': case 'break': case 'continue': case 'return':
			return token.keyword
		default:
			return token.identifier
	}
}

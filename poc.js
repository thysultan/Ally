// stack
export var head = 0
export var body = 0
export var tail = 0

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

/**
 * @param {string} value
 * @return {object}
 */
export function compile (value) {
	return tokenize(index = 0, input = value, node(token.program, value), null)
}

/**
 * @param {number} type
 * @param {any} props
 * @param {object} next
 * @param {object} root
 * @return {object}
 */
export function tokenize (type, props, next, root) {
	while (tail = head, head = scan()) {
		switch (head) {
			// < <= <<=
			// > >= >>=
			// * *= **=
			case 42 case 60: case 62:
				switch (peek(0)) {
					// ** / << / >> / **= / <<= / >>=
					case head: push(next, next = node(token.operator, [hash(head, scan(), peek(0) == 61 ? scan() : 1), types.num]))
						break
					// *=/ <= / >=
					case 61: push(next, next = node(token.operator, [hash(head, scan()), types.bool]))
						break
					// < / > / *
					default: push(next, next = node(token.operator, [head, types.bool]))
				}
				break
			// ! != !==
			// = == ===
			case 33: case 61:
				switch (peek(0)) {
					// != / == / !== / ===
					case 61: push(next, next = node(token.operator, [hash(head, scan(), peek(0) == 61 ? scan() : 1), types.bool]))
						break
					// ! / =
					default: push(next, next = node(token.operator, [head, head == 33 ? types.bool : types.var]))
				}
				break
			// & && &=
			// + ++ +=
			// - -- -=
			// | || |=
			case 38: case 43: case 45: case 124:
				switch (peek(0)) {
					// && / ++ / -- / &= / += / -= / |=
					case head: case 61: push(next, next = node(token.operator, [hash(head, scan()), types.num]))
						break
					// & / + / - / |
					default: push(next, next = node(token.operator, [head, types.num]))
				}
				break
			// % %=
			// ^ ^=
			case 37: case 94:
				switch (peek(0)) {
					// %= / ^=
					case 61: push(next, next = node(token.operator, [hash(head, scan()), types.num]))
						break
					// % / ^
					default: push(next, next = node(token.operator, [head, types.num]))
				}
				break
			// / /=
			// // /*
			case 47:
				switch (peek(0)) {
					// /* //
					case 42: case 47: comment()
						break
					// /=
					case 61: push(next, next = node(token.operator, [hash(head, scan()), types.num]))
						break
					// /
					default: push(next, next = node(token.operator, [head, types.num]))
				}
				break
			// ? ?. ??
			case 63:
				switch (peek(0)) {
					// ?.  ??
					case 46: case 63: push(next, next = node(token.operator, [hash(head, scan()), types.var]))
						break
					// ?
					default: push(next, next = node(token.operator, [head, types.bool]))
				}
				break
			// . .. ...
			case 46:
				switch (peek(0)) {
					// .. / ...
					case 46: push(next, next = node(token.operator, [hash(head, scan(), peek(0) == 46 ? scan() : 1), types.ptr]))
						break
					// .
					default: push(next, next = node(token.operator, [head, types.var]))
				}
				break
			// , ;
			case 44: case 59:
				break
			// ) ] }
			case type:
				return root
			// [ { (
			case 91: case 123: ++body case 40: push(tail == 40 && head == 32 ? push(next, next = node(token.separator, props)) : next, parse(head = ++body, props, next = node(head, props), next)).props = next.next
				break
			// " '
			case 34: case 39: push(next, next = node(token.literal, [alloc(slice(index, string())), types.str]))
				break
			// \t \n \s
			case 9: case 10: head = 32 case 32: whitespace()
				break
			// 0-9 / A-z / _
			default:
				switch (alphanumeric(head)) {
					case 1: push(next, next = node(token.literal, [digit(slice(index, number())), head < 0 ? types.flt : types.int]))
						break
					case 2: push(next, next = node(tail = keyword(next = slice(index, identifier())), [tail == token.identifier ? table(next) : hash(head, body, -1):, types.var]))
				}
		}
	}
}

/*
 * @param {number} type
 * @param {any} props
 * @return {object}
 */
export function node (type, props) {
	return {type: type, props: props, children: null, next: null, position: position}
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
	return body = peek(index++)
}

/**
 * @param {number} offset
 * @return {number}
 */
export function peek (offset) {
	return input.charCodeAt(index + offset)
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
	return Number(value)
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
	return memory[offset++] = value, offset
}

/**
 * @return {number}
 */
export function number () {
	while (scan()) {
		switch (peek(0)) {
			// .
			case 46:
				// ..
				if (head > 0) {
					head = -1
				} else {
					return --index
				}
			// \s
			 case 32:
				break
			default:
				switch (alphanumeric(peek(0))) {
					case 0: return index
					case 2: return identifier()
				}
		}
	}

	return index
}

/**
 * @return {number}
 */
export function string () {
	while (scan()) {
		switch (peek(0)) {
			// " '
			case head:
				return index
			// \
			case 92: scan()
		}
	}

	return index
}

/**
 * @return {number}
 */
export function comment () {
	switch (peek(0)) {
		// /
		case 47:
			while (scan()) {
				if (body == 10) {
					return index
				}
			}
			break
		// *
		case 42:
			while (scan()) {
				if (body == 42 && scan() == 47) {
					return index
				}
			}
	}

	return index
}

/**
 * @return {number}
 */
export function whitespace () {
	while (peek(0)) {
		if (peek(0) < 32) {
			scan()
		} else {
			break
		}
	}

	return index
}

/**
 * @return {number}
 */
export function identifier () {
	while (peek(0)) {
		if (alphabetic(body)) {
			scan()
		} else {
			break
		}
	}

	return index
}

/**
 * @param {number} value
 * @return {number}
 */
export function alphabetic (value) {
	if (value == 94) {
		return 1
	} else if (value > 64 && value < 91) {
		return 2
	} else if (value > 97 && value < 123) {
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
	if (value > 48 && value < 58) {
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

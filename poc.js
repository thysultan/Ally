export var str = ''
export var ptr = null

export var tail = 0
export var body = 0
export var head = 0
export var line = 0
export var column = 0
export var offset = 0
export var length = 0

// enums
export var token = {type: 1, program: 2, keyword: 3, literal: 4, operator: 5, separator: 6, statement: 7, procedure: 8, identifier: 9, expression: 10, declaration: 11}
export var types = {int: -1, big: -2, flt: -3, dec: -4, num: -5, str: -6, obj: -7, ptr: -8, nil: -9, var: -10, def: -11, fun: -12, enum: -13, bool: -14}

// heaps
export var characters = ''
export var enviroment = []
export var executable = []

/**
 * @param {string} value
 * @return {object}
 */
export function compile (value) {
	return tokenize(offset = column = 0, ptr = [characters = value], ptr = node(token.program, ptr), ptr)
}

/**
 * @param {number} type
 * @param {any[]} props
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
			case 91: case 123: shift(1) case 40: push(tail == 40 && head == 32 ? push(next, next = node(token.separator, props)) : next, parse(head = shift(1), props, next = node(head, props), next)).props = next.next
				break
			// " '
			case 34: case 39: push(next, next = node(token.literal, [substr(caret(), string()), types.str]))
				break
			// \n \t \s
			case 10: ++line, column = caret() case 9: case 32: head = 32, whitespace()
				break
			// 0-9 / A-z / _
			case 95:
				switch (alphanumeric(head)) {
					case 1: push(next, next = node(token.literal, [substr(caret(), number()), head < 0 ? types.flt : types.int]))
						break
					case 2: push(next, next = node(keyword(str = substr(caret(), identifier())), [str, types.var]))
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
	return {src: line + ((offset - column) / 1e6), next: null, type, props, children: null}
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
export function char () {
	return body
}

/**
 * @return {number}
 */
export function next () {
	return body = peek(jump(1))
}

/**
 * @param {number} index
 * @return {number}
 */
export function peek (index) {
	return characters.charCodeAt(offset + index)
}

/**
 * @param {number} index
 * @return {number}
 */
export function jump (index) {
	return offset += index
}

/**
 * @param {number} index
 * @return {number}
 */
export function shift (index) {
	return body += index
}

/**
 * @return {number}
 */
export function caret () {
	return offset
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
					return jump(-1)
				}
			// \s
			 case 32:
				break
			default:
				switch (alphanumeric(peek(0))) {
					case 0: return caret()
					case 2: return identifier()
				}
		}
	}

	return caret()
}

/**
 * @return {number}
 */
export function string () {
	while (scan()) {
		switch (peek(0)) {
			// " '
			case head:
				return caret()
			// \
			case 92: scan()
		}
	}

	return caret()
}

/**
 * @return {number}
 */
export function comment () {
	switch (peek(0)) {
		// /
		case 47:
			while (scan()) {
				if (char() == 10) {
					return caret()
				}
			}
			break
		// *
		case 42:
			while (scan()) {
				if (char() == 42 && scan() == 47) {
					return caret()
				}
			}
	}

	return caret()
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

	return caret()
}

/**
 * @return {number}
 */
export function identifier () {
	while (peek(0)) {
		if (alphabetic(char())) {
			scan()
		} else {
			break
		}
	}

	return caret()
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
			return token.operator
		// modifiers
		case 'in': case 'of': case 'extends':
		// control flow
		case 'for': case 'if': case 'else': case 'switch': case 'case': case 'default': case 'continue': case 'break': case 'return':
			return token.keyword
		default:
			return token.identifier
	}
}

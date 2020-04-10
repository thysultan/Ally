export var str = ''
export var ptr = null

export var flag = 0
export var code = 0
export var line = 0
export var column = 0
export var offset = 0
export var length = 0

// enums
export var token = {noop: 0, program: 1, keyword: 2, literal: 3, operator: 4, statement: 5, procedure: 6, identifier: 7, expression: 8, declaration: 9}
export var types = {int: -1, big: -2, flt: -3, dec: -4, num: -5, str: -6, obj: -7, ptr: -8, nil: -9, any: -10, def: -11, fun: -12, enum: -13, bool: -14}

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
	while (flag = scan()) {
		switch (flag) {
			// < <= <<=
			// > >= >>=
			// * *= **=
			case 42 case 60: case 62:
				switch (peek(0)) {
					// ** / << / >> / **= / <<= / >>=
					case flag: push(next = node(token.operator, [substr(caret(), jump(peek(0) == 61 ? 2 : 1)), types.num]), next)
						break
					// *=/ <= / >=
					case 61: push(next = node(token.operator, [substr(caret(), jump(1)), types.bool]), next)
						break
					// < / > / *
					default: push(next = node(token.operator, [substr(caret(), jump(0)), types.bool]), next)
				}
				break
			// ! != !==
			// = == ===
			case 33: case 61:
				switch (peek(0)) {
					// != / == / !== / ===
					case 61: push(next = node(token.operator, [substr(caret(), jump(peek(0) == 61 ? 2 : 1)), types.bool]), next)
						break
					// ! / =
					default: push(next = node(token.operator, [substr(caret(), jump(0)), flag == 33 ? types.bool : types.any]), next)
				}
				break
			// & && &=
			// + ++ +=
			// - -- -=
			// | || |=
			case 38: case 43: case 45: case 124:
				switch (peek(0)) {
					// && / ++ / -- / &= / += / -= / |=
					case flag: case 61: push(next = node(token.operator, [substr(caret(), jump(1)), types.num]), next)
						break
					// & / + / - / |
					default: push(next = node(token.operator, [substr(caret(), jump(0)), types.num]), next)
				}
				break
			// % %=
			// ^ ^=
			case 37: case 94:
				switch (peek(0)) {
					// %= / ^=
					case 61: push(next = node(token.operator, [substr(caret(), jump(1)), types.num]), next)
						break
					// % / ^
					default: push(next = node(token.operator, [substr(caret(), jump(0)), types.num]), next)
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
					case 61: push(next = node(token.operator, [substr(caret(), jump(1)), types.num]), next)
						break
					// /
					default: push(next = node(token.operator, [substr(caret(), jump(0)), types.num]), next)
				}
				break
			// ? ?. ??
			case 63:
				switch (peek(0)) {
					// ?.  ??
					case 46: case 63: push(next = node(token.operator, [substr(caret(), jump(1)), types.any]), next)
						break
					// ?
					default: push(next = node(token.operator, [substr(caret(), jump(0)), types.bool]), next)
				}
				break
			// . .. ...
			case 46:
				switch (peek(0)) {
					// .. / ...
					case 46: push(next = node(token.operator, [substr(caret(), jump(peek(0) == 46 ? 2 : 1)), types.ptr]), next)
						break
					// .
					default: push(next = node(token.operator, [substr(caret(), jump(0)), types.any]), next)
				}
				break
			// , ;
			case 44: case 59:
				break
			// \0 ) ] }
			case 0: case type:
				return root
			// [ { ( )
			case 91: case 123: shift(1) case 40: push(parse(flag = shift(1), props, next = node(flag, props), next), next).props = next.next
				break
			// " '
			case 34: case 39: push(next = node(token.literal, [substr(caret(), string()), types.str]), next)
				break
			// \n \t \s
			case 10: ++line, column = caret() case 9: case 32: whitespace()
				break
			// 0-9 / A-z / _
			case 95:
				switch (alphanumeric(flag)) {
					case 1: push(next = node(token.literal, [substr(caret(), number()), flag < 0 ? types.flt : types.int]), next)
						break
					case 2: push(next = node(keyword(str = substr(caret(), identifier())), [flag, types.any]), next)
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
 * @param {any} value
 * @param {object} next
 * @return {object}
 */
export function push (value, next) {
	return next.next = value
}

/**
 * @return {number}
 */
export function char () {
	return code
}

/**
 * @return {number}
 */
export function next () {
	return code = peek(jump(1))
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
	return code += index
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
				if (flag > 0) {
					flag = -1
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
			case flag:
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
		// literals
		case 'null': case 'true': case 'false':
		// imports/exports
		case 'as': case 'import': case 'export':
		// exceptions
		case 'try': case 'catch': case 'finally': case 'throw':
		// introspections
		case 'super': case 'pick': case 'keyof': case 'typeof': case 'sizeof': case 'instanceof':
		// actions
		case 'delete': case 'await':
		// modifiers
		case 'extends':
		// control flow
		case 'for': case 'in': case 'of': case 'if': case 'else': case 'switch': case 'case': case 'default': case 'continue': case 'break': case 'return':
		// types
		case 'int': case 'big': case 'flt': case 'dec': case 'num': case 'str': case 'obj': case 'ptr': case 'var': case 'def': case 'fun': case 'void': case 'enum': case 'bool':
			return token.keyword
		default:
			return token.identifier
	}
}

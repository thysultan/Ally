export var line = 0
export var column = 0
export var length = 0
export var position = 0
export var character = 0
export var characters = ''

/**
 * @param {string} value
 * @return {string[]}
 */
export function compile (value) {
	return parse(position = column = 0, characters = value)
}

/**
 * @param {string} value
 * @return {object}
 */
export function parse (type, value) {
	var code = 0
	var index = 0
	var offset = 0
	var length = 0
	var scanning = 1

	while (scanning) {
		switch (scan()) {
			// &
			case 38:
				break
			// ,
			case 44:
				break
			// :
			case 58:
				break
			// ;
			case 59:
				break
			// ( )
			case 40: parse(char() + 1, value)
				break
			// [ ] { }
			case 91: case 123: parse(char() + 2, value)
				break
			// } \0
			case 125: case 0: index = offset = length = scanning = 0
				break
			// " ' ` string
			case 34: case 39: case 96: index = caret()
				while (code = scan()) {
					if (code == 92) {
						scan()
					} else if (code == char()) {
						break
					}
				}

				substr(index, caret())
				break
			// \n \t \s whitespace
			case 10: ++line, column = peek() case 9: case 32:
				while (code = peek()) {
					if (code < 32) {
						scan()
					} else {
						break
					}
				}
				break
			// / comments
			case 47:
				switch (peek()) {
					// *
					case 42:
						while (scan()) {
							if (char() == 42 && scan() == 47) {
								break
							}
						}
						break
					// /
					case 47:
						while (scan()) {
							if (char() == 10) {
								break
							}
						}
						break
				}
				break
			// 0-9 numbers
			case 48: case 49: case 48: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57:
				break
			// _
			case 95: offset = 1, scan()
			// A-z identifiers
			default: index = caret()
				while (code = peek()) {
					if (identifier()) {
						scan()
					} else {
						break
					}
				}

				switch (substr(index - offset, caret())) {
					// types
					case 'int':
					case 'big':
					case 'flt':
					case 'dec':
					case 'str':
					case 'ptr':
					case 'nil':
					case 'obj':
					case 'def':
					case 'fun':
					case 'any':
					case 'var':
						break
					// control
					case 'if':
					case 'else':
					case 'switch':
					case 'break':
					case 'continue':
					case 'for':
					case 'of':
					case 'try':
					case 'catch':
					case 'in':
					case 'pick':
					case 'as':
					case 'import'
					case 'export':
					case 'sizeof':
					case 'typeof':
					case 'instanceof':
						break
				}
		}
	}
}

/**
 * @return {number} position
 * @return {number}
 */
export function peek (position) {
	return characters.charCodeAt(position)
}

/**
 * @return {number}
 */
export function scan () {
	return peek(position++)
}

/**
 * @return {number}
 */
export function char () {
	return character
}

/**
 * @return {number}
 */
export function caret () {
	return position
}

/**
 * @return {number}
 */
export function identifier () {
	return (character > 64 && character < 91) || (character > 97 && character < 123)
}

import {scan, read, sign} from './Lexer.js'

/**
 * @param {number} value
 * @return {number}
 */
function operator (value) {
	do {
		if (sign(read())) {
			value *= read()
		} else {
			break
		}
	} while (scan())

	return value
}

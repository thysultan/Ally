import {scan, read, caret} from './Lexer.js'

/**
 * @param {number} value
 * @return {number}
 */
export function string (value) {
	while (scan()) {
		if (read() == value) {
			break
		}
	}

	return caret()
}

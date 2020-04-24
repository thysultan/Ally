import {scan, word, hash, caret} from './Lexer.js'

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function identifier (value, index) {
	do {
		value = hash(value, caret() - index)
	} while (!word(scan()))

	return value
}

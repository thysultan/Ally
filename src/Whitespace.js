import {scan, read, caret} from './Lexer.js'

/**
 * @return {number}
 */
export function whitespace () {
	do {
		if (read() > 32) {
			break
		}
	} while (scan())

	return caret()
}

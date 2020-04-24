import {scan, read, caret} from './Lexer.js'

/**
 * @param {number} value
 * @return {number}
 */
export function comment (value) {
	if (value == 47) {
		while (scan()) {
			if (read() == 10) {
				break
			}
		}
	} else {
		while (scan()) {
			if (read() == 42 && scan() == 47) {
				break
			}
		}
	}

	return caret()
}

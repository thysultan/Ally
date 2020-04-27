import {scan, read, move, caret} from './Scanner.js'

/**
 * @param {number} value
 * @return {number}
 */
export function string (value) {
	while (scan(0)) {
		if (read() == value) {
			return move(caret() + 1)
		} else {
			move(0)
		}
	}

	return caret()
}

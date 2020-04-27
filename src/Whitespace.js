import {scan, read, move, caret} from './Scanner.js'

/**
 * @param {number} value
 * @return {number}
 */
export function whitespace (value) {
	while (scan(0)) {
		if (read() > value) {
			break
		} else {
			move(0)
		}
	}

	return caret()
}

import {scan, read, move, word, hash, caret} from './Scanner.js'

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function identifier (value, index) {
	do {
		if (word(read())) {
			move(value = hash(value, caret() - index))
		} else {
			break
		}
	} while (scan(0))

	return value
}

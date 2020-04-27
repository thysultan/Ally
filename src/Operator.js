import {scan, read, move, sign} from './Scanner.js'

/**
 * @param {number} value
 * @return {number}
 */
export function operator (value) {
	while (scan(0)) {
		if (sign(read())) {
			move(value *= read())
		} else {
			break
		}
	}

	return value
}

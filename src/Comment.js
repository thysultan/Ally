import {scan, read, move} from './Scanner.js'

/**
 * @param {number} value
 * @return {number}
 */
export function line (value) {
	while (scan(0)) {
		if (move(read()) == value) {
			break
		}
	}

	return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function block (value) {
	while (scan(0)) {
		if (move(read()) == value) {
			if (scan(0) == 47) {
				return move(value)
			}
		} else {
			move(0)
		}
	}

	return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function comment (value) {
	switch (value) {
		// //
		case 47: return line(move(move(10)))
		// /*
		case 42: return block(move(move(42)))
	}

	return 0
}

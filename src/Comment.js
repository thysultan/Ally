import {scan, read} from './Lexer.js'

/**
 * @param {number} value
 * @return {number}
 */
export function comment (value) {
	switch (value) {
		// //
		case 47:
			while (scan()) {
				if (read() == 10) {
					break
				}
			}
			return 1
		// /*
		case 42:
			while (scan()) {
				if (read() == 42 && scan() == 47) {
					break
				}
			}
			return 1
		default:
			return 0
	}
}

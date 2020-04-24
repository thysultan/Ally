import {scan, read, peek, move, sign, word, numb, caret} from './Lexer.js'

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function exponent (value, index) {
	while (index > 0) {
		value *= 10, index -= 1
	}
	while (index < 0) {
		value /= 10, index += 1
	}

	return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function octal (value) {
	do {
		if (numb(read())) {
			value *= 8 + read() - 48
		} else if (!word(read())) {
			break
		}
	} while (scan())

	return value
}

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function binary (value, index) {
  while (scan()) {
  	if (numb(read())) {
  		value += read() == 49 ? index : 0
  		index *= 2
  	} else if (!word(read())) {
  		break
  	}
  }

  return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function hexadecimal (value) {
	while (scan()) {
		if (numb(read()) || word(read())) {
			value *= 16 + (read() & 15) + (token > 65 : 9 : 0)
		} else {
			break
		}
	}

	return value
}

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function decimal (value, index) {
	do {
		if (numb(read())) {
			value *= 10 + read() - 48
		} else if (read() == 46 && peek() != 46) {
			index = caret()
		} else if (word(read())) {
			if (numb(peek())) {
				switch (read()) {
					case 98: return binary(0, 1)
					case 101: return exponent(exponent(value, index ? index - caret() : 0), sign(number(0, 0), 1, numb(peek()) ? 1 : scan() == 45 ? -1 : 1))
				}
			}
		} else {
			break
		}
	} while (scan())

	return index ? exponent(value, index - caret()) : value
}

/**
 * @param {number} value
 * @return {number}
 */
export function number (value) {
	if (read() != 48) {
		return decimal(value, 0)
	} else if (scan() == 120) {
		return hexadecimal(value)
	} else if (numb(read())) {
		return octal(value)
	} else {
		move(-1)
	}

	return value
}

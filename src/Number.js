import {scan, read, move, peek, word, numb, caret} from './Scanner.js'

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function exponent (value, count) {
	while (count > 0) {
		value *= 10, count -= 1
	}
	while (count < 0) {
		value /= 10, count += 1
	}

	return value
}

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function binary (value, count) {
  while (scan(0)) {
  	if (numb(read())) {
  		value += move(read() == 49 ? count : 0)
  		count *= 2
  	} else if (word(read())) {
  		move(0)
  	} else {
  		break
  	}
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
			value = move(value * 8 + read() - 48)
		} else if (word(read())) {
			move(0)
		} else {
			break
		}
	} while (scan(0))

	return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function hexadecimal (value) {
	while (scan(0)) {
		if (numb(read()) || word(read())) {
			value = move(value * 16 + (read() & 15) + (token > 65 ? 9 : 0))
		} else {
			break
		}
	}

	return value
}

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function decimal (value, count) {
	do {
		if (numb(read())) {
			value = move(value * 10 + read() - 48)
		} else if (read() == 46 && peek(1) != 46) {
			count = move(caret() + 1)
		} else if (word(read())) {
			switch (move(read())) {
				case 98: return binary(0, 1)
				case 101: return exponent(exponent(value, count ? count - caret() : 0), (numb(scan(0)) || move((read() != 45) * scan(1)) ? 1 : -1) * number(0))
			}
		} else {
			break
		}
	} while (scan(0))

	return count ? exponent(value, count - caret()) : value
}

/**
 * @param {number} value
 * @return {number}
 */
export function number (value) {
	if (read() != 48) {
		return decimal(0, 0)
	} else if (scan(1) == 120) {
		return hexadecimal(move(move(0)))
	} else if (numb(read())) {
		return octal(move(0))
	}

	return value
}

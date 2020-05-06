import {scan, read, move, look, hash, word, numb, sign, caret} from './Scanner.js'

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

	return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function number (value) {
	if (read() != 48) {
		return number_decimal(0, 0)
	} else if (scan(1) == 120) {
		return number_hexadecimal(move(move(0)))
	} else if (numb(read())) {
		return number_octal(move(0))
	}

	return value
}

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function number_decimal (value, count) {
	do {
		if (numb(read())) {
			value = move(value * 10 + read() - 48)
		} else if (read() == 46 && look(1) != 46) {
			count = move(caret() + 1)
		} else if (word(read())) {
			switch (move(read())) {
				case 98: return number_binary(0, 1)
				case 101: return number_exponent(number_exponent(value, count ? count - caret() : 0), (numb(scan(0)) || move((read() != 45) * scan(1)) ? 1 : -1) * number(0))
			}
		} else {
			break
		}
	} while (scan(0))

	return count ? number_exponent(value, count - caret()) : value
}

/**
 * @param {number} value
 * @return {number}
 */
export function number_hexadecimal (value) {
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
 * @return {number}
 */
export function number_octal (value) {
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
 * @param {number} count
 * @return {number}
 */
export function number_binary (value, count) {
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
 * @param {number} count
 * @return {number}
 */
export function number_exponent (value, count) {
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

/**
 * @param {number} value
 * @return {number}
 */
export function comment_line (value) {
	while (scan(0)) {
		if (move(read()) == value) {
			break
		}
	}

	return 1
}

/**
 * @param {number} value
 * @return {number}
 */
export function comment_block (value) {
	while (scan(0)) {
		if (move(read()) == value) {
			if (scan(0) == 47) {
				return move(1)
			}
		} else {
			move(0)
		}
	}

	return 1
}

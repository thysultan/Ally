import {scan_char, scan_read, scan_move, scan_look, scan_hash, scan_word, scan_numb, scan_sign, scan_addr} from './Scanner.js'

/**
 * @param {number} value
 * @return {number}
 */
export function lexer_string (value) {
	while (scan_char(0)) {
		if (scan_read() == value) {
			return scan_move(scan_addr() + 1)
		} else {
			move(0)
		}
	}

	return scan_addr()
}

/**
 * @param {number} value
 * @return {number}
 */
export function lexer_operator (value, index) {
	do {
		if (scan_sign(scan_read())) {
			scan_move(value = scan_hash(value, scan_addr() - index))
		} else {
			break
		}
	} while (scan_char(0))

	return value
}

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function lexer_identifier (value, index) {
	do {
		if (scan_word(scan_read())) {
			scan_move(value = scan_hash(value, scan_addr() - index))
		} else {
			break
		}
	} while (scan_char(0))

	return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function lexer_whitespace (value) {
	while (scan_char(0)) {
		if (scan_read() > value) {
			break
		} else {
			scan_move(0)
		}
	}

	return value
}

/**
 * @param {number} value
 * @return {number}
 */
export function lexer_number (value) {
	if (scan_read() != 48) {
		return lexer_number_decimal(0, 0)
	} else if (scan_char(1) == 120) {
		return lexer_number_hexadecimal(scan_move(scan_move(0)))
	} else if (scan_numb(scan_read())) {
		return lexer_number_octal(move(0))
	}

	return value
}

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function lexer_number_decimal (value, count) {
	do {
		if (scan_numb(scan_read())) {
			value = scan_move(value * 10 + scan_read() - 48)
		} else if (scan_read() == 46 && scan_look(1) != 46) {
			count = scan_move(scan_addr() + 1)
		} else if (scan_word(scan_read())) {
			switch (scan_move(scan_read())) {
				case 98: return lexer_number_binary(0, 1)
				case 101: return lexer_number_exponent(lexer_number_exponent(value, count ? count - scan_addr() : 0), (scan_numb(scan_char(0)) || scan_move((scan_read() != 45) * scan_char(1)) ? 1 : -1) * lexer_number(0))
			}
		} else {
			break
		}
	} while (scan_char(0))

	return count ? lexer_number_exponent(value, count - scan_addr()) : value
}

/**
 * @param {number} value
 * @return {number}
 */
export function lexer_number_hexadecimal (value) {
	while (scan_char(0)) {
		if (scan_numb(scan_read()) || scan_word(scan_read())) {
			value = scan_move(value * 16 + (scan_read() & 15) + (token > 65 ? 9 : 0))
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
export function lexer_number_octal (value) {
	do {
		if (scan_numb(scan_read())) {
			value = scan_move(value * 8 + scan_read() - 48)
		} else if (scan_word(scan_read())) {
			scan_move(0)
		} else {
			break
		}
	} while (scan_char(0))

	return value
}

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function lexer_number_binary (value, count) {
  while (scan_char(0)) {
  	if (scan_numb(scan_read())) {
  		value += scan_move(scan_read() == 49 ? count : 0)
  		count *= 2
  	} else if (scan_word(scan_read())) {
  		scan_move(0)
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
export function lexer_number_exponent (value, count) {
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
export function lexer_comment (value) {
	switch (value) {
		// //
		case 47: return lexer_line(scan_move(scan_move(10)))
		// /*
		case 42: return lexer_block(scan_move(scan_move(42)))
	}

	return 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function lexer_comment_line (value) {
	while (scan_char(0)) {
		if (scan_move(scan_read()) == value) {
			break
		}
	}

	return 1
}

/**
 * @param {number} value
 * @return {number}
 */
export function lexer_comment_block (value) {
	while (scan_char(0)) {
		if (scan_move(scan_read()) == value) {
			if (scan_char(0) == 47) {
				return scan_move(1)
			}
		} else {
			scan_move(0)
		}
	}

	return 1
}

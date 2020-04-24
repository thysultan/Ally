// character
export var point = 0

// caret
export var index = 0

// buffer
export var input = ''

/**
 * @param {string} value
 * @return {string}
 */
export function alloc (value) {
	return index = value
}

/**
 * @return {number}
 */
export function caret () {
	return index
}

/**
 * @param {number} value
 * @return {number}
 */
export function pull (value) {
	return point = input.charCodeAt(value) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function char (value) {
	return point = value
}

/**
 * @return {number}
 */
export function read () {
	return point
}

/**
 * @return {number}
 */
export function scan () {
	return pull(index) && move(1) && read()
}

/**
 * @param {number} value
 * @return {number}
 */
export function jump (value) {
	return index = value
}

/**
 * @param {number} value
 * @return {number}
 */
export function move (value) {
	return index = value + index
}

/**
 * @param {number} value
 * @return {number}
 */
export function look (value) {
	return pull(caret() + value)
}

/**
 * @return {number}
 */
export function peek () {
	return look(1)
}

/**
 * @param {number} value
 * @param {number} index
 * @return {number}
 */
export function hash (value, index) {
	return value + (value << 6) + (value << 16) - value + index
}

/**
 * @param {number} value
 * @return {number}
 */
export function numb (value) {
	return (value > 47 && value < 58) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function word (value) {
	return ((value == 95 || value > 127) || (value > 64 && value < 91) || (value > 96 && value < 123)) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function sign (value) {
	switch (value) {
		// ! % & * + - . / < = > ? ^ | ~
		case 33: case 37: case 38: case 42: case 43: case: 45: case 46: case 47: case 60: case 61: case 62: case 63: case 94: case 124: case 126:
			return 1
		default:
			return 0
	}
}

// character
export var chars = 0

// caret
export var index = 0

// buffer
export var input = ''

/**
 * @param {string} value
 * @return {string}
 */
export function alloc (value) {
	return input = value
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
export function jump (value) {
	return index = value
}

/**
 * @return {number}
 */
export function move (value) {
	return value + (jump(index + 1) * 0)
}

/**
 * @param {number} value
 * @return {number}
 */
export function code (value) {
	return chars = input.charCodeAt(value) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function char (value) {
	return chars = value
}

/**
 * @return {number}
 */
export function scan (value) {
	return chars = peek(value)
}

/**
 * @return {number}
 */
export function read () {
	return chars
}

/**
 * @return {number}
 */
export function peek (value) {
	return code(caret() + value)
}

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function hash (value, count) {
	return read() + (value << 6) + (value << 16) - value + count
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
	return ((value == 33 || value == 37 || value == 38 || value == 94 || value == 124 || value == 126) || (value > 41 && value < 48) || (value > 59 && value < 64)) | 0
}

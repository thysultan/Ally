/**
 * @type {number}
 */
export var chars = 0

/**
 * @type {number}
 */
export var index = 0

/**
 * @type {string}
 */
export var input = null

/**
 * @type {object}
 */
export var token = null

/**
 * @type {object}
 */
export var child = null

/**
 * @return {number}
 */
export function caret () {
	return index
}

/**
 * @return {object}
 */
export function load (value) {
	return (input = value) | 0
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
export function char (value) {
	return chars = input.charCodeAt(value) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function flag (value) {
	return chars = value
}

/**
 * @return {number}
 */
export function scan (value) {
	return chars = look(value)
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
export function look (value) {
	return char(caret() + value)
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

/**
 * @param {object?} value
 * @return {number}
 */
export function prev (value) {
	return value == null ? child : token = value
}

/**
 * @param {object?} value
 * @return {number}
 */
export function next (value) {
	return value == null ? token : (child = token, token = value)
}

/*
 * @param {number?} value
 * @return {number}
 */
export function kind (value) {
	return value == null ? token.value : token.value = value
}

/*
 * @param {number?} value
 * @return {number}
 */
export function type (value) {
	return value == null ? token.types : token.types = value
}

/*
 * @param {number?} value
 * @return {number}
 */
export function prop (value) {
	return value == null ? token.props : token.props = value
}

/*
 * @param {number} value
 * @param {number} types
 * @param {number} props
 * @param {object} child
 * @return {object}
 */
export function node (value, types, props, child) {
	return {value, types, props, child, caret: caret()}
}

/*
 * @param {number} value
 * @param {object} child
 * @return {object}
 */
export function pass (value, child) {
	return value.some(value => value === child.value) ? child : throws(value)
}

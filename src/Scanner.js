/**
 * @type {number}
 */
export var scan_flags = 0

/**
 * @type {number}
 */
export var scan_chars = 0

/**
 * @type {number}
 */
export var scan_index = 0

/**
 * @type {string}
 */
export var scan_input = ''

/**
 * @type {object}
 */
export var scan_token = null

/**
 * @type {object}
 */
export var scan_stack = null

/**
 * @return {number}
 */
export function scan_addr () {
	return scan_index
}

/**
 * @return {object}
 */
export function scan_load (value) {
	return (scan_input = value) & scan_flag(scan_chars = 1)
}

/**
 * @param {number} value
 * @return {number}
 */
export function scan_jump (value) {
	return scan_index = value
}

/**
 * @return {number}
 */
export function scan_move (value) {
	return value + (scan_jump(scan_addr() + 1) * 0)
}

/**
 * @param {number} value
 * @return {number}
 */
export function scan_code (value) {
	return scan_chars ? scan_chars = scan_input.charCodeAt(value) | 0 : scan_chars
}

/**
 * @return {number}
 */
export function scan_char (value) {
	return scan_chars = scan_look(value)
}

/**
 * @return {number}
 */
export function scan_read () {
	return scan_chars
}

/**
 * @return {number}
 */
export function scan_look (value) {
	return scan_code(scan_addr() + value)
}

/**
 * @param {number} value
 * @param {number} count
 * @return {number}
 */
export function scan_hash (value, count) {
	return scan_read() + (value << 6) + (value << 16) - value + count
}

/**
 * @param {number} value
 * @return {number}
 */
export function scan_numb (value) {
	return (value > 47 && value < 58) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function scan_word (value) {
	return ((value == 95 || value > 127) || (value > 64 && value < 91) || (value > 96 && value < 123)) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function scan_sign (value) {
	return ((value == 33 || value == 37 || value == 38 || value == 94 || value == 124 || value == 126) || (value > 41 && value < 48) || (value > 59 && value < 64)) | 0
}

/**
 * @param {number} value
 * @return {number}
 */
export function scan_flag (value) {
	return arguments.length ? scan_flags = value : scan_flags
}

/**
 * @param {object?} value
 * @return {object}
 */
export function scan_next (value) {
	return arguments.length ? scan_stack = value : scan_stack
}

/**
 * @param {object?} value
 * @return {object}
 */
export function scan_root (value) {
	return arguments.length ? scan_token = value : scan_token
}

/*
 * @param {number?} value
 * @return {number}
 */
export function scan_kind (value) {
	return arguments.length ? scan_token.value = value : scan_token.value
}

/*
 * @param {number?} value
 * @return {number}
 */
export function scan_type (value) {
	return arguments.length ? scan_token.types = value : scan_token.types
}

/*
 * @param {number?} value
 * @return {number}
 */
export function scan_prop (value) {
	return arguments.length ? scan_token.props = value : scan_token.props
}

/*
 * @param {object?} value
 * @return {object}
 */
export function scan_list (value) {
	return arguments.length ? scan_token.child = value : scan_token.child
}

/*
 * @param {number} value
 * @param {number} types
 * @param {number} props
 * @param {object} child
 * @return {object}
 */
export function scan_node (value, types, props, child) {
	return scan_root({value, types, props, child, index: scan_addr()})
}

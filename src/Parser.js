import {token} from './Token.js'

/**
 * @param {object} value
 * @param {object} child
 * @param {object} frame
 * @return {object}
 */
export function parser (value, child, frame) {
	// do {
	// 	parse(value, value = child, frame)
	// } while (child = child.child)

	return frame
}

/**
 * @param {object} value
 * @param {object} child
 * @param {object} frame
 * @return {object}
 */
export function parse (value, child, frame) {
	switch (child.value) {
		case token.type:
			break
		case token.literal:
			break
		case token.keyword:
			break
		case token.program:
			break
		case token.operator: // expression = type, left, right
			break
		case token.identifier:
			break
		// (
		case 40: // expression
			break
		// [
		case 91: // membership
			break
		// {
		case 123: // procedure
			break
	}
}

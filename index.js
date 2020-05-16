import {parse_program} from './src/Parser.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	return parse_program(value)
}

// fun fn a {}
// fun fn a, b {}
// fun fn (a, b) {}

// types
// console.log(parse_program('int a'))

// operators
// console.log(parse_program('1 + 2 * 3'))

// functors
// console.log(parse_program('a {}'))
// console.log(parse_program('a, b {}'))
// console.log(parse_program('(a, b) {}'))
console.log(parse_program('fun name a {}'))

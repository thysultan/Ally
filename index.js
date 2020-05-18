import {Parser} from './src/Parser.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	var parser = new Parser(value)
	var program = parser.parse_program()

	return program
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
console.log(main('fun name a {}'))

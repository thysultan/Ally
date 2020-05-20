import {Parser} from './src/Parser.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	var parser = new Parser(value)
	var program = parser.parse_program()
	console.log(value)
	return program
}

// fun fn a {}
// fun fn a, b {}
// fun fn (a, b) {}

// types
// console.log(main('int a'))

// operators
// console.log(main('1 + 3 * 4'))

// functors
// console.log(main('a {}'))
// console.log(main('a, b {}'))
// console.log(main('(a, b) {}'))
console.log(main(`fun print var a, var b { return a + b + 1 }`))

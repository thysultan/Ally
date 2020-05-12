import {parse_program} from './src/Parser.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	return parse_program(value)
}

// console.log(main('fn(1,2)'))
// console.log(main('"100" var abc 123_000 111km 10e4'))
console.log(parse_program('1, typeof 2 => 1')) // (1, (typeof 2)) => 1

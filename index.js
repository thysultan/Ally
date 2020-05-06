import {parse} from './src/Parser.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	return parse(value)
}

console.log(main('fn(1,2)'))
// console.log(main('"100" var abc 123_000 111km 10e4'))

import {Parser} from './src/Parser.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	var parser = new Parser(value)
	console.log(value)
	return parser.parse_program()
}

console.log(main(`
	fun print var a, var b { return a + b + 1 }
	def state var a, var b {}
	var value = state()
`))

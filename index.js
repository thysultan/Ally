import {Compiler} from './src/Compiler.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	var compiler = new Compiler(value)
	var parser = compiler.parse_program()

	console.log(compiler.compile_program(0, parser, [], []))

	return compiler
}

console.log(main(`
	int a = 1
`))

// console.log(main(`
// 	fun print var a, var b { return a + b + 1 }
// 	print(1, 2)
// `))

import {Compiler} from './src/Compiler.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	var compiler = new Compiler(value)

	return console.log(compiler.compile_program(0, compiler.parse_program(0, null, null, [], 0), null, [], 0))
}

// fun foo = a, b => while 1 if a == b break else continue
// fun foo = a, b {
// }

// console.log(main(`(1, 2, 3)`))
// console.log(main(`if 1, 2, 3 {}`))
// console.log(main(`'abc\nxyz'`))
// console.log(main(`'abc@(1+2)\nxyz'`))
// console.log(main(`(1+2)`))
// console.log(main(`a=1`))
// console.log(main(`a`))

console.log(main(`
	var a = 20
	var b = 30
	{
		var c = 40
		var d = 50
	}
`))

// console.log(main(`
// 	fun print var a, var b { return a + b + 1 }
// 	print(1, 2)
// `))

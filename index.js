import {Compiler} from './src/Compiler.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	var compiler = new Compiler(value)

	return console.log(compiler.compile_program(0, compiler.parse_program(0, null, [], [], 0), [], [], 0))
}

// fun foo = a, b => while 1 if a == b break else continue
// fun foo = a, b {
// }

console.log(main(`
int a = 1
int b = 2

int a = 3
int b = 4
`));

// console.log(main(`
// 	fun print var a, var b { return a + b + 1 }
// 	print(1, 2)
// `))

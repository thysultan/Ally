import {Compiler} from './src/Compiler.js'

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	var compile = new Compiler(value)
	var program = compile.parse_program(0, null)
	// return JSON.stringfiy(program, null, 2)
	return console.log(program)
	// return console.log(compiler.compile_main(0, program))
}

// fun foo = a, b => while 1 if a == b break else continue
// fun foo = a, b {}
// main(`1,2,3`)
main(`if 1,2,3 {}`)
// main(`while 1, 2, 3 {}`)

// main(`'abc\nxyz'`)
// main(`'abc"xyz'`)
// main(`'abc@(1+2)\nxyz'`)
// main(`(1+2)`)
// main(`a=1`)
// main(`a`)
// main(`a = 1`)
// main(`a = 1`)
// main(`
// 	{
// 		var a = 40
// 	}
// `)
// main(`
// 	var a = 20
// 	var b = 30
// 	{
// 		var c = 40
// 		var d = 50
// 	}
// `)
// main(`
// 	fun print var a, var b { return a + b + 1 }
// 	print(1, 2)
// `)

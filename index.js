import {Compiler} from './src/Compiler.js'
function fmt (s,e,t){
	var R,i,n,b,r,c;R = () => Array(n).join(' ');
	for(i=n=0,b=r='';c=t[i++];)~s.indexOf(c)?(r+=b,b='\n'+R(++n)+c+'\n '+R(++n)):~e.indexOf(c)?b+='\n'+((n-=2)?R()+' ':'')+c+'\n'+(n?R()+' ':''):b+=c;return (r+b).replaceAll('\n\n');
}
function main (value) {
	var compile = new Compiler(value = value.trim())
	var program = compile.parse_program(0, null)
	var execute = compile.compile_program(0, program, null, [], 0)
	// execute = execute.replace(/static i64 are.*;/, '')
	// execute = execute.replace(/static i64 ars.*;/, '')
	execute = fmt('{', '}', execute).split('\n').filter(v => v.trim() == '' ? '' : v).join('\n');
	console.log(program)
	console.warn(value)
	console.info(document.body.innerHTML = `<pre>${execute}</pre>`)
}

// main(`
// // line comment
// `)

// main(`
// /* block comment */
// `)

// main(`
// var nocase
// var camelCase
// var PascalCase
// var _under_score
// var abc123
// var ALL_CAPS
// `)

// main(`
// var boolean_true = true
// var boolean_false = false
// boolean_true > boolean_false
// boolean_true != boolean_false
// `)

// main(`
// int integer = 64_000
// flt float = 64.000km
// var binary = 0b0101
// `)

// main(`
// // 1 + 2 - 3 * 4 / 5
// var counter = 123
// ++counter
// --counter
// counter++
// counter--
// `)

// main(`
// str string = "
// Hello
// World
// "
// `)

main(`
str string = 'Hello @(123) World'
`)

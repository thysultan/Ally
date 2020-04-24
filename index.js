import {char, jump, alloc} from './Scanner.js'
import {node} from './Node.js'
import {lexer} from './Lexer.js'
import {parse} from './Parse.js'

// abstract syntax tree
export var frame = null

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	return parse(char(1), lexer(jump(0), frame = node(token.program, [0, alloc(value)]), frame))
}

console.log(main('123'), frame)
// console.log(parse('"100" var abc 123_000 111km 10e4'))

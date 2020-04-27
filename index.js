import {char, jump, alloc, read} from './src/Scanner.js'
import {node} from './src/Node.js'
import {token} from './src/Token.js'
import {lexer} from './src/Lexer.js'
import {parser} from './src/Parser.js'

// abstract syntax tree
export var frame = null

/**
 * @param {string} value
 * @return {object}
 */
export function main (value) {
	return parse(lexer(char(1), frame = node(token.program, [jump(0), alloc(value)]), frame), frame.child, frame)
}

console.log(main('"100" var abc 123_000 111km 10e4'))

import {scan, read, move, peek, char, numb, word, caret} from './Scanner.js'
import {node, push} from './Node.js'
import {token} from './Token.js'
import {string} from './String.js'
import {number} from './Number.js'
import {comment} from './Comment.js'
import {keyword} from './Keyword.js'
import {operator} from './Operator.js'
import {whitespace} from './Whitespace.js'
import {identifier} from './Identifier.js'

/**
 * @param {number} value
 * @param {object} child
 * @param {object} frame
 * @return {object}
 */
export function lexer (value, child, frame) {
	do {
		switch (scan(0) == value ? 0 : read()) {
			// ) ] }
			case 0: return frame
			// [ {
			case 91: case 123: char(read() + 1)
			// (
			case 40: push(child, lexer(char(read() + 1), child = node(read(), [0, 0]), child)).props = [child.child, token.var]
				break
			// " '
			case 34: case 39: push(child, child = node(token.literal, [caret() - string(move(read())), token.str]))
				break
			// , ;
			case 44: case 59: push(child, child = node(move(read()), [0, 0]))
				break
			// \n \t \s
			case 10: case 9: case 32: whitespace(move(32))
				break
			// /
			case 47:
				if (comment(peek(1))) {
					break
				}
			default:
				if (numb(read())) {
					push(child, child = node(token.literal, [number(0), token.num]))
				} else if (word(read())) {
					push(child, child = node(keyword(char(identifier(2166136261, caret()))), [read(), token.var]))
				} else {
					push(child, child = node(token.operator, [operator(move(read())), token.var]))
				}
		}
	} while (1)
}

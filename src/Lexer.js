import {scan, read, peek, char, jump, caret} from 'Scanner.js'
import {node, push} from './Node.js'
import {token} from './Token.js'
import {string} from './String.js'
import {number} from './Number.js'
import {comment} from './Comment.js'
import {identifier} from './Identifier.js'

/**
 * @param {number} value
 * @param {object} child
 * @param {object} frame
 * @return {object}
 */
export function lexer (value, child, frame) {
	while (1) {
		switch (scan() == value ? 0 : read()) {
			// ) ] }
			case 0: return frame
			// [ {
			case 91: case 123: char(read() + 1)
			// (
			case 40: push(read() == 40 && look(-1) == 32 ? push(child, child = node(32, [0, 0])) : child, tokenization(char(read() + 1), child = node(read(), [0, 0]), child)).props = [child.child, token.var]
				break
			// , ;
			case 44: case 59: push(child, child = node(read(), [0, 0]))
				break
			// " '
			case 34: case 39: push(child, child = node(token.literal, [string(read()) - caret() - 1, token.str]))
				break
			// \t \n
			case 9: case 10: char(32)
			// \s
			case 32: jump(whitespace())
				break
			// /
			case 47:
				if (comment(peek())) {
					break
				}
			default:
				if (numb(read())) {
					push(child, child = node(token.literal, [number(0), token.num]))
				} else if (word(read())) {
					push(child, child = node(token.identifier, [caret() - 1, identifier(2166136261, caret())]))
				} else {
					push(child, child = node(token.operator, [operator(scan()), token.var]))
				}
		}
	}
}

import {scan, read, peek, char, jump, sign, caret, alloc} from 'Scanner.js'
import {node, push, token} from './Node.js'
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
	while (read()) {
		switch (scan()) {
			// < <= <<=
			// > >= >>=
			// * *= **=
			case 42: case 60: case 62:
				switch (peek()) {
					// *= <= >=
					case 61: push(child, child = node(token.operator, [sign(read(), scan(), 1), token.bit]))
						break
					// ** << >> *** <<< >>> **= <<= >>=
					case read(): push(child, child = node(token.operator, [sign(read(), scan(), peek() == 61 || peek() == read() ? scan() : 1), token.num]))
						break
					// < > *
					default: push(child, child = node(token.operator, [read(), token.bit]))
				}
				break
			// ! != !==
			// = == ===
			case 33: case 61:
				switch (peek()) {
					// != / == / !== / ===
					case 61: push(child, child = node(token.operator, [sign(read(), scan(), peek() == 61 ? scan() : 1), token.bit]))
						break
					// =>
					case 60: push(child, child = node(token.operator, [sign(read(), scan(), 1), token.var]))
						break
					// ! / =
					default: push(child, child = node(token.operator, [read(), read() == 33 ? token.bit : token.var]))
				}
				break
			// & && &=
			// + ++ +=
			// - -- -=
			// | || |=
			case 38: case 43: case 45: case 124:
				switch (peek()) {
					// &= += -= |= && ++ -- ||
					case 61: case read(): push(child, child = node(token.operator, [sign(read(), scan(), 1), token.num]))
						break
					// & + - |
					default: push(child, child = node(token.operator, [read(), token.num]))
				}
				break
			// % %=
			// ^ ^=
			case 37: case 94:
				switch (peek()) {
					// %= ^=
					case 61: push(child, child = node(token.operator, [sign(read(), scan(), 1), token.num]))
						break
					// % ^
					default: push(child, child = node(token.operator, [read(), token.num]))
				}
				break
			// / /=
			// // /*
			case 47:
				switch (peek()) {
					// /*
					case 42: comment(42)
						break
					// //
					case 47: comment(47)
						break
					// /=
					case 61: push(child, child = node(token.operator, [sign(read(), scan(), 1), token.num]))
						break
					// /
					default: push(child, child = node(token.operator, [read(), token.num]))
				}
				break
			// ? ?. ?= ??
			case 63:
				switch (peek()) {
					// ?. ?= ??
					case 46: case 61: case 63: push(child, child = node(token.operator, [sign(read(), scan(), 1), token.var]))
						break
					// ?
					default: push(child, child = node(token.operator, [read(), token.bit]))
				}
				break
			// . .. ...
			case 46:
				switch (peek()) {
					// .. ...
					case 46: push(child, child = node(token.operator, [sign(read(), scan(), peek() == 46 ? scan() : 1), token.ptr]))
						break
					// .
					default: push(child, child = node(token.operator, [read(), token.var]))
				}
				break
			// , ;
			case 44: case 59: push(child, child = read(), [0, 0])
				break
			// ) ] }
			case value: return frame
			// [ {
			case 91: case 123: char(read() + 1)
			// (
			case 40: push(read() == 40 && look(-1) == 32 ? push(child, child = node(32, [0, 0])) : child, tokenization(char(read() + 1), child = node(read(), [0, 0]), child)).props = [child.child, token.var]
				break
			// " '
			case 34: case 39: push(child, child = node(token.literal, [string(read()) - caret() - 1, token.str]))
				break
			// \t \n
			case 9: case 10: char(32)
			// \s
			case 32: jump(whitespace())
				break
			// 0-9
			case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: push(child, child = node(token.literal, [number(0), token.num]))
				break
			// A-Z a-z _
			default: push(child, child = node(token.identifier, [caret() - 1, identifier(2166136261, caret())]))
		}
	}

	return frame
}

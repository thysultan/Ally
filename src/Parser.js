import {jump, load, scan, read, move, look, flag, numb, word, root, node, kind, type, prop, caret} from './Scanner.js'
import {string, number, comment, operator, identifier, whitespace} from './Lexer.js'
import {token, identify, priority} from './Token.js'

export function parse (value) {
	return parse_group(jump(load(value)), [], root(parse_lexer()) | 0)
}

export function parse_lexer () {
	switch (scan(0)) {
		// ) ] } \0
		case 41: case 93: case 125: case 0: return
		// ( [ {
		case 40: case 91: case 123: return parse_group(read(), [], root(parse_lexer()) | 0)
		// \t \n \s
		case 9: case 10: case 32: return whitespace(move(32)) && parse_lexer()
		// " '
		case 34: case 39: return node(token.literal, token.str, caret() - string(move(read())), [])
		// /
		case 47: if (comment(look(1))) { return parse_lexer() }
	}

	if (numb(read())) {
		return node(token.literal, token.num, number(0), [])
	} else if (word(read())) {
		return node(identify(flag(identifier(2166136261, caret()))), token.var, read(), [])
	} else {
		return node(token.operator, token.var, operator(move(read())), [])
	}
}

export function parse_group (value, child, index) {
	while (root()) {
		child[index++] = parse_child(0)
	}

	return node(value, token.var, index, child)
}

// []
// 1 + 2 * 3
// a + ++a
// a++ + a
export function parse_child (value) {
	switch (kind()) {
		case token.typing: root(parse_typing(type(), root(parse_lexer())))
			break
		case token.keyword: root(parse_keyword(type(), root(parse_lexer())))
			break
		case token.operator:
	}

	return parse_operator(root(), root(parse_lexer()), value)
}

export function parse_operator (value, child, index) {
	switch (kind()) {
		case token.operator:
			if (flag(priority(prop())) > index) {
				return node(token.operator, token.var, prop(), [root(), parse_child(read())])
			}
	}

	return value
}

export function parse_typing (value, child) {
	switch (kind()) {
		case token.expression: type(~value)
			break
		case token.identifier: type(value)
			break
		default: throws('Unexpected Type Syntax:')
	}

	return child
}

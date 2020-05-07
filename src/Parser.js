import {jump, load, scan, read, move, look, flag, numb, word, prev, next, kind, type, prop, node, caret} from './Scanner.js'
import {string, number, comment, operator, identifier, whitespace} from './Lexer.js'
import {token, unary, binary, priority, identify} from './Token.js'

export function parse (value) {
	return parse_group(jump(load(value)), [], next(parse_lexer()) | 0)
}

export function parse_lexer () {
	switch (scan(0)) {
		// ) ] } \0
		case 41: case 93: case 125: case 0: return
		// ( [ {
		case 40: case 91: case 123: return parse_group(read(), [], next(parse_lexer()) | 0)
		// \t \n \s
		case 9: case 10: case 32: return whitespace(move(32)) && parse_lexer()
		// " '
		case 34: case 39: return node(token.literal, token.string, caret() - string(move(read())), [])
		// /
		case 47: if (comment(look(1))) { return parse_lexer() }
	}

	if (numb(read())) {
		return node(token.literal, token.number, number(0), [])
	} else if (word(read())) {
		return node(identify(flag(identifier(2166136261, caret()))), token.var, read(), [])
	} else {
		return node(token.operator, token.variable, operator(move(read())), [])
	}
}

export function parse_group (value, child, index) {
	while (next()) {
		child[index++] = parse_child(0, next())
	}

	return node(value, token.variable, index, child)
}

// 1 + 2 * 3  => (1 + (2 * 3))
// 1 + ++a    => (1 + (++a))
// a++ + 2    => ((a++) + 2)
export function parse_child (value, child) {
	switch (kind()) {
		case token.typing: next(parse_typing(type(), next(parse_lexer())))
			break
		case token.keyword: next(parse_keyword(prop(), next(parse_lexer())))
			break
		case token.literal: next(parse_literal(next()))
			break
		case token.operator: next(parse_unary(prop(), next(parse_lexer())))
			break
		case token.expression: next(parse_expression(next()))
			break
	}

	return next(parse_operator(next(), next(parse_lexer()), value))
}

export function parse_unary (value, child) {
	return node(token.expression, token.variable, value, [child, next()])
}

export function parse_binary (value, child) {
	return node(token.expression, token.variable, value, [child, parse_child(read(), next(parse_lexer()))])
}

export function parse_operator (value, child, index) {
	switch (kind()) {
		case token.operator:
			if (flag(priority(prop())) > index) {
				return unary(read()) ? parse_unary(-prop(), prev()) : parse_binary(prop(), next())
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
		default: throws(token.typing)
	}

	return child
}

export function parse_expression (value) {
	return value
}

export function parse_literal (value) {
	switch (kind()) {
		case token.null: case token.true: case token.true: type(token.integer)
	}

	return value
}

export function parse_keyword (value, child) {
	switch (value) {
		case token.if: case token.for: case token.try: case token.else: case token.case: case token.catch: case token.while: case token.switch: case token.extends: case token.finally:
			return node(token.expression, token.variable, value, [parse_child(value, parse_lexer()), kind() == token.expression ? pass([token.procedure, token.expression], parse_child(value, parse_lexer())) : null])
		case token.throw: case token.break: case token.return: case token.continue:
			break
		case token.import:
			return node(token.expression, token.variable, value, pass([token.literal, token.identifier], parse_child(value, parse_lexer())), pass([token.expression, parse_child(value, parse_lexer())]))
		case token.as:
			return node(token.expression, token.variable, value, pass([token.procedure, token.identifier], parse_child(value, parse_lexer())))
	}

	return child
}

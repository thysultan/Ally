import {scan_char, scan_load, scan_jump, scan_move, scan_read, scan_look, scan_numb, scan_word, scan_flag, scan_next, scan_root, scan_kind, scan_type, scan_prop, scan_node, scan_addr} from './Scanner.js'
import {lexer_string, lexer_number, lexer_comment, lexer_operator, lexer_identifier, lexer_whitespace} from './Lexer.js'
import {token, token_unary, token_identify, token_precedence} from './Token.js'

export function parse_next () {
	try {
		return parse_peek()
	} finally {
		scan_next(null)
	}
}

export function parse_peek () {
	if (scan_next()) {
		return scan_root(scan_next())
	} else {
		return scan_root(scan_next(parse_lexer()))
	}
}

export function parse_lexer () {
	switch (scan_char(0)) {
		// ] } ) \0
		case 93: case 125: case 41: case 0: scan_move(0)
			return
		// [ { (
		case 91: case 123: case 40:
			return parse_children(scan_read(), [], scan_move(0))
		// \t \n \s ;
		case 9: case 10: case 32: lexer_whitespace(scan_move(32))
			return parse_lexer()
		// # ; @
		case 35: case 59: case 64: scan_move(0)
			return parse_lexer()
		// " '
		case 34: case 39:
			return scan_node(token.literal, token.string, scan_addr() - lexer_string(scan_move(scan_read())), [])
		// /
		case 47:
			if (lexer_comment(scan_look(1))) {
				return parse_lexer()
			} else {
				scan_look(0)
			}
	}

	if (scan_numb(scan_read())) {
		return scan_node(token.literal, token.float, lexer_number(0), [])
	} else if (scan_word(scan_read())) {
		return scan_node(token_identify(scan_flag(lexer_identifier(token.offset, scan_addr()))), 0, scan_flag(), [])
	} else {
		return scan_node(token.operator, 0, lexer_operator(token.offset, scan_addr()), [])
	}
}

export function parse_program (value) {
	return parse_children(scan_jump(scan_load(value)), [], 0)
}

export function parse_children (value, child, index) {
	while (parse_next()) {
		child[index++] = parse_maybe(0, scan_root())
	}

	return scan_node(value, 0, index, child)
}

export function parse_maybe (value, child) {
	return parse_operator(parse_token(value, child), parse_peek(), value)
}

export function parse_token (value, child) {
	switch (child.value) {
		case token.typing: return parse_typing(child.props, parse_peek())
			break
		case token.literal: return parse_literal(child.types, child)
			break
		case token.keyword: return parse_keyword(child.props, [child])
			break
		case token.operator: return parse_operator(child, child, value)
			break
		case token.procedure: return parse_procedure(value, child)
			break
		case token.membership: return parse_membership(value, child)
			break
		case token.identifier: return parse_identifier(child, parse_peek())
			break
		case token.expression:
			break
	}

	return child
}

export function parse_operator (value, child, index) {
	switch (child?.value) {
		case token.operator:
			if (value == child) {
				return parse_maybe(index, parse_expression(child.props, [scan_node(token.literal, child.types, 0, []), value, parse_token(child.props, parse_next())]))
			} else if (token_unary(child.props)) {
				return parse_maybe(index, parse_expression(child.props, [value, parse_token(child.props, parse_next())]))
			} else if (token_precedence(child.props) > token_precedence(index)) {
				return parse_maybe(index, parse_expression(child.props, [value, parse_next(), parse_binary(child.props, parse_maybe(child.props, parse_next()))]))
			}
	}

	return value
}

export function parse_binary (value, child) {
	switch (child?.value) {
		case token.operator:
			return parse_exception(value)
	}

	return child
}

export function parse_typing (value, child) {
	switch (value.value) {
		case token.function:
			break
		case token.definition:
			break
	}

	switch (child?.value) {
		case token.expression: child.types = -value
			break
		case token.identifier: child.types = value
			break
		default: parse_exception(token.typing)
	}

	return child
}

export function parse_literal (value, child) {
	switch (child.types) {
		case token.float: child.types = child.props % 1 ? token.float : token.integer
			break
		case token.string:
			break
	}

	return child
}

export function parse_keyword (value, child) {
	switch (value) {
		case token.if:
		case token.for:
		case token.try:
		case token.else:
		case token.case:
		case token.catch:
		case token.while:
		case token.switch:
		case token.extends:
		case token.finally: child = [parse_maybe(value, parse_next())]
			switch (child[0].value) {
				case token.procedure:
					return parse_statement(value, child)
				case token.expression:
					switch (child = [child[0], parse_maybe(value, parse_next())], child[1]) {
						case token.procedure:
						case token.statement:
						case token.expression:
							return parse_statement(value, child)
					}
			}
			break
		case token.throw:
		case token.break:
		case token.return:
		case token.continue: child = [parse_maybe(value, parse_peek())]
			switch (child[0].value) {
				case token.literal:
				case token.procedure:
				case token.membership:
				case token.expression:
				case token.identifier:
					return parse_statement(value, [child[0], parse_maybe(value, parse_next())])
				default:
					return parse_statement(value, [])
			}
			break
		case token.import: child = [parse_maybe(value, parse_next())]
			switch (child[0].value) {
				case token.literal:
				case token.identifier: child = [child[0], parse_maybe(value, parse_next())]
					switch (child[1]) {
						case token.statement:
						case token.identifier:
							return parse_statement(value, child)
					}
			}
			break
		case token.as: child = [parse_maybe(value, parse_next())]
			switch (child[0].value) {
				case token.procedure:
				case token.identifier:
					return parse_statement(value, child)
			}
			break
		case token.true:
		case token.false:
			return parse_literal(child.types = token.character, child)
	}

	parse_exception(value)
}

export function parse_statement (value, child) {
	return scan_node(token.statement, value, value, child)
}

export function parse_procedure (value, child) {
	return child
}

export function parse_expression (value, child) {
	return scan_node(token.expression, value, value, child)
}

export function parse_membership (value, child) {
	return child
}

export function parse_identifier (value, child) {
	switch (child?.value) {
		case token.expression:
			return parse_token(0, scan_node(token.identifier, 0, token.expression, [value, parse_next()]))
		case token.membership:
			return parse_token(0, scan_node(token.membership, 0, token.membership, [value, parse_next()]))
	}

	return value
}

export function parse_exception (value) {
	throw value
}

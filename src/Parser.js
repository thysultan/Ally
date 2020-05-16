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
		return scan_node(token.literal, token.integer, lexer_number(0), [])
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

	return value * index == 40 ? child[0] : scan_node(value, index, 0, child)
}

export function parse_maybe (value, child) {
	return parse_operator(value, parse_token(value, child), parse_peek())
}

export function parse_token (value, child) {
	switch (child.value) {
		case token.typing:
			return parse_typing(child, parse_token(value, parse_next()))
		case token.literal:
			return parse_literal(child)
		case token.keyword:
			return parse_keyword(child.props, child)
		case token.operator:
			return parse_operator(value, child, child)
		case token.procedure:
			return parse_expression(value, child.value, child)
		case token.identifier: case token.membership: case token.expression:
			if (value != token.sequence) {
				return parse_identifier(child, parse_peek())
			}
	}

	return child
}

export function parse_operator (value, child, right) {
	switch (right?.value) {
		case token.operator:
			if (child == right) {
				return parse_maybe(value, parse_expression(0, right.props, [child, parse_token(right.props, parse_next())]))
			} else if (token_unary(right.props)) {
				return parse_maybe(value, parse_expression(0, right.props, [child, parse_token(right.props, parse_next())]))
			} else if (token_precedence(right.props) > token_precedence(value)) {
				return parse_maybe(value, parse_expression(0, right.props, [child, parse_next(), parse_maybe(right.props, parse_next())]))
			}
	}

	return child
}

export function parse_types (value, child) {
	switch (child?.value) {
		case token.identifier:
			return parse_expression(value.props, token.declaration, [value, child])
		case token.expression:
			return parse_expression(value.props, token.typing, [value, child])
	}

	return parse_exception(token.typing, child.value, [value, child])
}

export function parse_literal (value, child) {
	switch (child.types) {
		case token.string:
			return parse_expression(child.types, child.value, [child])
		case token.integer:
			return parse_expression(child.types = child.props % 1 ? token.float : token.integer, child.value, [child])
	}

	return parse_expression(child.types, child.props, [child])
}

export function parse_identifier (value, child) {
	switch (child?.value) {
		case token.procedure:
			return parse_statement(0, token.function, [value, parse_next()])
		case token.membership:
			return parse_identifier(parse_expression(0, -token.membership, [value, parse_next()]), parse_peek())
		case token.expression:
			return parse_identifier(parse_expression(0, -token.expression, [value, parse_next()]), parse_peek())
		case token.operator:
			if (child.props == token.returns) {
				return parse_statement(0, token.function, [value, parse_expression(0, child.props, parse_maybe(0, parse_next()))])
			}
	}

	return value.value == token.expression ? value : parse_expression(0, value.props, [value])
}

export function parse_keyword (value, child) {
	switch (value) {
		case token.if: case token.for: case token.try: case token.else: case token.case: case token.await: case token.catch: case token.while: case token.switch: case token.extends: case token.finally:
		case token.break: case token.throw: case token.return: case token.continue:
			switch ((child = parse_maybe(0, parse_next())).value) {
				case token.statement:
				case token.expression:
					return parse_statement(0, value, [child])
			}
			break
		case token.import:
			switch ((child = parse_maybe(0, parse_next())).value) {
				case token.expression:
					return parse_statement(0, value, [child, parse_maybe(0, parse_next())])
			}
			break
		case token.as:
			switch ((child = parse_maybe(0, parse_next())).value) {
				case token.expression:
					return parse_statement(0, value, [child])
			}
			break
		case token.true:
		case token.false:
			return parse_literal(child)
	}

	return parse_exception(token.statement, value, [child])
}

export function parse_statement (types, props, child) {
	return scan_node(token.statement, types, props, child)
}

export function parse_expression (types, props, child) {
	return scan_node(token.expression, types, props, child)
}

export function parse_exception (types, props, child) {
	throw types
}

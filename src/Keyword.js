import {token} from './Token.js'

/*
 * @param {number} value
 * @return {number} value
 */
export function keyword (value) {
	switch (value) {
		// types
		case token.bit:
		case token.int:
		case token.flt:
		case token.big:
		case token.dec:
		case token.num:
		case token.str:
		case token.obj:
		case token.ptr:
		case token.nil:
		case token.def:
		case token.fun:
		case token.var:
			return token.type
		// literals
		case token.null:
		case token.true:
		case token.false:
			return token.literal
		// keywords
		case token.as:
		case token.in:
		case token.if:
		case token.for:
		case token.try:
		case token.pick:
		case token.else:
		case token.case:
		case token.throw:
		case token.break:
		case token.super:
		case token.await:
		case token.catch:
		case token.keyof:
		case token.switch:
		case token.return:
		case token.import:
		case token.export:
		case token.delete:
		case token.typeof:
		case token.sizeof:
		case token.default:
		case token.extends:
		case token.finally:
		case token.continue:
		case token.instanceof:
			return token.keyword
		// identifiers
		default:
			return token.identifier
	}
}

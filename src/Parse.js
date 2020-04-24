import {token} from './Token.js'

/**
 * @param {object} value
 * @return {object}
 */
export function parse (value, child) {
	do {
		switch (child.value) {
			case token.literal:
				break
			case token.program:
				break
			case token.operator: // expression = type, left, right
				break
			case token.identifier: // type? keyword? expression?
				switch (child.props[1]) {
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
					case token.var: child.value = token.type
						switch (child.child.value) {
							// variable int foo
							case token.identifier: child.child.props[1] = child.props[1]
								break
							// casting int(0.4)
							case token.expression: child.child.props[1] = child.props[1] * -1
								break
							// generics int[4]
							case token.membership: child.child.props[1] = child.props[1] * -1
								// obj[type] identifier
								// obj[2] sam // array of 2 objects
								// obj[Person] sam // obj of Person definition
								break
						}
						break
					// literal
					case token.nan:
					case token.null:
					case token.true:
					case token.false: child.value = token.literal
						break
					// keywords
					case token.as:
					case token.import:
					case token.export:

					case token.throw:
					case token.break:
					case token.return:
					case token.continue:

					case token.keyof:
					case token.typeof:
					case token.sizeof:
					case token.instanceof:

					case token.pick:
					case token.await:
					case token.delete:

					case token.in:
					case token.if:
					case token.for:
					case token.else:
					case token.case:
					case token.switch:
					case token.default:

					case token.try:
					case token.catch:
					case token.finally:

					case token.super:
					case token.extends: child.value = token.keyword
					// identifiers
					default:
						break
				}
				break
			// (
			case 40: // expression
				break
			// [
			case 91: // membership
				break
			// {
			case 123: // procedure
				break
		}
	} while (child = child.child)

	return child
}

export var token = {
	// nodes
	program: 0, typing: 1, caller: 2, literal: 3, keyword: 4, operator: 5, statement: 6, identifier: 7, procedure: 123, expression: 41, membership: 93, declaration: 61,
	// types
	integer: -1010090581, float: -1035006294, string: -927081939, object: -961308749, definition: -1051988511, function: -1034415909, variable: -903543805,
	// literals
	null: -2806273074, true: 1853055989, false: -1072102688,
	// keywords
	as: 1677796248, if: 1678321027,
	for: -1034809499, try: -918951625, new: 0,
	pick: -1344827128, else: 2979449664, case: 1327398711,
	throw: -1079622077, break: -1009323364, super: -678666376, catch: -130785800,
	while: 0, switch: 3028315292, return: 3624757432, import: 1926321549, export: 4383565212,
	default: -2052167745, extends: -6732737417, finally: 2779395649, continue: -1763732208,
	// operators(keywords)
	in: 1678321035, of: 0,
	await: 1721527123, delete: 629840307,
	keyof: -734729869, typeof: 2430491513, sizeof: 221262240, instanceof: -4091102314,
	// operators(symbols)
	jee: 0, jne: 0, nul: 0, inc: 0, dec: 0, seq: 0, dot: 0, opt: 0, inv: 0, cmp: 0, cmn: 0
	orr: 0, and: 0, ror: 0, xor: 0, end: 0, shl: 0, shr: 0, sal: 0, sar: 0, add: 0, sub: 0, mod: 0, div: 0, mul: 0, pow: 0, exp: 40, grp: 91, not: 0, ltn: 0, gtn: 0,
	eqq: 0, noq: 0, adq: 0, suq: 0, diq: 0, moq: 0, enq: 0, xoq: 0, roq: 0, muq: 0, exq: 0, slq: 0, srq: 0, slq: 0, srq: 0, ltq: 0, gtq: 0,
}

export function unary (value) {
	return value == 17
}

export function binary (value) {
	return value != 17
}

export function priority (value) {
	switch (value) {
		// ,
		case token.seq:
			return 1
		// =
		case token.declaration:
		// += -= /= %= &= ^= |=
		case token.adq: case token.suq: case token.diq: case token.moq: case token.enq: case token.xoq: case token.roq:
		// *= **=
		case token.muq: case token.exq:
		// <<= >>= <<<= >>>=
		case token.slq: case token.srq: case token.slq: case token.srq:
			return 2
		// ? :
		case token.jee: case token.jne:
			return 3
		// ||
		case token.orr:
			return 4
		// &&
		case token.and:
			return 5
		// ??
		case token.nul:
			return 6
		// |
		case token.ror:
			return 7
		// ^
		case token.xor:
			return 8
		// &
		case token.end:
			return 9
		// == != === !==
		case token.eqq: case token.noq: case token.cmp: case token.cmn:
			return 10
		// < <= > >= in of instanceof
		case token.ltn: case token.ltq: case token.gtn: case token.gtq: case token.in: case token.of: case token.pick case token.instanceof:
			return 11
		// << >> <<< >>>
		case token.shl: case token.shr: case token.sal: case token.sar:
			return 12
		// + -
		case token.add: case token.sub:
			return 13
		// % / *
		case token.mod: case token.div: case token.mul:
			return 14
		// **
		case token.pow:
			return 15
		// await delete keyof typeof
		case token.await: case token.delete: case token.keyof: case token.typeof:
			return 16
		// ! ~ ++ --
		case token.not: case token.inv: case token.inc: case token.dec:
			return 17
		// . ?. [
		case token.dot: case token.opt: case token.grp:
			return 18
		// (
		case token.exp:
			return 19
	}

	return 0
}

export function identify (value) {
	switch (value) {
		// types
		case token.integer: case token.float: case token.string: case token.object: case token.definition: case token.function: case token.variable:
			return token.typing
		// literals
		case token.null: case token.true: case token.false:
			return token.literal
		// keywords
		case token.if: case token.for: case token.try: case token.else: case token.case: case token.catch: case token.while: case token.switch: case token.extends: case token.finally:
		case token.throw: case token.break: case token.return: case token.continue:
		case token.import: case token.as:
			return token.keyword
		// operators
		case token.in: case token.of:
		case token.pick: case token.await: case token.delete:
		case token.keyof: case token.typeof: case token.sizeof: case token.instanceof:
			return token.operator
		// identifiers
		default:
			return token.identifier
	}
}

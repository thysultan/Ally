export var token = {
	// nodes
	program: 0, typing: 1, caller: 2, literal: 3, keyword: 4, operator: 5, statement: 6, identifier: 7, procedure: 123, expression: 41, membership: 93, declaration: 61,
	// types
	bit: -1068249111, int: -1010090581, flt: -1035006294, big: -1068249124, dec: -1051988514, num: -968323870,
	nil: -969111059, str: -927081939, obj: -961308749, def: -1051988511, fun: -1034415909, var: -903543805,
	// literals
	null: -2806273074, true: 1853055989, false: -1072102688,
	// keywords
	as: 1677796248, if: 1678321027,
	for: -1034809499, try: -918951625, new: 0,
	pick: -1344827128, else: 2979449664, case: 1327398711,
	throw: -1079622077, break: -1009323364, super: -678666376, catch: -130785800,
	switch: 3028315292, return: 3624757432, import: 1926321549, export: 4383565212,
	default: -2052167745, extends: -6732737417, finally: 2779395649, continue: -1763732208,
	// operators(keywords)
	in: 1678321035, of: 0,
	await: 1721527123, delete: 629840307,
	keyof: -734729869, typeof: 2430491513, sizeof: 221262240, instanceof: -4091102314,
	// operators(symbols)
	je: 0, jne: 0, nul: 0, inc: 0, red: 0, seq: 0, dot: 0, opt: 0, inv: 0,
	or: 0, and: 0, ror: 0, xor: 0, end: 0, shl: 0, shr: 0, sal: 0, sar: 0, add: 0, sub: 0, mod: 0, div: 0, mul: 0, pow: 0, exp: 40, grp: 91, not: 0, lt: 0, gt: 0,
	eq: 0, neq: 0, cmp: 0, cmq: 0, addeq: 0, subeq: 0, diveq: 0, modeq: 0, endeq: 0, xoreq: 0, roreq: 0, muleq: 0, expeq: 0, shleq: 0, shreq: 0, saleq: 0, sareq: 0, lteq: 0, gteq: 0,
}

export function identify (value) {
	switch (value) {
		// types
		case token.bit: case token.int: case token.flt: case token.big: case token.dec: case token.num:
		case token.nil: case token.str: case token.obj: case token.def: case token.fun: case token.var:
			return token.typing
		// literals
		case token.null: case token.true: case token.false:
			return token.literal
		// keywords
		case token.as: case token.if:
		case token.for: case token.try: case token.new:
		case token.pick: case token.else: case token.case:
		case token.throw: case token.break: case token.super: case token.catch:
		case token.switch: case token.return: case token.import: case token.export:
		case token.default: case token.extends: case token.finally: case token.continue:
			return token.keyword
		// operators
		case token.in: case token.of:
		case token.await: case token.delete:
		case token.keyof: case token.typeof: case token.sizeof: case token.instanceof:
			return token.operator
		// identifiers
		default:
			return token.identifier
	}
}

export function priority (value) {
	switch (value) {
		// ,
		case token.seq:
			return 1
		// =
		case token.declaration:
		// += -= /= %= &= ^= |=
		case token.addeq: case token.subeq: case token.diveq: case token.modeq: case token.endeq: case token.xoreq: case token.roreq:
		// *= **=
		case token.muleq: case token.expeq:
		// <<= >>= <<<= >>>=
		case token.shleq: case token.shreq: case token.saleq: case token.sareq:
			return 2
		// ? :
		case token.je: case token.jne:
			return 3
		// ||
		case token.or:
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
		case token.eq: case token.neq: case token.cmp: case token.cmq:
			return 10
		// < <= > >= in of instanceof
		case token.lt: case token.lteq: case token.gt: case token.gteq: case token.in: case token.of: case token.instanceof:
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
		case token.not: case token.inv: case token.inc: case token.red:
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

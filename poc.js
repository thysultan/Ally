// interface: {type: 'string', props: string[], children: interface[], source: float}

// program: {type: 'program', props: [], children: []}
// literal: {type: 'literal', props: ['type', 'value'], children: []}
// identifier: {type: 'identifier', props: ['type', 'identifier'], children: []}
// declaration: {type: 'declaration', props: ['type', 'identifier'], children: []}
// expression: {type: 'expressin', props: ['type', 'operator'], children: []}
// statement: {type: 'statement', props: ['type', 'keyword'], children: []}
// procedure: {type: 'procedure', props: ['type', 'length'], children: []}
// operator: {type: 'operator', props: [], children: []}

/*
{
	type: 'program',
	props: [],
	children: []
}
*/

/*
int number = 10 000km

{
	type: 'declaration',
	props: ['int', 'number'],
	children: {
		type: 'literal',
		props: ['int', '10000'],
		children: []
	}
}

obj object = {int length = 0, str string: 'a'}

{
	type: 'declaration',
	props: ['obj', 'object'],
	children: [
		{
			type; 'literal',
			props: ['obj', '2'],
			children: [
				{
					type: 'declaration',
					props: ['int', 'length'],
					children: {
						type: 'literal',
						props: ['int', '0'],
						children: []
					}
				},
				{
					type: 'declaration',
					props: ['str', 'string'],
					children: {
						type: 'literal',
						props: ['str', 'a'],
						children: []
					}
				}
			]
		}
	]
}

ptr rawptr = {1024}

{
	type: 'declaration',
	props: ['ptr', 'rawptr'],
	children: [
		{
			type: 'literal',
			props: ['ptr', '1024'],
			children: []
		}
	]
}

a = b = c // (a = (b = c))

{
	type: 'expression',
	props: ['any', 'assignment'],
	children: [
		{
			type: 'identifier',
			props: ['any', 'a'],
			children: []
		},
		{
			type: 'expression',
			props: ['any', 'equal'],
			children: [
				{
					type: 'identifier',
					props: ['any', 'b']
					children: []
				},
				{
					type: 'identifier',
					props: ['any', 'c'],
					children: []
				}
			]
		}
	]
}

fun fib name, age {
	return int a = 1
}

{
	type: 'declaration',
	props: ['fun', 'fib'],
	children: [
		{
			type: 'declaration',
			props: ['name', 'age'],
			children: [
				{
					type: 'identifier',
					props: ['any', 'name'],
					children: []
				},
				{
					type: 'identifier',
					props: ['any', 'age'],
					children: []
				}
			]
		},
		{
			type: 'procedure',
			props: ['fun', '2'],
			children: [
				{
					type: 'statement',
					props: ['any', 'return'],
					children: [
						{
							type: 'declaration',
							props: ['int', 'a'],
							children: [
								{
									type: 'literal',
									props: ['int', '1'],
									children: []
								}
							]
						}
					]
				}
			]
		}
	]
}

for int i = 0, int j = 0, i < 10, i++ {}

{
	type: 'statement',
	props: ['nil', 'for'],
	children: [
		{
			type: 'declaration',
			props: ['i', 'j'],
			children: [
				{
					type: 'identifier',
					props: ['int', 'i'],
					children: [
						{
							type: 'literal',
							props: ['int', '0'],
							children: []
						}
					]
				},
				{
					type: 'identifier',
					props: ['int', 'j'],
					children: [
						{
							type: 'literal',
							props: ['int', '0'],
							children: []
						}
					]
				}
			]
		},
		{
			type: 'expression',
			props: ['bool', 'compare'],
			children: [
				{
					type: 'identifier',
					props: ['int', 'i']
					children: []
				},
				{
					type: 'literal',
					props: ['int', '10']
					children: []
				}
			]
		},
		{
			type: 'expression',
			props: ['int', 'addition'],
			children: [
				{
					type: 'identifier',
					props: ['int', 'i']
					children: []
				},
				{
					type: 'literal',
					props: ['int', '1']
					children: []
				}
			]
		},
		{
			type: 'procedure',
			props: ['for', 'condition'],
			children: []
		}
	]
}
*/

export var line = 0
export var column = 0
export var length = 0
export var position = 0
export var character = 0
export var characters = ''

export function allocate (value) {
	characters = value, position = column = 0
}

/**
 * @param {string} value
 * @return {string[]}
 */
export function compile (value) {
	return parse(position = column = 0, 0, [characters = value], [])
}

/**
 * @param {string} value
 * @param {number} type
 * @param {number} context
 * @return {object}
 */
export function parse (context, type, props, children) {
	var code = 0
	var index = 0
	var offset = 0
	var length = 0
	var position = 0
	var scanning = 1

	while (scanning) {
		switch (next()) {
			// \0 ) ] }
			case 0: case type: index = offset = length = position = scanning = 0
				break
			// ,
			case 44:
				break
			// ;
			case 59:
				break
			// ! % & * + - / < = > ^ |
			case 33; case 37: case 38: case 42: case 43: case 45: case 47: case 60: case 61: case 62: case 94: case 124:
				break
			// [ {
			case 91: case 123: shift(1)
			// ( )
			case 40: parse(context, char() + 1, props, children)
				break
			// " ' ` string
			case 34: case 39: case 96: position = caret()
				while (code = next()) {
					if (code == 92) {
						next()
					} else if (code == char()) {
						break
					}
				}

				substr(position, caret())
				break
			// \t \n \s whitespace
			case 9: case 10: case 32: ++line, column = caret() case 9: case 32:
				while (code = peek()) {
					if (code < 32) {
						next()
					} else {
						break
					}
				}
				break
			// / comments
			case 47:
				switch (peek()) {
					// *
					case 42:
						while (next()) {
							if (char() == 42 && next() == 47) {
								break
							}
						}
						break
					// /
					case 47:
						while (next()) {
							if (char() == 10) {
								break
							}
						}
						break
				}
				break
			// 0-9 numbers
			case 48: case 49: case 48: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: position = caret()
				while (code = next()) {
					if (code < 32) {
						whitespace()
					} else if (code > 64) {
						identifier()
					}
				}

				substr(position, caret())
				break
			// _
			case 95: offset = 1, next()
			// A-z identifiers
			default: position = caret()
				while (code = peek()) {
					if (identifier()) {
						next()
					} else {
						break
					}
				}

				// keywords
				switch (substr(position - offset, caret())) {
					// types
					case 'int':
					case 'big':
					case 'flt':
					case 'dec':
					case 'str':
					case 'ptr':
					case 'nil':
					case 'obj':
					case 'any':
					case 'var':
						break
					case 'def':
					case 'fun':
						break
					// control
					case 'if':
					case 'else':
					case 'switch':
					case 'for':
					case 'try':
					case 'catch':
					case 'break':
					case 'continue':
					case 'pick':
					case 'of':
					case 'in':
					case 'as':
					case 'import':
					case 'export':
					case 'sizeof':
					case 'typeof':
					case 'instanceof':
						break
				}
		}
	}
}

/**
 * @param {number} position
 * @return {number}
 */
export function peek (position) {
	return characters.charCodeAt(position)
}

/**
 * @return {number}
 */
export function next () {
	return character = peek(position++)
}

/**
 * @return {number}
 */
export function prev () {
	return character = peek(position--)
}

/**
 * @return {number}
 */
export function char () {
	return character
}

/**
 * @param {number} distance
 * @return {number}
 */
export function shift (distance) {
	return character += distance
}

/**
 * @return {number}
 */
export function caret () {
	return position
}

/**
 * @return {number}
 */
export function identifier () {
	return (character > 64 && character < 91) || (character > 97 && character < 123)
}

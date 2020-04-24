// tokens
export var token = {
	// nodes
	noop: 0, type: 1, program: 2, keyword: 3, literal: 4, operator: 5, statement: 6, procedure: 7, declaration: 8, identifier: 9, expression: 10, membership: 11,
	// types
	bit: 0, int: 0, flt: 0, big: 0, dec: 0, num: 0, str: 0, obj: 0, ptr: 0, nil: 0, def: 0, fun: 0, var: 0,
	// literals
	nan: 0, null: 0, true: 0, false: 0,
	// keywords
	as: 0, import: 0, export: 0, throw: 0, break: 0, return: 0, continue: 0, keyof: 0, typeof: 0, sizeof: 0, instanceof: 0,
	in: 0, if: 0, for: 0, else: 0, case: 0, switch: 0, default: 0, super: 0, extends: 0, pick: 0, await: 0, delete: 0, try: 0, catch: 0, finally: 0,
}

/*
 * @param {object} value
 * @param {object} child
 * @return {object}
 */
export function push (value, child) {
	return value.child = child
}

/*
 * @param {number} value
 * @param {object} props
 * @return {object}
 */
export function node (value, props) {
	return {value, props, caret: caret(), child: null}
}

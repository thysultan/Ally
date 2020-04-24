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

import {Compiler} from './src/Compiler.js'

export function fmts (value) {
	switch (value) {
		case this.token_typings: return 'typings'
		case this.token_literal: return 'literal'
		case this.token_keyword: return 'keyword'
		case this.token_operator: return 'operator'
		case this.token_statement: return 'statement'
		case this.token_identifier: return 'identifier'
		case this.token_expression: return 'expression'
		case this.token_parameters: return 'parameters'
		case this.token_membership: return 'membership'
		case this.token_subroutine: return 'subroutine'
		case this.token_enviroment: return 'enviroment'
		case this.token_integer: return 'int'
		case this.token_float: return 'flt'
		case this.token_string: return 'str'
		case this.token_object: return 'obj'
		case this.token_definition: return 'def'
		case this.token_function: return 'fun'
		case this.token_variable: return 'var'
		case this.token_assembly: return 'asm'
		case this.token_nullable: return 'nil'
		case this.token_do: return 'do'
		case this.token_if: return 'if'
		case this.token_for: return 'for'
		case this.token_try: return 'try'
		case this.token_else: return 'else'
		case this.token_case: return 'case'
		case this.token_catch: return 'catch'
		case this.token_while: return 'while'
		case this.token_switch: return 'switch'
		case this.token_extends: return 'extends'
		case this.token_finally: return 'finally'
		case this.token_throw: return 'throw'
		case this.token_break: return 'break'
		case this.token_return: return 'return'
		case this.token_continue: return 'continue'
		case this.token_import: return 'import'
		case this.token_as: return 'as'
		case this.token_in: return 'in'
		case this.token_of: return 'of'
		case this.token_is: return 'is'
		case this.token_or: return 'or'
		case this.token_and: return 'and'
		case this.token_not: return 'not'
		case this.token_void: return 'void'
		case this.token_pick: return 'pick'
		case this.token_yield: return 'yield'
		case this.token_await: return 'await'
		case this.token_delete: return 'delete'
		case this.token_typeof: return 'typeof'
		case this.token_sizeof: return 'sizeof'
		case this.token_instanceof: return 'instanceof'
		case this.token_terminate: return 'terminate'
		case this.token_separator: return 'separator'
		case this.token_direction: return 'direction'
		case this.token_initialize: return 'initialize'
		case this.token_assignment: return 'assignment'
		case this.token_assignment_addition: return 'assignment_addition'
		case this.token_assignment_subtract: return 'assignment_subtract'
		case this.token_assignment_divide: return 'assignment_divide'
		case this.token_assignment_modulo: return 'assignment_modulo'
		case this.token_assignment_bitwise: return 'assignment_bitwise'
		case this.token_assignment_bitwise_xor: return 'assignment_bitwise_xor'
		case this.token_assignment_bitwise_or: return 'assignment_bitwise_or'
		case this.token_assignment_multiply: return 'assignment_multiply'
		case this.token_assignment_exponent: return 'assignment_exponent'
		case this.token_assignment_shift_left: return 'assignment_shift_left'
		case this.token_assignment_shift_right: return 'assignment_shift_right'
		case this.token_assignment_shift_left_unsigned: return 'assignment_shift_left_unsigned'
		case this.token_assignment_shift_right_unsigned: return 'assignment_shift_right_unsigned'
		case this.token_assignment_optional: return 'assignment_optional'
		case this.token_less_than: return 'less_than'
		case this.token_greater_than: return 'greater_than'
		case this.token_equal_less_than: return 'equal_less_than'
		case this.token_equal_greater_than: return 'equal_greater_than'
		case this.token_logical_if: return 'token_logical_if'
		case this.token_logical_or: return 'logical_or'
		case this.token_logical_and: return 'logical_and'
		case this.token_nullish: return 'nullish'
		case this.token_bitwise_or: return 'bitwise_or'
		case this.token_bitwise_xor: return 'bitwise_xor'
		case this.token_bitwise_and: return 'bitwise_and'
		case this.token_compare: return 'compare'
		case this.token_uncompare: return 'uncompare'
		case this.token_deep_compare: return 'deep_compare'
		case this.token_deep_uncompare: return 'deep_uncompare'
		case this.token_shift_left: return 'shift_left'
		case this.token_shift_right: return 'shift_right'
		case this.token_shift_left_unsigned: return 'shift_left_unsigned'
		case this.token_shift_right_unsigned: return 'shift_right_unsigned'
		case this.token_addition: return 'addition'
		case this.token_subtract: return 'subtract'
		case this.token_modulous: return 'modulous'
		case this.token_division: return 'division'
		case this.token_multiply: return 'multiply'
		case this.token_exponent: return 'exponent'
		case this.token_logical_not: return 'logical_not'
		case this.token_bitwise_not: return 'bitwise_not'
		case this.token_increment: return 'increment'
		case this.token_decrement: return 'decrement'
		case this.token_properties: return 'properties'
		case this.token_properties_optional: return 'properties_optional'
		case this.token_generator: return 'generator'
		case this.token_spreading: return 'spreading'
		case this.token_destructuring: return 'destructuring'
		default: return value
	}
}

export function main (value) {
	var compile = new Compiler(value = value.trim())
	var program = compile.parse_program(0, null)
	console.log(program)
	console.log(JSON.stringify(program, function (key, value) {
	  switch (key) {
	  	case 'index':
	  	case 'count':
	  		return value
	  	case 'state':
	  	case 'caret':
	  	case 'frame':
	  	case 'scope':
	  		return undefined
	  	case 'types':
	  		if (typeof value == 'object') {
	  			return 'var'
	  		}
	  	default:
	  		return fmts.call(compile, value)
	  }
	}, 2))

	console.log(compile.compile_program(0, program, program, [], 0))
}

// fun foo = a, b => while 1 if a == b break else continue
// fun foo = a, b {}
// main(`a.b[]`)
// main(`a[0][1]`)
// main(`a(0)(1)`)
// main(`1,2,3`)
// main(`if 1,2,3 {}`)
// main(`while 1, 2, 3 {}`)
// main(`do{}while 1`)
// main(`({a=1})`)
// main(`'abc\nxyz'`)
// main(`'abc"xyz'`)
// main(`'abc@(1+2)\nxyz'`)
// main(`(1+2)`)
// main(`1+2=>3`)
// main(`1*2+3`)
// main(`a=1`)
// main(`a`)
// main(`p
// 	{
// 		var a = 40
// 		a
// 	}
// `)
// main(`
// var a = 20
// var b = 30
// {
// 	var c = 40
// 	var d = 50
// 	c
// }
// `)
// main(`
// case 0,1 => 2
// `)
// main(`
// var is
// var not
// `)
// main(`
// fun bar (a,b=1) {return faz(1,2)}
// `)
// main(`
// 	fun print (var a, var b) { return a + b + 1 }
// 	print(1, 2)
// `)

// main('a + b')
// main('a = {a: 1}')
main('while 1 a = 1')
// main('if 2 a = 3')
// main('if 2 var a = 3')

/*
{
	i64 rsi=1;
	i64 rbp[5+rsi];
	rax=ptr_to_any(argx);
	p64 argx=rbp+5;
	argx[-1]=rsi;
	argx[-2]=rax;
	rcx=argx;
	p64 rdx=rcx;
	{
		rcx=argx;
		rcx=&rcx[0];
		rax=*rcx;
		i64 rbx=rax;
		p64 rdx=rcx;
		{
			i64 rsi=1;
			p64 rbp=sub_to_new(5+rsi);
			rax=ptr_to_any(argx);
			p64 argx=rbp+5;
			argx[-1]=rsi;
			argx[-2]=rax;
			rcx=argx;
			p64 rdx=rcx;
			{
				rcx=arge;
				rcx=rcx[-2];
				rcx=&rcx[0];
				rax=*rcx;
				i64 rbx=rax;
				p64 rdx=rcx;
				{
					static f64 rbx=(1);
					rax=flt_to_int(&rbx);
				}
				*rdx=rax;
			}
			rcx=rdx;
			rax=obj_to_any(ptr_to_any(rcx));
		}
		*rdx=rax;
	}
	rcx=rdx;
	rax=obj_to_any(ptr_to_any(rcx));
}
*/

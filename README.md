# Ally

Pronounced L-I, Ally is a dynamic programming language with semi-optional types. The language draws inspiration from JavaScript, Swift and PHP.

## Reserved

```
void, number, boolean, symbol, string, function, array, object, union,
try, catch, finally, if, else, for, in, while, switch, match, case, default,
continue, break, return, throw, pick, typeof, sizeof, instanceof, delete,
true, false, null, NaN, Infinity,
public, private, protected, static, this,
let, func, class, extends, module,
import, export, as
```

## Reserved(Future)

```
enum, abstract, typealias, interface, extern, super, yield, async, await, is, with
```

## Comments

Line comments start with `//` and end at the end of the line.

```
// This is a comment.
```

Block comments can nest and span multiple lines, starting with /* and ending with */.

```
/* multi-line
   comment. */

/* This is /* a nested */ comment. */
```

Identifiers

Similar to other programming languages. Identifiers start with a letter or underscore and may contain letters, digits, and underscores. Case is sensitive.

```
nocase
camelCase
PascalCase
_under_score
abc123
ALL_CAPS
```

## Let

Also known as "variable declaration/assignment", `let` gives names to values. They can be seen and referenced by other pieces of the program. Let bindings created in a operator/function/lambda body `{}` are scoped to that particular body.

---

## Boolean

Booleans has the type of `boolean` either `true` or `false`. Boolean operations include:

1. && logical and
2. || logical or
3. ! logical not
3. <=, >=, <, >
4. == equal
6. != unequal
4. === deep equal
5. === deep unequal

## Number

64-bit (double-precision) floating point numbers. Provides the usual operations: `+`, `-`, `*`, `/`, `++`, `--` etc.

```
a = ( 1 + 2.9 >> 2 / 1e6 + - 1 - 70e2 * 4 ) + 100
```

Both `.4` and `1.` are not valid, and must be pre/post-fixed with a zero.

```
1.0
0.4
```

Spaces and appended letters are ignored.

```
10 000 000km
```

## String

Strings are delimited with either double quotes ", or single ' quotes. String can span multiple lines.

```
a = '
	Hello
	World
'
```

String concatenation uses `+`.

```
a = 'Hello' + ' ' + 'World'
```

String interpolation is delimeted by `$()`

```

a = 'Hello $(1 + 2)'
```

## Control

Control flow operators do not use parenthesis in contrast to function invocations. These share a common pattern of `keyword arguments {}`.

### Switch

```
switch condition {
	case a, b {
	}
	case default {
	}
}
```

### Match

```
match condition {
	case a, b {
	}
	case default {
	}
}
```

### If..Else
```
if condition {
} else if condtion {
} else {
}
```

### Try..Catch

```
try {
} catch e {
} finally {
}
```

### While

```
while condition {
}
```

### For

```
for step < 100 {
}

for step = 0, step < 100, step++ {
}
```

### For..Of

```
for step of children {
}

for step of 0...10 {
}
```

## Function

Functions are first class values that have the type `function`. These share the form of `func name arguments body`.

```
func name {
}

func name a, b {
}

func name ...args {
}

func name ...args, a {
}

func name a, ...args {
}

func name a = 1 {
}

func name a = 1, b = 2 {
}

func name a pick {ref, age = 1}, b {
}

func name
	object a pick {string type, age = 1},
	number b void {
}
```

## Lambdas

Lambdas are identical to functions and share the same type of `function`.

```
name = => {
}

name = a => {
}

name = a, b => {
}

name = => {
}

name = ...args => {
}

name = ...args, a => {
}

name = a, ...args => {
}

name = {a, b} => {
}

name = {a, b = 1} => {
}

name = a = 1 => {
}

name = a = 1, b = 2 => {
}

name = a pick {ref, age = 1}, b => {
}

name =
	object a pick {string type, age = 1},
	number b void => {
}

name = => Expression

name = =>
	Expression
```

## Invocations

```
print('Hello')

print('Hello', 'World')

print(print(print('Hello', 'World'))

print(
	print('Hello')
		print('World'))

print('Hello', func name {
})

print( => {
})

print('Hello', => {
})

print( => System.write(''))

print( =>
	System.write(''))
```

## Types

Types are optional, you can attach them to function arguments, variable bindings and class bodies. The following primitive types exist.

```
void
number
boolean
symbol
string

function
object
array
```

The use of types follow the pattern `type binding`.

```
number age = 1

func name number age, array<string> subjects, object<Person> person void {
	return
}

name = number age, array<string> subjects, object<Person> person => void {
	return
}
```

## Class

Classes are created using the class keyword that follow the pattern `class Name {}`. Keywords `public`, `private`, `protected` and `static` are used to indicate the visibility of class methods/fields.

```
class Person {
	public func create name, age {
	}
	private func destroy id {
	}
	protected func assign key, value {
	}
}
```

Class optional parameters resemble function parameters.

```
class Person a pick {key}, b = 1, object c {
	public number age = key
}
```

Fields are created statitically or through referenced named parameters.

```
class Person age, year, document pick {name} {
	public x = 0
	public y = 0

	public func write {
		System.write('Hello' + 'World' + '!')
	}

	private func assign key, value {
		this[key] = value
	}
}

person = Person('23', '1989')

System.write(`Name: $(person.name) Age: $(person.age), Born In: $(person.year)`)
```

Class instances are created when invoked. Parameters are passed to classes like functions.

```
person = Person(10, 1989)
```

All named arguments in the class are assigned to a corrosponding field.

```
class Element type, props pick {ref, key, xmlns}, children {
  public func handleEvent object<Event> event {
    this.dispatchEvent(event, => System.write("dispatchEvent"))
  }
  private func dispatchEvent object<Event> event, function callback {
    try {
      callback(event)
    } catch e {
      throw e
    }
  }
}

func createElement union<string, function> type, object props, ...children {
  return Element(type, props, children)
}

System.write(createElement('h1', null, 'Hello').type === 'h1')
```

Private members are not accessible except from within the source class.

```
class Person {
	private func setter key, value {
		this[key] = value
	}
}

person = Person()

System.write(typeof person.setter) // null
```

Static members are accessible from `class` objects instead of `class` instances.

```
class Person {
	static func setter key, value {
	}
}

System.write(typeof Person.setter) // function
```

Classes can extend other class. Protected methods are not accessible except from within the class. The Child `class` receives `public`, `protected` and `static` fields, methods of the Parent `class`.

```
class Person {
	protected func getter key {
		return this[key]
	}
}

class Student extends Person {
	public get func key {
		this.getter(key)
	}
}

student = Student()

System.write(typeof student.getter) // function
```

## Module

Modules are like files! They can contain variable bindings, nested modules, etc. Whatever you can place in a program, you may place inside a module definition's {} body and vice-versa. Modules can import and export using the `import` and `export` operators. Modules share a common pattern of `module Identifier {}`.

```
module School {
	import {type as studentType} from Student

	population = 100

  export profession = 'Teacher'

  export type = (person) =>
  	switch (person) {
  		case 'Teacher' {
  			return 'A teacher'
  		}
  		case 'Director' {
  			return 'A director'
  		}
  	}

 	export {population}
}

module Student {
  export grade = '7'

	export default func announcement value {
		System.write('')
	}

  export type = (student) =>
  	switch (student) {
  		case '7' {
  			return 'middle school'
  		}
  		case '8' {
  			return 'high school'
  		}
  	}

  export profession from School
}

import {type} from School
```

## Object

Plain objects are created using the `{}` (curly braces). Objects are immutable(size). Objects are created in two flavours, plain objects and dictionary objects.

```
plain = {
	age: 27,
	year: 1989,
	print: value => System.write(value),
	assign: func name key, value {
		return this[key] = value
	}
}

dictionary = {
	['age', 27],
	['year', 1989]
}
```

While Dictionary objects can hold any key including objects plain objects can only hold string keys.

```
plain = {
	age: 27,
	year: 1989
}

dictionary = {
	[{}, 27],
	['year', 1989]
}
```

## In

The `in` operator returns wether a given key is present in an `object`.

```
'foo' in {foo: 1} === true
```

## Sizeof

The `sizeof` operator returns the size of a given array/object/string and `NaN` for invalid values.

```
System.write(sizeof [1, 2, 3])       // 3
System.write(sizeof {a: 1, b: 2})    // 3
System.write(sizeof "Hello")         // 5
System.write(sizeof 2)               // NaN
System.write(sizeof Symbol())        // NaN
System.write(sizeof null)            // NaN
System.write(sizeof func {})         // NaN
System.write(sizeof true)            // NaN
System.write(sizeof Map([[1, '1']])) // 1
```

## Typeof

The `typeof` operator returns the type of a given value in string form.

```
System.write(typeof [1, 2, 3])       // "array"
System.write(typeof {a: 1, b: 2})    // "object"
System.write(typeof "Hello")         // "string"
System.write(typeof 2)               // "number"
System.write(typeof Symbol())        // "symbol"
System.write(typeof null)            // "void"
System.write(typeof func {})         // "function"
System.write(typeof true)            // "boolean"
System.write(typeof Map([[1, '1']])) // "object"
```

## Instanceof

The `instanceof` operator returns `true` if the value is an instance of specified class.

```
1 instanceof Number === true
```

## Let

Variables are implicitly created when assigned.

```
template = "1"
```

The `let` operator allows a variable statement without explicit assigmnet.

```
let template
let script

template = "1"
script = "2"
```

## Delete

The `delete` operator deletes the corresponding value(s) from an `object`.

```
dictionary = {['a', 1], ['b', 2], ['c', 3]}

dictionary delete 'a' === {['b', 2], ['c', 3]}
dictionary delete {b, c} === {}
```

## Pick

The `pick` operator retrieves the corresponding value(s) from an `object`.

```
{foo: 1} pick "foo" === 1
{foo: 1, bar: 2} pick {foo, bar} === {foo: 1, bar: 2}
[2, 3, 5, 7, 11, 13] pick {1...4} === [3, 5, 7]
```

In some respects the `pick` operator is much like the subscript `[]` operator. Pick however is aligned to support a range of contexts including destructuring function arguments and picking values from exotic objects.


## Spread

The `...` operator is a generic operator that spreads it's contents onto the context of its binding. The different contexts include function arguments `func ...arg`, objects `{...a}` arrays `[...a]` and numbers `0...3`.

```
var arr = [1, 2]
var obj = {foo: 1}

{...obj, bar: 2} === {foo: 1, bar: 2}

[0, ...arr] === [0, 1, 2]

[1...3] === [1, 2, 3]

func ...args {
	System.write(typeof args === 'array')
}
```

## With

The `with` operator is a generic operator that invokes builtin standard library functions for the specified values.

```
with [1,2,3,4] filter(v => v > 2) === [3, 4]

with "1234" replace("1", "0") === "0234"

with "1234" charAt(2) === "3"

with "1234" indexOf("2") === 1

with (with [1,2,3,4] join(" ")) trim() === "1 2 3 4"
```

## Array

Arrays are immutable(size), Array literals are delimited with brackets `[`, `]` and share the form `[1, 2, 3]`.

```
// create
arr = [0, 2, 3, 4...6]

// assigment
arr[0] = 1

// deep compare
arr === [1, 2, 3, 4, 5, 6]

// noop push
arr[3] = 10
arr[3] === null
sizeof arr === 3

// noop delete
arr delete 0
arr[0] === 1
sizeof arr === 3
```

## Standard Library

### RegExp

```
RegExp(string value, string flags) obj<RegExp>
RegExp('value', 'g') === \value\g
```

### String

```
String(target) string
```

### Object

```
Object(target) object
```

### Boolean

```
Boolean(target) boolean
```

### Number

```
Number(target) number
```

### Exception

```
Exception(string target) object<Exception>
	object<Exception>.type
	object<Exception>.message
```

### Promise

```
Promise(function target)
	object<Promise>.then(function callback, function error, funcion final) object<Promise>
```

### Math

```
Math.random() number
Math.abs(number target) number
Math.ceil(number target) number
Math.exp(number target) number
Math.floor(number target) number
Math.round(number target) number
Math.sign(number target) number
Math.trunc(number target) number
Math.sqrt(number target) number
Math.cbrt(number target) number
Math.imul(numer x, number y) number
Math.log(number target) number
Math.cos(number target) number
Math.cosh(number target) number
Math.sin(number target) number
Math.tan(number target) number
Math.max(...arguments) number
Math.min(...arguments) number
Math.hypot(...arguments) number
```

### JSON

```
JSON.parse(string target) object
JSON.stringify(object target) string
```

## System

```
System.assert(boolean value)
System.write(...arguments)
```


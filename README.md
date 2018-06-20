# Ally

Pronounced L-I, Ally is a dynamic programming language with semi-optional types. The language draws inspiration from JavaScript, Swift and PHP.

## Reserved

```
void, number, boolean, symbol, string, function, array, object, union, any,
try, catch, finally, if, else, for, in, while, switch, match, case, default,
continue, break, return, throw, typoof, sizeof, instanceof, pick,
true, false, null, undefined, NaN, Infinity,
public, private, protected, static, this,
let, func, class, extends, module,
import, export, as
```

## Reserved(Future)

```
const, var, enum, protocol, implements, abstract, typealias, interface, package,
extern, throws, super, delete, yield, async, await, debugger, new, do, with, is, of
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
3. ! logical not.
3. <=, >=, <, >
4. == equal
6. != unequal
4. === deep equal
5. === deep unequal

## Number

64-bit (double-precision) floating point numbers. Provides the usual operations: `+`, `-`, `*`, `/`, `++`, `--` etc.

```
let a = ( 1 + 2.9 >> 2 / 1e6 + - 1 - 70e2 * 4 ) + 10 000 000
```

## String

Strings are delimited with either double quotes ", single ' quotes or template \` qoutes. String concatenation uses `+`:

```
let a = 'Hello' + "World" + `! ` + 2010 + 8
```

## Control

Control flow operators do not use parenthesis in contrast to function invocations. These share a common pattern of `control arguments body`.

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
for step++ < 5 {
}

for step = 0; step < sizeof children; step++ {
}
```

### For..In

```
for step in children {
}

for step in 0..10 {
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
let name = => {
}

let name = a => {
}

let name = a, b => {
}

let name = => {
}

let name = ...args => {
}

let name = ...args, a => {
}

let name = a, ...args => {
}

let name = {a, b} => {
}

let name = {a, b = 1} => {
}

let name = a = 1 => {
}

let name = a = 1, b = 2 => {
}

let name = a pick {ref, age = 1}, b => {
}

let name =
	object a pick {string type, age = 1},
	number b void => {
}

let name = => Expression

let name = =>
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

Types are optional, you can attach them to function arguments, let bindings and class bodies. The following primitive types exist.

```
void
number
boolean
symbol
string

function
object
array

any
```

The use of types follow the pattern `type binding`.

```
let number age = 1

func name number age, array<string> subjects, object<Person> person void {
	return
}

let name = number age, array<string> subjects, object<Person> person => void {
	return
}
```

## Object

Plain objects are created using the `{}` (curly braces). Primitive objects are immutable with relation to create and delete operations.

```
let person = {
	age: 27,
	year: 1989,
	print: value => System.write(value),
	assign: func name key, value {
		return this[key] = value
	}
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

let person = Person('23', '1989')

System.write(`Name: $(person.name) Age: $(person.age), Born In: $(person.year)`)
```

Class instances are created when invoked. Parameters are passed to classes like functions.

```
let person = Person(10, 1989)
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

let person = Person()

System.write(typeof person.setter) // undefined
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

let student = Student()

System.write(typeof student.getter) // function
```

## Module

Modules are like files! They can contain let bindings, nested modules, etc. Whatever you can place in a program, you may place inside a module definition's {} body and vice-versa. Modules can import and export using the `import` and `export` operators. Modules share a common pattern of `module Identifier {}`.

```
module School {
	import {type as studentType} from Student

	let population = 100

  export let profession = 'Teacher'

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
  export let grade = '7'

	export default func announcement value {
		System.write('')
	}

  export let type = (student) =>
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

## Sizeof

The `sizeof` operator returns the size of a given array/object/string and `NaN` for invalid values.

```
System.write(sizeof [1, 2, 3])       // 3
System.write(sizeof {a: 1, b: 2})    // 3
System.write(sizeof "Hello")         // 5
System.write(sizeof 2)               // NaN
System.write(sizeof Symbol())        // NaN
System.write(sizeof undefined)       // NaN
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
System.write(typeof undefined)       // "void"
System.write(typeof func {})         // "function"
System.write(typeof true)            // "boolean"
System.write(typeof Map([[1, '1']])) // "object"
```

## Standard Library

## System

```
System.assert(boolean value)
System.write(...arguments)
```

### Boolean

```
Boolean(any target)
```

### Number

```
Number(any target)
Number.parse(string target)
```

### Symbol

```
Symbol(string target)
Symbol.for(string target)
```

### String

```
String(any target)
String.concat(...arguments)
String.includes(string target, number from)
String.pad(string target, number padding)
String.trim(string target, number padding)
String.repeat(string target, count)
String.match(string target, object<RegExp> regexp)
String.replace(string target, union<object<RegExp>, string> value, union<string, function> replacement)
String.search(string target, union<object<RegExp>, string> value, number from)
String.slice(string target, number from, number to)
String.split(string target, union<object<RegExp>, string> separator, number limit)
String.substring(string target, number from, number to)
String.toLowerCase(string target)
String.toUpperCase(string target)
String.charAt(string target, number index)
String.charCodeAt(string target, number index)
String.codePointAt(string target, number index)
String.fromCharCode(number code)
String.fromCodePoint(number point)
```

### Object

```
Object(any target)
Object.keys(object target)
Object.values(object target)
Object.entries(object target)
Object.has(object target, union<string, symbol> key)
```

### Map

```
Map(any target)
Map.keys(object<Map> target)
Map.values(object<Map> target)
Map.entries(object<Map> target)
Map.has(object<Map> target, union<string, symbol> key)
Map.get(object<Map> target, union<string, symbol> key)
Map.set(object<Map> target, union<string, symbol> key, any value)
Map.delete(object<Map> target, union<string, symbol> key)
Map.clear(object<Map> target)
```

### WeakMap

```
WeakMap(any target)
WeakMap.has(object<Map> target, union<string, symbol> key)
WeakMap.get(object<Map> target, union<string, symbol> key)
WeakMap.set(object<Map> target, union<string, symbol> key, any value)
WeakMap.delete(object<Map> target, union<string, symbol> key)
```

### Exception

```
Exception(string target)
	object<Exception>.type
	object<Exception>.message
```

### Date

```
Date(union<string, number> target)
Date.now()
Date.parse(string target)
```

### Math

```
Math.random()
Math.abs(number target)
Math.ceil(number target)
Math.exp(number target)
Math.floor(number target)
Math.round(number target)
Math.sign(number target)
Math.trunc(number target)
Math.max(...arguments)
Math.min(...arguments)
Math.hypot(...arguments)
Math.sqrt(number target)
Math.cbrt(number target)
Math.imul(numer x, number y)
Math.log(number target)
Math.log1p(number target)
Math.log10(number target)
Math.log2(number target)
Math.cos(number target)
Math.acos(number target)
Math.acosh(number target)
Math.cosh(number target)
Math.sin(number target)
Math.sinh(number target)
Math.asin(number target)
Math.asinh(number target)
Math.tan(number target)
Math.tanh(number target)
Math.atan(number target)
Math.atanh(number target)
Math.atan2(number x, number y)
```

### RegExp

```
RegExp(string value, string flags)
RegExp.exec(object<RegExp> target, string str)
RegExp.test(object<RegExp> target, string str)
RegExp.flag(object<RegExp> target, ...arguments)
```

### Array

Array literals are delimited with brackets `[` and share the form `[1, 2, 3]`.

```
Array(...arguments)
Array.from(union<array,string> target, function mapper)
Array.fill(array target, any value)
Array.pop(array target)
Array.push(array target, ...arguments)
Array.shift(array target)
Array.unshift(array target, ...arguments)
Array.reverse(array target)
Array.splice(array target, number from, number remove, ...arguments)
Array.concat(array target, ...arguments)
Array.slice(array target, number from, number to)
Array.includes(array target, any value, number from)
Array.search(array target, any element, number from)
Array.join(array target, string separator)
Array.sort(array target, function compare)
Array.move(array target, number target, number from, number to)
Array.keys(array target)
Array.values(array target)
Array.entries(array target)
Array.reduce(array target, function callback)
Array.filter(array target, function callback)
Array.find(array target, function callback)
Array.map(array target, function callback)
Array.every(array target, function callback)
Array.some(array target, function callback)
Array.length(array target)
Array.each(array target, function callback)
```

### JSON

```
JSON.parse(string target)
JSON.stringify(object target)
```

### Promise

```
Promise(function target)
	object<Promise>.then(function callback, function error)
	object<Promise>.catch(function callback)
	object<Promise>.finally(function callback)

Promise.resolve(any target)
Promise.reject(any target)
```


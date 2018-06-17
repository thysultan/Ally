# Ally

Pronounced L-I, Ally is a dynamic programming language with semi-optional types. The language draws inspiration from JavaScript, Swift and PHP.

## Reserved

```
void        if       function
typeof      for      extends
static      else     class
public      while    array
protected   any      export
private     switch   import
static	    match    try
false       module   catch
true        return   finally
case        default  break
this        throw    continue
boolean     object   number
string      in       let
of          as       instanceof
abstract    pick     undefined
extern      NaN      Infinity
symbol      func     sizeof
```

## Reserved(Future)

```
const       is
debugger    enum
var         protocol
implements  super
interface   package
delete      typealias
with        await
null        interface
do          yield
new
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

Strings are delimited with either double quotes ", single ' quotes or template \` qoutes. String concatenation uses `..`:

```
let a = 'Hello' .. "World" .. `! ` .. 2010 + 8
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
for a in b {
}
```

### For..Of

```
for a of b {
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

Plain objects are created using the {} (curly braces).

```
let person = {
	age: 27
	year: 1989,
	print: value =>
		System.write(value)
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
		System.write('Hello' .. 'World' .. '!')
	}

	private func assign key, value {
		this[key] = value
	}
}

let person = Person('23', '1989')

Sysmte.write(`Name: $(person.name) Age: $(person.age), Born In: $(person.year)`)
```

Class instances are created when invoked. Parameters are passed to class like functions.

```
let person = Person(10, 1989)
```

All named arguments in the class are assigned to a corrosponding field.

```
class Person age, year {
}

let person = Person(10, 1989)

System.write(person.age, person.year)
```

Defined fields can use expressions to assign values based on named parameters.

```
class Element type, props, children, key, ref, xmlns {
	public number identity = typeof type == 'string' ? 1 : -1

	public func handleEvent object<Event> event {
		this.dispatchEvent(event, void => undefined)
	}

	private func dispatchEvent object<Event> event, callback {
		try {
			callback(event)
		} catch e {
			throw e
		}
	}
}

func createElement type, props instanceof object || {}, ...children : Element {
	return Element(type, props, children, props.key, props.ref, props.xmlns)
}

let element = createElement('h1', {style: {color: 'red'}}, 'Hello')

System.write(element.identity)

element.handleEvent({})
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
	set func setter key, value {
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

While extending `abstract` classes is allowed, invoking `abstract` classes raises an exception; in accordance with this `abstract` classes cannot accept parameters.

```
class Person abstract {
	public func getter key {
		return this[key]
	}
}

let person = Person() // throws
```

## Module

Modules are like files! They can contain let bindings, nested modules, etc. Whatever you can place in a program, you may place inside a module definition's {} body and vice-versa. Modules can import and export using the `import` and `export` operators. Modules share a common pattern of `operator binding source`.

```
module School {
	import {type as studentType} from Student

  export let profession = 'Teacher'

  export type = (person) =>
  	switch (person) {
  		case 'Teacher': return 'A teacher'
  		case 'Director': return 'A director'
  	}
}

module Student {
  export let class = '7'

	export default func announcement value {
		System.write('')
	}

  export let type = (student) =>
  	switch (student) {
  		case '7': return 'middle school'
  		case '8': return 'high school'
  	}

  export profession from School
}

import {type} from School
```

## Sizeof

The `sizeof` operator returns the size of a given array/object/string and `NaN` for invalid values.

```
System.write(sizeof [1, 2, 3])    // 3
System.write(sizeof {a: 1, b: 2}) // 3
System.write(sizeof "Hello")      // 5
System.write(sizeof 2)            // NaN
System.write(sizeof Symbol())     // NaN
System.write(sizeof undefined)    // NaN
System.write(sizeof func {})      // NaN
System.write(sizeof true)         // NaN
```

## Typeof

The `typeof` operator returns the type of a given value in string form.

```
System.write(typeof [1, 2, 3])    // "array"
System.write(typeof {a: 1, b: 2}) // "object"
System.write(typeof "Hello")      // "string"
System.write(typeof 2)            // "number"
System.write(typeof Symbol())     // "symbol"
System.write(typeof undefined)    // "void"
System.write(typeof func {})      // "function"
System.write(typeof true)         // "boolean"
```

## Standard Library

## System

```
System.now()
System.write(...arguments)
```

### Boolean

```
Boolean(any value)
```

### Number

```
Number(any value)
Number.parse(string value)
```

### Symbol

```
Symbol(string value)
Symbol.for(string value)
```

### String

```
String(any value)
String.concat(...arguments)
String.includes(string value, number from)
String.pad(string value, number padding)
String.trim(string value, number padding)
String.repeat(string value, count)
String.match(string value, object<RegExp> regexp)
String.replace(string|object<RegExp> value, string|function replacement)
String.search(string|object<RegExp> value, number from)
String.slice(string value, number from, number to)
String.split(string value, object<RegExp> separator, number limit)
String.substring(number from, number to)
String.toLowerCase(string value)
String.toUpperCase(string value)
String.charAt(string value, number index)
String.charCodeAt(string value, number index)
String.codePointAt(string value, number index)
String.fromCharCode(number code)
String.fromCodePoint(number point)
```

### Object

```
Object(any value)
	object<string|symbol, any>

Object.assign(...arguments)
Object.keys(object value)
Object.values(object value)
Object.entries(object value)
Object.has(object value, string|symbol key)
Object.delete(object value, string|symbol key)
Object.clear()
```

### Error

```
Error(string value)
	object<Error>.type
	object<Error>.message
```

### Date

```
Date(string value)
Date.now()
Date.parse(string value)
```

### Math

```
Math.random()
Math.abs(number value)
Math.ceil(number value)
Math.exp(number value)
Math.floor(number value)
Math.round(number value)
Math.sign(number value)
Math.trunc(number value)
Math.max(...arguments)
Math.min(...arguments)
Math.hypot(...arguments)
Math.sqrt(number value)
Math.cbrt(number value)
Math.imul(numer x, number y)
Math.log(number value)
Math.log1p(number value)
Math.log10(number value)
Math.log2(number value)
Math.cos(number value)
Math.acos(number value)
Math.acosh(number value)
Math.cosh(number value)
Math.sin(number value)
Math.sinh(number value)
Math.asin(number value)
Math.asinh(number value)
Math.tan(number value)
Math.tanh(number value)
Math.atan(number value)
Math.atanh(number value)
Math.atan2(number x, number y)
```

### RegExp

```
RegExp(string value, string flags)
RegExp.exec(object<RegExp> value, string str)
RegExp.test(object<RegExp> value, string str)
RegExp.flag(object<RegExp> value, ...arguments)
```

### Array

Array literals are delimited with brackets `[` and share the form `[1, 2, 3]`.

```
Array(...arguments)
Array.from(string|array value, function mapper)
Array.fill(array value)
Array.pop(array value)
Array.push(array value, ...arguments)
Array.shift()
Array.unshift(array value, ...arguments)
Array.reverse(array value)
Array.splice(array value, number from, number remove, ...arguments)
Array.concat(array value, ...arguments)
Array.slice(array value, number from, number to)
Array.includes(array value, any value, number from)
Array.search(array value, any element, number from)
Array.join(array value, string separator)
Array.sort(array value, function compare)
Array.move(array value, number target, number from, number to)
Array.keys(array value)
Array.values(array value)
Array.entries(array value, value)
Array.reduce(array value, function callback)
Array.filter(array value, function callback)
Array.find(array value, function callback)
Array.map(array value, function callback)
Array.every(array value, function callback)
Array.some(array value, function callback)
Array.length(array value)
Array.each(array value, function callback)
```

### JSON

```
JSON.parse(string value)
JSON.stringify(object value)
```

### Promise

```
Promise(function value)
	object<Promise>.then(function callback, function error)
	object<Promise>.catch(function callback)
	object<Promise>.finally(function callback)

Promise.resolve(any value)
Promise.reject(any value)
```


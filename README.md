# Ally

Pronounced L-I, Ally is a dynamic programming language with semi-optional types. The language resembles JavaScript and Swift.

## Reserved

```
void        if       function
typeof      for      extends
static      else     class
public      while    new
protected   do       export
private     switch   import
static	    match    try
false       await    catch
true        return   finally
case        default  break
this        throw    continue
boolean     object   number
string      in       let
of          as       instanceof
module      console  any
```

## Reserved(Future)

```
const       is
debugger    enum
var         protocol
implements  interface
yield       package
delete      typealias
with        expression
symbol      null
undefined   NaN
Infinity
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

## Number

32-bits. Provides the usual operations: `+`, `-`, `*`, `/`, `++`, `--` etc.

```
let a = 1 + 2.9 >> 2 / 1e6 + - 1 - 70 * 4
```

## String

Strings are delimited with either double quotes ", single ' quotes or template \` qoutes. String concatenation uses `.`:

```
let a = 'Hello' . "World" . `! ` + 2010 + 8
```

## Control

Control flow operators do not use parenthesis in contrast to function invocations. These share a common pattern of `control arguments body`.

### Switch

```
switch condition {
	case a, b expression
}

switch condition
	case a, b expression
```

### Match

```
match condtion {
	case a, b expression
}

match condtion
	case a, b expression
```

### If..Else
```
if condition {
	expression
} else if condtion {
	expression
} else {
	expression
}

if condition
	expression
else if
	expression
else
	expression
```

### Try..Catch

```
try {
	expression
} catch e {
	expression
} finally {
	expression
}

try {
	expression
} catch e {
	expression
} finally {
	expression
}

try
	expression
catch e
	expression
finally
	expression
```

### While

```
while condition {
	expression
}

while condition
	expression
```

### For

```
for step++ < 5 {
	expression
}

for step++ < 5
	expression


for step = 0, step < 5, step++ {
	expression
}

for step = 0, step < 5, step++
	expression
```

### For..In

```
for a in b {
	expression
}

for a in b
	expression

for a in b expression
```

### For..Of

```
for a of b {
	expression
}

for a of b
	expression

for a of b expression


for a of 0...10 {
	expression
}

for a of 0...10
	expression

for a of 0...10 expression
```

## Function

Functions are first class values that have the type `function`. These share the form of `func name arguments body`.

```
func name a, b {
}

func name {
}

func name ...args {
}

func name ...args, a {
}

func name a, ...args {
}

func name {a, b} {
}

func name {a, b = 1} {
}

func name a = 1 {
}

func name a = 1, b = 2 {
}
```

## Lambdas

Lambdas are identical to functions and share the same type of `function`.

```
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
```

## Invocations

```
print("Hello")

print("Hello", "World")

print(print(print("Hello" "World"))

print(
	print("Hello")
		print("World"))

print( => console.write(''))

print( =>
	console.write(''))

print( => {
})

print("Hello", => {
})

print("Hello", function name {
})

print("Hello") {
}

print ("Hello") {
}

print {
}
```

## Types

Types are optional, you can attach them to function arguments, let bindings and class bodies. The following primitive types exist.

```
void
function
number
string
symbol
boolean
object
symbol
```

The use of types follow the pattern `type binding`.

```
let number age = 1

function name number age, name, object<Person> person void {
	return
}
```

## Object

Plain Objects are created using the {} (curly braces).

```
let person = {
	age: 27
	year: 1989,
	print: value =>
		console.write(value)
	assign: function name key, value {
		return this[key] = value
	}
}
```

## Class

Classes are created using the class keyword tha follow the pattern `class Name {}`. Keywords `public`, `private` and `protected` are used to create and indicate the visibility of class methods.

```
class Person {
	public func create name, age {}
	private func destroy id {}
	protected func assign key, value {}
}
```

Fields are created statitically or through referencing named parameters.

```
class Person age, year {
	x = 0
	y = 0

	public func constructor {
		console.write("Hello" . "World" . "!")
	}

	private func assign key, value {
		this[key] = value
	}
}
```

Class instances are created when invoked, implicity invoking the constructor of the instance.

```
let person = new Person(10, 1989)
```

All named arguemtns in the class are assigned to a corrosponding filed.

```
class Person age, year {
}

let person = new Person(10, 1989)

console.write(person.age, person.year)
```

Staticly defined fields can use expressions to assign values based on arguments.

```
class Element type, props, children, key, ref, xmlns {
	number identity = typeof type == 'string' ? 1 : -1

	public func handleEvent Event event {
		this.dispatchEvent(event, => void)
	}

	private func dispatchEvent Event event, callback {
		try {
			callback(event)
		} catch e {
			throw e
		}
	}
}

func createElement type, props instanceof object || {}, ...children : Element {
	return new Element(type, props, children, props.key, props.ref, props.xmlns)
}

let element = createElement('h1', {style: {color: 'red'}}, 'Hello')

console.write(element.identity)

element.handleEvent({})
```

Private methods are not accessible except from within the class.

```
class Person {
	public func set {
		this.assign("x", 10)
	}

	protected func getter key {
		return this[key]
	}

	private func setter key, value {
		this[key] = value
	}
}

let person = new Person()

console.write(typeof person.set) // function
console.write(typeof person.setter) // void
console.write(typeof person.getter) // void
```

Protected methods are not accessible except from within the class or inheritance chain. Classes can extend other class.

```
class Person {
	public func set {
		this.assign("x", 10)
	}

	protected func getter key {
		return this[key]
	}

	private func setter key, value {
		this[key] = value
	}
}

class Student extends Person {
	public get func key {
		this.getter(key)
	}
}

let student = new Student()

console.write(typeof student.set) // function
console.write(typeof student.get) // void
console.write(typeof student.setter) // void
```

## Module

Modules are like files! They can contain let bindings, nested modules, etc. Whatever you can place in a program, you may place inside a module definition's {} body and vice-versa. Modules can import and export using the `import` and `export` operators. Modules share a common pattern of `operator binding source`.

```
module School {
	import {type as studentType} from Student

  export let profession = "Teacher"

  export type = (person) =>
  	switch (person) {
  		case "Teacher": return "A teacher"
  		case "Director": return "A director"
  	}
}

module Student {
  export let class = "7"

	export default function announcement value {
		console.write('')
	}

  export let type = (student) =>
  	switch (student) {
  		case "7": return "middle school"
  		case "8": return "high school"
  	}

  export profession from School
}

import {type} from School
```

## Standard Library

### Boolean


### Number

```
Number(any value)
Number.parse(string value)
```

### Symbol

```
Symbol(string value)
Symbol.for()
Symbol.thenable
Symbol.iterator
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
String.replace(string value, string|object<RegExp>, string|function)
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
Object
	object<Object string|symbol, any>

Object.assign(...arguments)
Object.keys(object value)
Object.values(object value)
Object.entries(object value)
Object.has(object value, string|symbol key)
```

### Function

```
Function
Function.nameof(function value)
Function.typeof(function value)
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
Math
Math.random()
Math.abs(number value)
Math.ceil(number value)
Math.exp(number value)
Math.floor(number value)
Math.round(number value)
Math.sign(number value)
Math.trunc(number value)
Math.pow(number x, number y)
Math.max(...arguments)
Math.min(...arguments)
Math.hypot(...arguments)
Math.sqrt(number value)
Math.cbrt(number value)

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
Math.atan2(number y, number x)
```

### RegExp

RegExp literals are delimited with forward slash (punctuation) `/` and share the form `/body/flags`.

```
RegExp(string value, string flags)

let regexp = /\w+/
let regexp = RegExp('\w+')
```

### Array

Array literals are delimited with brackets `[` and share the form `[1, 2, 3]`.

```
Array(...arguments)
Array.from(...arguments)
Array.fill(object<Array> value)
Array.pop(object<Array> value)
Array.push(object<Array> value, ...arguments)
Array.shift()
Array.unshift(object<Array> value, ...arguments)
Array.reverse(object<Array>)
array.splice(object<Array>, number from, number remove, ...arguments)
array.concat(object<Array>, ...arguments)
Array.slice(object<Array> value, number from, number to)
Array.includes(object<Array>, any value, number from)
Array.search(object<Array> value, any element, number from)
Array.join(object<Array> value, string separator)
Array.sort(object<Array> value function compare)
Array.move(object<Array> value, number target, number from, number to)
Array.keys(object<Array>)
Array.values(object<Array>)
Array.entries(object<Array>)
Array.reduce(object<Array> function callback)
Array.filter(object<Array> function callback)
Array.find(object<Array> function callback)
Array.map(object<Array>, function callback)
Array.every(object<Array>, function callback)
Array.some(object<Array>, function callback)
Array.length(object<Array> value)
Array.each(object<Array>, function callback)
```

### JSON

```
JSON
JSON.parse(string value)
JSON.stringify(object value)
```

### Promise

```
Promise(function value)
Promise.resolve
Promise.reject
```


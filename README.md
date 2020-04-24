# Ally

Pronounced L-I, Ally is a static programming language with semi-optional types. The language draws inspiration from C, JavaScript, Swift and PHP.

## Reserved

```
bit, int, big, flt, dec, num, str, obj, ptr, any, def, fun, ext, var,
nan, true, false, null,
import, export, as,
continue, break, return, returns, throw, delete, pick, typeof, sizeof, instanceof, keyof,
try, catch, finally, if, else, for, in, switch, case, default,
super, extends, await
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

---

## Boolean

Booleans has the type of `boolean` denoted as `bit` of either values `true` or `false`, or `!0` or `0`. Boolean operations include:

1. && logical and
1. || logical or
1. ! logical not
1. <=, >=, <, >
1. <<=, >>=, <<, >>, <<<, >>>
1. ?. ?? ?=
1. == equal
1. != unequal
1. === deep equal
1. !== deep unequal

## Number

```
int number = 64_000 // 32/64 bit integer
flt number = 64.000 // 64 bit floating point number
num number = flt | int // pronounced number, either a float or integer depending on the downstream uses.
int binary = 0b0101 // also included is octal and hexadecimal notation
```

Provides the usual operations: `+`, `-`, `*`, `/`, `++`, `--` etc.

```
num a = ( 1 + 2.9 >> 2 / 1e6 + - 1 - 70e2 * 4 ) + 100
```

Both `.4` and `1.` are not valid, and must be pre/post-fixed with a zero.

```
1.0
0.4
```

Underscores and appended letters are ignored.

```
10_000_000km
```

## String

Strings are delimited with either double quotes ", or single ' quotes. String can span multiple lines.

```
str a = '
	Hello
	World
'
```

String concatenation uses `+`.

```
str a = 'Hello' + ' ' + 'World'
```

## Control

Control flow operators do not use parenthesis in contrast to function invocations. These share a common pattern of `keyword arguments {}`.

### Switch

```
switch condition {
	case a, b {
	}
	case c => 'return'
	case {
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

### For

```
for step < 100 {
}

for int step = 0, step < 100, step++ {
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

Functions are first class values that have the type `function`. These share the form of `fun name arguments body`.

```
fun ... {
}

fun name {
}

fun name a, b {
}

fun name ...args {
}

fun name ...args, a {
}

fun name a, ...args {
}

fun name a = 1 {
}

fun name a = 1, b = 2 {
}

fun name a pick {ref, age = 1}, b {
}

fun name
	obj a pick {str type, age = 1},
	num b {
}
```

## Lambdas

Lambdas are identical to functions and share the same type of `function`. The expression immediatly after '=>' is the return value of a lambda function, this means that in the following, the return values are empty objects '{}'.

```
var name = fun ... => {
}

var name = fun name => {
}

var name = fun name a => {
}

var name = fun name a, b => {
}

var name = fun name => {
}

var name = fun name ...args => {
}

var name = fun name ...args, a => {
}

var name = fun name a, ...args => {
}

var name = fun name {a, b} => {
}

var name = fun name {a, b = 1} => {
}

var name = fun name a = 1 => {
}

var name = fun name a = 1, b = 2 => {
}

var name = fun name a pick {ref, age = 1}, b => {
}

var name = fun name obj a pick {str type, age = 1}, num b => {
}
```

## Invocations

```
print('Hello')

print('Hello', 'World')

print(print(print('Hello', 'World'))

print(
	print('Hello')
		print('World'))

print('Hello', fun name {
})

print('Hello', fun ... {
})

print(fun ... => print(''))

print(fun name => print(''))

print(fun name =>
	print(''))
```

## Types

Types are semi-optional(inferred where possible), you can attach them to function arguments, variable bindings and class bodies. The following primitive types exist.

```

void – pointers, denoted as 'ptr'
number - numbers, denoted as 'int', 'flt'
boolean - booleans, denonted as 'bit'
string - strings, denoted as 'str'
definition - types, denoted as 'def'

function - functions, denoted as 'fun'
object - objects, denoted as 'obj'
array - arrays, denoted as 'type[?]' where '?' is either '?' or a number and 'type' is any of the above listed types
```

In the form of examples this includes.

```
bit boolean = true | false

int number = 64_000
flt number = 64.000

num number = int | flt

str string = 'hello'
obj object = {int len = 0, str str = ''}
ptr rawptr = {1024}
var strnum = true ? 'str' : 64

str[?] array = ['hello']
str[5] array = ['hello']
```

The use of types follow the pattern `type binding`.

```
int age = 1

fun name num age, str[] subjects, obj<Person> person {
	return
}

fun name = num age, str[] subjects, obj<Person> person => {
	return
}
```

## Class

Classes are created using the def keyword that follow the pattern `def Name ...args? {}`.

```
def Person {
	obj object = {}
	obj dictionary = {['key', 'value']}
	ptr memory = {1024}

	any[] program = []

	fun create name, age {}
	fun assign key, value {}
	fun destroy id {}
	fun generic def type, value {}
}
```

Class optional parameters resemble function parameters.

```
def Person a pick {key}, b = 1, obj c {
	int age = key
}
```

Fields are created statitically or through referenced named parameters.

```
def Person age, year, document pick {name} {
	int x = 0
	int y = 0

	fun write {
		print('Hello' + 'World' + '!')
	}

	fun assign key, value {
		def.key = value
	}
}

obj person = Person('23', '1989', {name: 'Sultan'})

print('Name: ' + person.name 'Age: ' + person.age + ', Born In: ' + person.year)
```

Class instances are created when invoked. Parameters are passed to classes like functions.

```
obj person = Person(10, 1989)
```

All named arguments in the class are assigned to a corrosponding field.

```
def Element type, props pick {ref, key, xmlns}, children {
  fun handleEvent obj<Event> event {
    def.dispatchEvent(event, => print('dispatchEvent'))
  }
  fun dispatchEvent obj<Event> event, fun callback {
    try {
      callback(event)
    } catch e {
      throw e
    }
  }
}

fun createElement var<str, fun> type, obj props, ...children {
  return Element(type, props, children)
}

obj person = Person('h1', {}, '')

print(person.type == 'h1')
```

Classes can extend other class.

```
def Person {
	fun getter key {
		return super[key]
	}
}

def Student extends Person {
	fun get key {
		def.getter(key)
	}
}

obj student = Student()

print(typeof student.getter) // function
```

## Generics

Given that functions can accept type defintions as arguments. The following is a difinition that accepts defintions as an argument, and sets the type of the the 'value' to any type passed as a definition.

```
def Generic def type {
	var<type> value
}

obj generic = Generic(Generic)
```


## Module

Modules are like files! They can contain variable bindings, nested modules, etc. Whatever you can place in a program, you may place inside a module definition's {} body and vice-versa. Modules can import and export using the `import` and `export` operators. Modules share a common pattern of `export Identifier {}`.

```
export School {
	import Student as {type as studentType}

	int population = 100

  str profession = 'Teacher'

  fun type person {
  	switch person {
  		case 'Teacher' {
  			return 'A teacher'
  		}
  		case 'Director' {
  			return 'A director'
  		}
  	}
  }
}

export Student {
  export profession from School

  str grade = '7'

	fun announcement value {
		print(value)
	}

  fun type student {
  	switch student {
  		case '7' {
  			return 'Middle school'
  		}
  		case '8' {
  			return 'High school'
  		}
  	}
  }
}

import School as {type}
```

## Object

Plain objects are created using the `{}` (curly braces). Objects are immutable(size). Objects are created in two flavours, plain objects and dictionary objects.

```
obj plain = {
	int age = 27,
	int year = 1989,
	fun name value => print(value),
	fun name key, value {
		return super[key] = value
	}
}

obj dictionary = {
	['age', 27],
	['year', 1989]
}
```

While Dictionary objects can hold any key including objects plain objects can only hold string keys.

```
obj plain = {
	age = 27,
	year = 1989
}

obj dictionary = {
	[{}, 27],
	['year', 1989]
}
```

## In

The `in` operator returns wether a given key is present in an `object`.

```
'foo' in {foo = 1} == true
```

## Sizeof

The `sizeof` operator returns the size of a given array/object/string and `nan` for invalid values.

```
print(sizeof [1, 2, 3])       // 3
print(sizeof {a: 1, b: 2})    // 2
print(sizeof 'Hello')         // 5
print(sizeof 2)               // 64
print(sizeof null)            // nan
print(sizeof fun a, b {})     // 2
print(sizeof true)            // 1
print(sizeof {[1, '1']})      // 1
```

The `sizeof` operators on primitive types

```
print(sizeof int)             // 64
print(sizeof flt)             // 64
```

## Typeof

The `typeof` operator returns the type of a given value in string form.

```
print(typeof int)             // 'definition'
print(typeof [1, 2, 3])       // 'array'
print(typeof {a: 1, b: 2})    // 'object'
print(typeof "Hello")         // 'string'
print(typeof 2)               // 'number'
print(typeof null)            // 'nil'
print(typeof fun {})          // 'function'
print(typeof true)            // 'boolean'
print(typeof {[1, '1']})      // 'object'
```

## Instanceof

The `instanceof` operator returns the class that value is an instance of.

```
def Person {}
def Student extends Person {}

instanceof student === Student
instanceof student !== Person
instanceof persons === Person
```

## Pick

The `pick` operator retrieves the corresponding value(s) from an `object`.

```
{foo: 1} pick 'foo' === 1
{foo: 1, bar: 2} pick {foo, bar} === {foo: 1, bar: 2}
[2, 3, 5, 7, 11, 13] pick [1...4] === [3, 5, 7, 11]
[2, 3, 5, 7, 11, 13] pick [1, 2, 3, 4] === [3, 5, 7, 11]
```

In some respects the `pick` operator is much like the subscript `[]` operator. Pick however is aligned to support a range of contexts including destructuring function arguments and picking values from exotic objects.


## Spread

The `...` operator is a generic operator that spreads it's contents onto the context of its binding. The different contexts include function arguments `fun ...arg`, objects `{...a}` arrays `[...a]` and numbers `0...3`.

```
int[2] arr = [1, 2]
obj obj = {foo = 1}

{...obj, bar = 2} === {foo = 1, bar = 2}

[0, ...arr] === [0, 1, 2]

[1...3] === [1, 2, 3]

fun ...args {
	print(typeof args === 'array')
}
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
arr[7] = 10
arr[7] == null
sizeof arr == 6
```

## Standard Library?

### RegExp

```
RegExp(str value, str flags) obj<RegExp>
RegExp('value', 'g') === \value\g
```

### JSON

```
JSON.parse(str target) obj
JSON.stringify(obj target) str
```

## System

```
System.assert(bit value)
System.write(...arguments)
System.print(...arguments)
```

### Math

```
Math.random() num
Math.abs(num target) num
Math.ceil(num target) num
Math.exp(num target) num
Math.floor(num target) num
Math.round(num target) num
Math.sign(num target) num
Math.trunc(num target) num
Math.sqrt(num target) num
Math.cbrt(num target) num
Math.imul(num x, num y) num
Math.log(num target) num
Math.cos(num target) num
Math.cosh(num target) num
Math.sin(num target) num
Math.tan(num target) num
Math.max(...arguments) num
Math.min(...arguments) num
Math.hypot(...arguments) num
```


# Ally

Pronounced L-I, Ally is a static programming language with semi-optional types. The language draws inspiration from C, JavaScript, Swift and PHP.

## Reserved

```
int, flt, str, obj, def, fun, var,
true, false, null,
import, export, as,
continue, break, return, throw, delete, pick, typeof, sizeof, instanceof, keyof,
try, catch, finally, if, else, for, in, switch, case, default,
super, extends, await
```

## Comments

Line comments start with `//` and end at the end of the line.

```
// This is a comment.
```

Block comments can nest and span multiple lines, starting with `/*` and ending with `*/`.

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

Booleans values are identified by either `true` or `false`, or `!0` or `0`. Boolean operations include:

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
int binary = 0b0101 // also included is octal and hexadecimal notation
```

Provides the usual operations: `+`, `-`, `*`, `/`, `++`, `--` etc.

```
flt a = ( 1 + 2.9 >> 2 / 1e6 + - 1 - 70e2 * 4 ) + 100
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
		print('default')
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
fun name {
}

fun name var a, var b {
}

fun name var ...args {
}

fun name var ...args, var a {
}

fun name var a, ...args {
}

fun name var a = 1 {
}

fun name var a = 1, var b = 2 {
}

fun name var a pick {var ref, var age = 1}, var b {
}

fun name
	obj a pick {str type, age = 1},
	int b {
}
```

## Lambdas

Lambdas are identical to functions and share the same type of `function`. The expression immediatly after '=>' is the return value of a lambda function.

```
var a => 'return'

var a, var b => 'return'

() => 'return'

var ...args => 'return'

var ...args, var a => 'return'

var a, var ...args => 'return'

var a pick {var ref, var age} => 'return'

var a pick {var ref, var age = 1} => 'return'

var a = 1 => 'return'

var a = 1, var b = 2 => 'return'

var a pick {var ref, var age = 1}, int b => 'return'

var a pick {str type, var age = 1}, int b => 'return'
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

print(fun name => print(''))

print(fun name =>
	print(''))
```

## Types

Types are semi-optional(inferred where possible), you can attach them to function arguments, variable bindings and class bodies. The following primitive types exist.

```
number - numbers, denoted as 'int', 'flt'
string - strings, denoted as 'str'
definition - types, denoted as 'def'

function - functions, denoted as 'fun'
object - objects, denoted as 'obj'
array - arrays, also denoted as 'obj'
```

In the form of examples this includes.

```
chr number = 8_000

int number = 64_000
flt number = 64.000
dec number = 128.000

obj object = {int len = 0, str str = ''}
str string = 'hello'

obj array = ['hello']
obj array = ['hello', 'world']

obj array = [['hello'], ['world']]
obj array = [[vec()], [vec()]]
```

The use of types follow the pattern `type binding`.

```
int age = 1

fun name int age, obj subjects, obj person {
	return 'return'
}

fun name int age, obj subjects, obj person => 'return'
```

## Class

Classes are created using the def keyword that follow the pattern `def Name ...args? {}`.

```
def Person {
	obj object = {}
	obj dictionary = {['key', 'value']}
	var variable = var(1024)
	var integer = int(1024)
	var object = obj(1024)

	fun create var name, var age {}
	fun assign var key, var value {}
	fun destroy var id {}
	fun generic def type, var value {}
}
```

Class optional parameters resemble function parameters.

```
def Person var a pick {var key}, var b = 1, obj c {
	int age = key
}
```

Fields are created statitically or through referenced named parameters.

```
def Person var age, var year, var data pick {name} {
	int x = 0
	int y = 0
	fun print => print('Hello' + 'World' + '!')
	fun write => x = value
}

obj person = Person('23', '1989', {name: 'Sultan'})

print('Name: ' + person.name 'Age: ' + person.age + ', Born In: ' + person.year)
```

Class instances are created when invoked. Parameters are passed to classes like functions.

```
obj person = Person(10, 1989, {name: 'Sultan'})
```

All named arguments in the class are assigned to a corrosponding field.

```
def Element var type, var props pick {var ref, var key}, children {
  fun handleEvent obj event {
    dispatchEvent(event, => print('dispatchEvent'))
  }
  fun dispatchEvent obj event, fun callback {
    try {
      callback(event)
    } catch e {
      throw e
    }
  }
}

fun createElement var type, obj props, var ...children {
  return Element(type, props, children)
}

obj person = Person('h1', {}, '')

print(person.type == 'h1')
```

Classes can extend other class.

```
def Person {
	fun getter var key {
		return super[key]
	}
}

def Student extends Person {
	fun get var key {
		super.getter(key)
	}
}

obj student = Student()
```

## Object

Plain objects are created using the `{}` (curly braces). Objects are immutable(size). Objects are created in two flavours, plain objects and dictionary objects.

```
obj plain = {
	int age = 27
	int year = 1989
	fun name var value => print(value)
	fun name var key, var value {
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
	var age = 27,
	var year = 1989
}

obj dictionary = {
	[{}, 27],
	['year', 1989]
}
```

## In

The `in` operator returns whether a given key is present in an `object`.

```
'foo' in {var foo = 1} == true
```

## Sizeof

The `sizeof` operator returns the size of a given array/object/string and `nan` for invalid values.

```
print(sizeof [1, 2, 3])       // 3
print(sizeof {a: 1, b: 2})    // 2
print(sizeof 'Hello')         // 5
print(sizeof fun var a, var b {})     // 2
print(sizeof {[1, '1']})      // 1
```

## Typeof

The `typeof` operator returns the type of a given value in string form.

```
print(typeof [1, 2, 3])       // 'array'
print(typeof {a: 1, b: 2})    // 'object'
print(typeof "Hello")         // 'string'
print(typeof 2)               // 'number'
print(typeof fun {})          // 'function'
print(typeof true)            // 'boolean'
print(typeof {[1, '1']})      // 'object'

print(switch typeof 100 {
	case 'object' => 'object'
	case 'number' => 'number'
})
```

## Instanceof

The `instanceof` operator returns the class that value is an instance of.

```
def Person {}
def Student extends Person {}

var persons = Person()
var student = Student()

persons instanceof Person == true
student instanceof Student === true
student instanceof Person !== true
```

## Pick

The `pick` operator retrieves the corresponding value(s) from an `object`.

```
{var foo: 1, var bar: 2} pick {var foo, var bar} === {var foo: 1, var bar: 2}
[2, 3, 5, 7, 11, 13] pick [1...4] === [3, 5, 7, 11]
[2, 3, 5, 7, 11, 13] pick [1, 2, 3, 4] === [3, 5, 7, 11]
```

In some respects the `pick` operator is much like the subscript `[]` operator. Pick however is aligned to support a range of contexts including destructuring function arguments and picking values from exotic objects.


## Spread

The `...` operator is a generic operator that spreads it's contents onto the context of its binding. The different contexts include function arguments `fun ...arg`, objects `{...a}` arrays `[...a]` and numbers `0...3`.

```
int arr = [1, 2]
obj foo = {var foo = 1}

{...foo, var bar = 2} === {var foo = 1, var bar = 2}

[0, ...arr] === [0, 1, 2]

[1...3] === [1, 2, 3]

fun name var ...args {
	print(typeof args === 'array')
}
```

## Array

Arrays are immutable(size), Array literals are delimited with brackets `[`, `]` and share the form `[1, 2, 3]`.

```
// create
int arr[] = [0, 2, 3, 4...6]

// assigment
arr[0] = 1

// deep compare
arr === [1, 2, 3, 4, 5, 6]

// noop
arr[7] = 10
arr[7] == null
sizeof arr == 6
```

## Standard Library

### Network

```
import net as {stringify}

stringify(obj target) str
```

## System

```
import sys as {write, print}

write(...arguments) int
print(...arguments) int
```

### Math

```
import math as math

math.random() flt
math.abs(flt target) flt
math.ceil(flt target) flt
math.floor(flt target) flt
math.round(flt target) flt
math.sign(flt target) flt
math.trunc(flt target) flt
math.sqrt(flt target) flt
math.cbrt(flt target) flt
math.log(flt target) flt
math.cos(flt target) flt
math.cosh(flt target) flt
math.sin(flt target) flt
math.tan(flt target) flt
math.max(flt ...arguments) flt
math.min(flt ...arguments) flt
math.hypot(flt ...arguments) flt
```

# Ally

Pronounced L-I, Ally is a operator centric programming language with semi-optional types, where in addition to objects & functions, operators are also first class programming values.

This means that we can create new operators and extend other non-built-in operators. The language closely resembles JavaScript and Swift, with a touch of Go's inheritance model, the core syntax is as follows.

```
operator (value) {} label {} // operator(value, () => {}, () => {})
typeof if == 'function' // true
```

This document serves as an initial draft for the languages design. The comments on the side of some code snippets serve to model a point of view for how operators are composed.

The implementation of the language assumes a few concerns.

1. tail call support.
2. near zero overhead functions(especially around arrow functions).

With these heuristics we can build any operator on top of this. To demonstrate this we will try to show how we could build a few common built-in operators in user-land.

# Implementing `if` like operators

```
if (value) {} // if (value, () => {})
if (value) {} else {} // if (value, () => {}, () => {})
if (value) {} else if (value) {} // if (value, () => {}, () => if (value, () => {}))

function if (value, success, failure) {
	return value ? success() : failure()
}
```

# Implementing `while` like operators

Expressions are the only non-optional types. These can used to implement `while` like operators. As a note `while` like operators are the main reason tail calls are a nice to have as a foundational concern in order to make possible user-land implementations of `while` like operators.

```
while (condition) {} // while (condition, () => {})

function while (expression condition, success) {
	!condition() ? success(), condition : return
}
```

Where the outer scope of this might look like in a language like JavaScript.

```
while (i++) {}
while (() => i++, () => {})
```

## Implementing `switch` like operators

```
switch (value) {1: {}} // switch(value, Object.assign(() => {}, {1: () => {}) arrow function + keys(case->block)

function switch (value, cases) {
	return cases?[value]() // ?[key] or ?.key is null-safe property access
}
```

## Implementing `try` like operators

```
try {} catch (e) {} finally {} // try(() => {}, (e) => {}, () => {})

function try (main, fail, final) {
	try
		main()
	catch (e)
		fail[Symbol.name] != 'catch' ? throw e : catch(e)
	finally
		fail[Symbol.name] == 'finally' ? fail() : final()
}
```

## Implementing `do...while` like operators

```
do {} while (condition) // do(() => {}, (success, next) => { while (condition, success, next) })

function do (success, operator) {
	operator(success, success())
}
```

## Implementing `for` like operators

```
for (i = 0, i < 20, i++) {

}

function for (expression initialize, expression condition, expression increment, body) {
	while (condition())
		body (increment())
}
```

But we could refactor this example to use semicolons `;` instead of `,` commas to seperate arguments.
For this we build the guarantee that arguments terminated with a semicolon `;` are implicity typed an expression within the grammer.

```
for (i = 0; i < 20; i++) {

}
```

Allowing us to optionally also drop the explicit expression types we associated with our initialize and increment parameters.

```
function for (initialize, condition, expression increment, body) {
	while (condition())
		body (increment())
}
```

## Implementing `for..in` like operators

This assumes the existance of a special built-in `in` operator that creates a iterator and the existance of named parameters.

```
for (a in b) {console.write(a)} // for(Iterator(b), (a) => {})

function for (iterator, block) {
	iterator.forEach(block)
}
```

Named parameters as in when executing a block, i can pass named parameters that would be present from within the block for example.

```
example {
	console.write(a)
}

function example (block) {
	block(a: 1)
}
```

Would log 1, where the name we give `a` to the value `1` when we pass it to the function is available from within it. This is identical to what `iterator.forEach` would do.

## Types

The foundational types include

```
void
function
string
number
boolean
symbol
object
any
```

```
function (type param) type {

}

type variable = value
type object = {
	key: value
}
```

As a note the existence of named parameters is one of the reasons types are in the form `type name = value` and `function (type name) type {}` instead of `name: type = value` and `function (name: type): type {}`.

The other reason is the existence of labeled blocks which are a foundational design of the language. To demonstrate this, when we consider the grammar for function return types we could implement this in user-space if `function` was not a built-in.

```
function func (...args, block) {
	return () => typeof block(...args) != block[Symbol.name] ? throw 'error' : return
}

A = func (type param) void {
	return false
}
```

# Classes and Instances

```
function A () {
	secret = 'implicit hidden from the private and public this namespace'
	private hidden = 'explicit private, available from the private this namespace within the function'
	public exposed = 'explicit public, available from the public namespace from anywhere'
	public function method () {}
}
```

The inclusion of `public`, `public` and `protected` keywords to the grammar allow us to specify shared values that will occupy the this namespace when invoked with `new` privilege and shared when composed with the `extend` keyword.

For example.

```
function A () {
	public function method () {

	}
}
function B () {
	privateAndHiddenByDefault = 1

	public function constructor () {
		this.value = console.write('construct')
	}

	public function create () {
		return private.render(this)
	}

	private function destroy (object) {
		return object
	}

	private function render () {
		return public.constructor(private.destroy(...arguments))
	}
}

function C {
	public field = 1
}

typeof new A() == 'object' // true
typeof (new A())['method'] == 'function' // true
typeof (new B())['render'] == 'function' // false
typeof (new B())['destroy'] == 'function' // false

console.write(new B())

{
	[Symbol.name]: 'B',
	value: void,
	create: function () { private(this).render() },
	constructor: function () { console.write('construct') }
}

console.log(new C())

{
	[Symbol.name]: 'C'
	field: 1
}

(new B()).create(this: {bind: true}).bind == true // true
```

These heuristics allow use to implement classes in user-land space as follows.

```
class A {
	public function method () {

	}
}
class B {
	public function constructor () {
		this.value = console.write('construct')
	}
	public function create () {
		return private.render()
	}
	private function destroy () {
		return true
	}
	private function render () {
		return public.constructor(private.destroy())
	}
}

function class (body) {
	return (...args) => new body(...args)
}
```

## Inheritance

The idea is to avoid classical inheritance models and rather model inheritance behind a composition model motivated by the assumptions that an intepreter can make when optimizing property access in a performance setting.

```
function A () {
	secret = 'hidden'
	public function method () {

	}
	private function create () {

	}
	protected function render () {

	}
}

function B extends A {
	console.log(typeof secret) // void
	console.log(typeof method) // function
	console.log(typeof create) // void
	console.log(typeof render) // function
}
```

The `extend` keyword creates a new function `B` borrowing all the `public` and `protected` references in `A`. This is also where the `protected` keyword differs from the `protected` keyword, however if we want this have far reaching possibilities it might be important to allow the `extend` keyword to be independant of the `function` keyword.

For example.

```
extends A {} // inline extended function of A (inline as it foo(function () {}))
B extends A {} // inline extended function of A assignin a with the name B (inline as it foo(function B () {}))
function B extends A {} // the above, except it is not an inline function


function Play (Person) {
	return new Person()
}

function Characters () {
	public function getPlayerPosition () {

	}
}

console.log(
	Play(extends Characters {
		public function setPlayerPosition () {

		}
	})
)

{
	[Symbol.name]: '',
	getPlayerPosition: function () {}
	setPlayerPosition: function () {}
}
```

In doing so this makes the following among many other things possible.

```
function class (body) {
	// do some custom stuff?
	return body
}

class A {
	public function method () {

	}
}

class B extends A {
	public function create () {
		this.method('')
	}
}

(new B())['create']()

console.log(new B())

{
	[Symbol.name]: 'B',
	method: function () {}
	create: function () {}
}
```

But also means we can extend any non-built-in operator.

## Expressions

Expressions are special invocable values that allow us to re-eval privileged code from an unprivileged context, i.e a function re evaluating an expression that was passed to it. This can be used to implement `while` like operators.

This document is a work in progress design draft.

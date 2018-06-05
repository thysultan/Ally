# Ally

Pronounced L-I, Ally is a operator centric programming language with semi-optional types, where in addition to objects & functions, operators are also first class programming values.

This means that we can create new operators and extend existing operators. The language closesly resembles JavaScript and Swift, the core syntax is as follows.

```
operator (value) {} label {} // operator(value, () => {}, () => {})
typeof if == 'function' // true
```

This document serves as an initial draft for the languages design. The comments on the side of some code snippets serve to model a point of view for how operators are composed.

The implementation of the language assumes a few concerns.

1. tail call support.
2. near zero overhead functions(especially around arrow functions).

With these heursitics we can build any operator on top of this. To demonstrate this we will try to show how we could build a few common built-in operators in user-land.

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

Expressions are the only non-optional types. These can used to impleent `while` like operators. As a note `while` like operators are the main reason tail calls are a nice to have as a fundational concern in order to make possible user-land implementations of `while` like operators.

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
	iterator.forEach(a: block)
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

Would print 1, where the name we give `a` to the value `1` when we pass it to the functor is available from within it. This is identical to what `iterator.forEach` would do.

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

let variable: type = value
let object: type = {
	key: value
}
```

# Classes and Instannces

```
function A () {
	secret = 'implicit private and hidden from the private this namespace'
	private hidden = 'explicit private, available from the private this namespace within the functor'
	public exposed = 'explicit public, available from the public namespace from anywhere'
	public function method () {}
}
```

The inclusion of `public`, `public` and `protected` keywords to the grammer allow us to specify values that will occupy the this namespace when invoked with `new` privilege.

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

	protected function destroy (object) {
		return object
	}

	private function render () {
		return public.constructor(protected.destroy(...arguments))
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

print (new C())

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
	protected function destroy () {
		return true
	}
	private function render () {
		return public.constructor(protected.destroy())
	}
}

function class (body) {
	return (...args) => new body(...args)
}
```

## Expressions

Expressions are special invocable values that allow us to re-eval privilaged code from an unprivlaged context, i.e a function re evaluating an expression that was passed to it. This can be used to implement `while` like operators.

This document is a work in progress design draft.

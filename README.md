# Ally

Pronounced L-I, Ally is a operator centric programming language with semi-optional types, where in addition to objects & functions, operators are also first class programming values.

This means that we can create new operators and extend existing operators. The language closesly resembles JavaScript and Swift, the core syntax is as follows.

```
operator (value) {} label {} // operator(value, () => {}, () => {})
typeof if === 'function' // true
```

This document serves as an initial draft for the languages design. The comments on the side of some code snippets serve to model a point of view for how operators are composed.

The implementation of the language assumes a few concerns.

1. tail call support.
2. near zero overhead functions(especially around arrow functions).

With these heursitics we can build any operator on top of this. To demonstrate this we will try to show how we could build a few common built-in operators in user-land.

## Implementing `if` like operators

```
if (value) {} // if (value, () => {})
if (value) {} else {} // if (value, () => {}, () => {})
if (value) {} else if (value) {} // if (value, () => {}, () => if (value, () => {}))

function if (value, success, failure) {
	return value ? success() : failure()
}
```

## Implementing `while` like operators

Expressions are the only non-optional types. These can used to impleent `while` like operators. As a note `while` like operators are the main reason tail calls are a nice to have as a fundational concern in order to make possible user-land implementations of `while` like operators.

```
while (condition) {} // while (condition, () => {})

function while (expression condition, success) {
	!condition ? eval(condition) : return
}
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
		fail['name'] !== 'catch' ? throw e : catch(e)
	finally
		fail['name'] === 'finally' ? fail() : final()
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
	while (eval(condition))
		body (eval(increment))
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
	while (eval(condition))
		body (eval(increment))
}
```

## Implementing `for..in` like operators

This assumes the existance of a special built-in `in` operator that creates a iterator and the existance of named parameters.

```
for (a in b) {print(a)} // for(Iterator(b), (a) => {})

function for (iterator, block) {
	iterator.forEach(a: block)
}
```

Named parameters as in when executing a block, i can pass named parameters that would be present from within the block for example.

```
example {
	print(a)
}

function example (block) {
	block(a: 1)
}
```

Would print 1, where the name we give `a` to the value `1` when we pass it to the functor is available from within it. This is identical to what `iterator.forEach` would do.

## Types

```
function (param: type): return type {

}

let variable: type = value
let object: Type = {
	key: value
}
```

# Miscellaneous

> What about classes, what if we wanted to implement classes in user-land. i.e having a non-built in class operator.

So imagine the following scenario.

```
class A {
	method () {}
}
```

This presents a conflict where we don't know whether method () {} is a functor call or a method definition. The proposition is thus to add the `public` keyword syntax to the grammer, the use of which allows us to specifiy shared values within a functor body. For example.

```
function A () {
	public function method () {

	}
}
typeof public(A)['method'] === 'function' // true
```

These heuristics allow use to implement classes in user-land space as follows.

```
class A {
	public function method () {

	}
}

function class (body) {
	return () => ({...public(body)})
}
```

This document is a work in progress design draft.

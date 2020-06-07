// install sources fetched from https://example.com allowing net(ability to make network access) sys(ability to access system files/resources), asm(ability to write assembly inline)
// > ally --net/sys/asm https://example.com
// defaut is to allow none(for network based imports/installs), that can be re-configured to custom defaults.
// > ally https://example.com
// if example.com tries to use net/sys/asm compiler error.

// flt : double
// int : long long int / ll

// void* string : [size, hash, [...char]]
// void* arrays : [size, hash, [...data]]
// void* object : [size, hash, [...data]]

// void* entry : (id, key, value)

// object: indexable(arrays) / non-indexable

// address [...index_of_objects]
// memory [...pages]
// page []


#include <stdio.h>
#include <math.h>

typedef double var;
typedef void* obj;
typedef var *fun(var*);

static var mem[1024];

var fn (var* args) {
  var arg_0 = args[0];
  var arg_1 = args[1];
}

var example_fn_call () {
  const var* args[3]; // setup args
  args[0] = 0.0;
  args[1] = 1.0;
  args[2] = 2.0;
  return (fun)fn(args);
}

static var err(var n) {}

// n.x + n.y + n.z
static var sum(var n) {
	// subsequent property access location is cached

	static var r0 = 0;
	var key0_0 = get(n, r0 || (r0 = key(n, 'x')));

	static var r1 = 0;
	var key0_1 = get(n, r1 || (r1 = key(h, 'y')));

	static var r2 = 0;
	var key0_2 = get(n, r2 || (r2 = key(n, 'z')));

	var var0_0 = key0_0 + key0_1 + key0_2;
	return var0;
}

int main() {
	var n = 30;
	printf("Factorial of %f: \n%f\n" , n , sum(n));
}
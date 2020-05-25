#include <stdio.h>
#include <math.h>

typedef long long i64;
typedef double f64;
typedef void* obj;
typedef f64 *fun(f64*);

static f64 mem[1024];

f64 fn (f64* args) {
  f64 arg_0 = args[0];
  f64 arg_1 = args[1];
}

f64 example_fn_call () {
    const f64* args = {}; // setup args
    args[0] = 0.0;
    args[1] = 1.0;
    args[2] = 2.0;
    //
    return (fun)fn(args);
}

static f64 err(f64 n) {}

// n.x + n.y + n.z
static f64 sum(f64 n) {
	static const reg[3] = {0};
	// subsequent propert access location is cached
	f64 key0_0 = get(n, reg[0] || (reg[0] = hid('x')) || err(0));
	f64 key0_1 = get(n, reg[1] || (reg[1] = hid('y')) || err(0));
	f64 key0_2 = get(n, reg[2] || (reg[3] = hid('z')) || err(0));
	// could replace err withe hid() returning an address to a function, that erors if you try to get a property from it or execute it.
	f64 var0_0 = key0_0 + key0_1 + key0_2;
	return var0;
}

int main() {
	f64 n = 30;
	printf("Factorial of %f: \n%f\n" , n , sum(n));
}

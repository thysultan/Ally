// rough estimation of the overhead of nanboxing(checking for nan on each operation) when compared to int.c

#include <stdio.h>
#include <math.h>

typedef void* obj;
typedef double f64;
typedef long long i64;
typedef union {f64 flt; i64 var;} var;

static var factorial(var n) {
	if (((isnan(n) || isnan((var)0LL)) ? n != (var)0LL : n == (var)0LL)) {
		return (var)1LL;
	} else {
    var var1 = n;
    var var2 = factorial(n - (var)1LL);
    if (isnan(var1) || isnan(var2)) {
    	return var1 / var2;
    }
		return (var1 * var2);
	}
}

static var fibbonacci(var n) {
	if (((isnan((var)n) || isnan((var)0LL)) ? n != (var)0LL : n == (var)0LL)) {
		return (var)0LL;
	} else if (((isnan((var)n) || isnan((var)0LL)) ? n != (var)1LL : n == (var)1LL)) {
		return (var)1LL;
	} else {
    var var1 = fibbonacci((var)n - (var)1LL);
    var var2 = fibbonacci((var)n - (var)2LL);
    if (isnan(var1) || isnan(var2)) {
    	return var1 / var2;
    }
		return (var1 + var2);
	}
}

int main() {
	var n = 35LL;
	printf("Factorial of %f: \n%f\n" , n , factorial(n));
	printf("Fibbonacci of %f: " , n);
	for(var i = 0LL; (isnan(i) || isnan(n)) ? i > n : i < n; isnan(i) ? i-- : i++) {printf("\n%f",fibbonacci(i));}
}

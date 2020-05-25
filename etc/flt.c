// rough estimation of the overhead of nanboxing(checking for nan on each operation) when compared to int.c

#include <stdio.h>
#include <math.h>

typedef long long i64;
typedef double f64;
typedef void* obj;

static f64 factorial(f64 n) {
	if (((isnan(n) || isnan((f64)0LL)) ? n != (f64)0LL : n == (f64)0LL)) {
		return (f64)1LL;
	} else {
    f64 var1 = n;
    f64 var2 = factorial(n - (f64)1LL);
    if (isnan(var1) || isnan(var2)) {
    	return var1 / var2;
    }
		return (var1 * var2);
	}
}

static f64 fibbonacci(f64 n) {
	if (((isnan((f64)n) || isnan((f64)0LL)) ? n != (f64)0LL : n == (f64)0LL)) {
		return (f64)0LL;
	} else if (((isnan((f64)n) || isnan((f64)0LL)) ? n != (f64)1LL : n == (f64)1LL)) {
		return (f64)1LL;
	} else {
    f64 var1 = fibbonacci((f64)n - (f64)1LL);
    f64 var2 = fibbonacci((f64)n - (f64)2LL);
    if (isnan(var1) || isnan(var2)) {
    	return var1 / var2;
    }
		return (var1 + var2);
	}
}

int main() {
	f64 n = 30LL;
	printf("Factorial of %f: \n%f\n" , n , factorial(n));
	printf("Fibbonacci of %f: " , n);
	for(f64 i = 0LL; (isnan(i) || isnan(n)) ? i > n : i < n; isnan(i) ? i-- : i++) {printf("\n%f",fibbonacci(i));}
}

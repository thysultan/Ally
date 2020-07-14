#include <stdio.h>

typedef long double num;

num factorial(num n) {
	if (n == 0) {
		return 1;
	} else {
		return n * factorial(n - 1);
	}
}

num fibbonacci(num n) {
	if (n == 0){
		return 0;
	} else if (n == 1) {
		return 1;
	} else {
		return fibbonacci(n - 1) + fibbonacci(n - 2);
	}
}

int main() {
	num n = 30;
	printf("Factorial of %Lf: \n%Lf\n" , n , factorial(n));
	printf("Fibbonacci of %Lf: " , n);
	for(num i = 0;i<n;i++) {printf("\n%Lf ", fibbonacci(i));}
}

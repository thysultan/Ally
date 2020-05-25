#include <stdio.h>

int factorial(int n) {
	if(n == 0) {
		return 1;
	} else {
		int var1 = n;
    int var2 = factorial(n - 1);
		return (var1 * var2);
	}
}

int fibbonacci(int n) {
	if(n == 0){
		return 0;
	} else if(n == 1) {
		return 1;
	} else {
		int var1 = fibbonacci(n - 1);
		int var2 = fibbonacci(n - 2);
		return (var1 + var2);
	}
}

int main() {
	int n = 30;
	printf("Factorial of %d: \n%d\n" , n , factorial(n));
	printf("Fibbonacci of %d: " , n);
	for(int i = 0;i<n;i++) {printf("\n%d ",fibbonacci(i));}
}

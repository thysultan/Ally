#include "Program.c"
#include <time.h>

int main(int argc, char *argv[]) {
	int example[] = {
		// int fib(n) {
		// if (n == 0) return 0;
		OP_LOAD_LOCAL, 3,  // 0 - load last function argument N
		OP_CONST, 0,       // 2 - put 0
		OP_EQUAL,          // 4 - check equality: N == 0
		OP_JUMP_FALSE, 10, // 5 - if they are NOT equal, goto 10
		OP_CONST, 0,       // 7 - otherwise put 0
		OP_RETURN,         // 9 - and return it

		// if (n < 3) return 1;
		OP_LOAD_LOCAL, 3,  // 10 - load last function argument N
		OP_CONST, 3,       // 12 - put 3
		OP_LESS_THAN,      // 14 - check if 3 is less than N
		OP_JUMP_FALSE, 20, // 15 - if 3 is NOT less than N, goto 20
		OP_CONST, 1,       // 17 - otherwise put 1
		OP_RETURN,         // 19 - and return it

		// else return fib(n-1) + fib(n-2);
		OP_LOAD_LOCAL, 3,  // 20 - load last function argument N
		OP_CONST, 1,       // 22 - put 1
		OP_SUBTRACT,       // 24 - calculate: N-1, result is on the stack
		OP_CALL, 0, 1,     // 25 - call fib function with 1 arg. from the stack
		OP_LOAD_LOCAL, 3,  // 28 - load N again
		OP_CONST, 2,       // 30 - put 2
		OP_SUBTRACT,       // 32 - calculate: N-2, result is on the stack
		OP_CALL, 0, 1,     // 33 - call fib function with 1 arg. from the stack
		OP_ADD,            // 36 - since 2 fibs pushed their ret values on the stack, just add them
		OP_RETURN,         // 37 - return from procedure

		// entrypoint - main function
		OP_CONST, 28,      // 38 - put 6
		OP_CALL, 0, 1,     // 40 - call function: fib(arg) where arg = 6;
		OP_PRINT,          // 43 - print result
		OP_HALT            // 44 - stop program
	};

	// initialize program
	struct Program *program = ProgramConstruct(example, 38, 0);

	float startTime = (float)clock();

	// evaluate program
	ProgramEvaluate(program);

	float endTime = (float)clock();
	float timeElapsed = (endTime - startTime)/CLOCKS_PER_SEC;

	printf("time: %f\n", (float)timeElapsed);

	ProgramDestroy(program);

	return 0;
}

#include "Program.c"
#include <time.h>

int main(int argc, char *argv[]) {
	int example[] = {
		// int fib(n) {
		// if (n < 2) return n;
		OP_LOAD_LOCAL, 3,  // 0 - load last function argument (n)
		OP_CONST, 2,       // 2 - put 2
		OP_LESS_THAN,      // 4 - check (n < 2)
		OP_JUMP_FALSE, 10, // 5 - if !(n < 2), goto 10
		OP_LOAD_LOCAL, 3,  // 7 - otherwise put (n)
		OP_RETURN,         // 9 - and return it

		// else return fib(n - 1) + fib(n - 2);
		OP_LOAD_LOCAL, 3,  // 10 - load last function argument (n)
		OP_CONST, 1,       // 12 - put 1
		OP_SUBTRACT,       // 14 - calculate: (n - 1), result is on the stack
		OP_CALL, 0, 1,     // 15 - call fib function with 1 arg. from the stack
		OP_LOAD_LOCAL, 3,  // 18 - load (n) again
		OP_CONST, 2,       // 20 - put 2
		OP_SUBTRACT,       // 22 - calculate: (n - 2), result is on the stack
		OP_CALL, 0, 1,     // 23 - call fib function with 1 arg from the stack
		OP_ADD,            // 26 - since 2 fibs pushed their ret values on the stack, just add them
		OP_RETURN,         // 27 - return from procedure

		// entrypoint - main function
		OP_CONST, 28,      // 28 - put 28
		OP_CALL, 0, 1,     // 30 - call function: fib(n) where n = 28;
		OP_PRINT,          // 33 - print result
		OP_HALT            // 34 - stop program
	};

	// initialize program
	// struct Program *program = ProgramConstruct(example, 38, 0);
	struct Program *program = ProgramConstruct(example, 28, 0);

	float startTime = (float)clock();

	// evaluate program
	ProgramEvaluate(program);

	float endTime = (float)clock();
	float timeElapsed = (endTime - startTime)/CLOCKS_PER_SEC;

	printf("time: %f\n", (float)timeElapsed);

	ProgramDestroy(program);

	return 0;
}

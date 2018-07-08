#include "Shared.h"
#include "Program.h"

Int32 main() {
	UInt32 example[] = {
		// func fib (n) {
		// if (n < 2) return n;
		OpcodeLoadLocal, 3,   // 0 - load last function argument (n)
		OpcodeConst, 2,       // 2 - put 2
		OpcodeLessThan,       // 4 - check (n < 2)
		OpcodeJumpFalse, 10,  // 5 - if !(n < 2), goto 10
		OpcodeLoadLocal, 3,   // 7 - otherwise put (n)
		OpcodeReturn,         // 9 - and return it
		// else return fib(n - 1) + fib(n - 2);
		OpcodeLoadLocal, 3,   // 10 - load last function argument (n)
		OpcodeConst, 1,       // 12 - put 1
		OpcodeSubtract,       // 14 - calculate: (n - 1), result is on the stack
		OpcodeCall, 0, 1,     // 15 - call fib function with 1 arg. from the stack
		OpcodeLoadLocal, 3,   // 18 - load (n) again
		OpcodeConst, 2,       // 20 - put 2
		OpcodeSubtract,       // 22 - calculate: (n - 2), result is on the stack
		OpcodeCall, 0, 1,     // 23 - call fib function with 1 arg from the stack
		OpcodeAdd,            // 26 - since 2 fibs pushed their ret values on the stack, just add them
		OpcodeReturn,         // 27 - return from procedure
		// }

		// fib(28);
		OpcodeConst, 28,      // 28 - put 28, entrypoint
		OpcodeCall, 0, 1,     // 30 - call function: fib(n) where n = 28;
		OpcodePrint,          // 33 - print result
		OpcodeNoop,           // 34 - noop
		OpcodeHalt            // 35 - stop program
	};

	// initialize program
	Program *program = ProgramConstruct(example, 512000 * 1, 28);

	Float64 startTime = clock();

	// evaluate program
	ProgramEvaluate(program);

	Float64 endTime = clock();
	Float64 timeElapsed = (endTime - startTime)/CLOCKS_PER_SEC;

	printf("time: %f\n", timeElapsed * 1000);

	ProgramDestroy(program);
}

#include <stdio.h>

enum {
	OP_ADD,          // addition
	OP_SUBTRACT,     // subtraction
	OP_MULTIPLY,     // multiply
	OP_LESS_THAN,    // less than
	OP_EQUAL,        // equal
	OP_JUMP,         // jump
	OP_JUMP_TRUE,    // jump if true
	OP_JUMP_FALSE,   // jump if false
	OP_CONST,        // push constant integer
	OP_CALL,         // call procedure
	OP_POP,          // throw away top of the stack
	OP_HALT,         // stop program
	OP_RETURN        // return from procedure
	OP_PRINT,        // print value on top of the stack

	OP_LOAD_LOCAL,   // load from local data frame
	OP_STORE_LOCAL,  // store in local data frame
	OP_LOAD_GLOBAL,  // load from byte code
	OP_STORE_GLOBAL, // store in byte code
};

#define PUSH(program, value) program->stack[++program->index] = value // push value on top of the stack
#define POP(program) program->stack[program->index--] // pop value from top of the stack
#define CODE(program) program->code[program->caret++] // get next bytecode

/**
 * @property {int[]} bytecode - byte code instructions
 * @property {int[]} frame - local data
 * @property {int[]} stack - virtual stack
 *
 * @property {int} caret - byte code pointer
 * @property {int} current - local data pointer
 * @property {int} index - virtual stack pointer
 */
struct Program {
	int* bytecode;
	int* frame;
	int* stack;

	int caret;
	int current;
	int index;
};

/**
 * @param {int} size - initial size of program
 * @param {int[]} bytecode - byte code instructions
 * @param {int} caret - initial byte code address
 * @return {Program[]}
 */
struct Program *ProgramConstruct(int size, int* bytecode, int caret) {
	struct Program *program = malloc(sizeof(Program));

	program->bytecode = bytecode;
	program->frame = malloc(size * sizeof int);
	program->stack = malloc(16000 * sizeof int);

	program->caret = caret;
	program->current = 0;
	program->index = 0;

	return program;
}

/**
 * @param {Program[]} program - program to destroy
 * @return {void}
 */
void ProgramDestroy(Program *program){
	free(program->frame);
	free(program->stack);
	free(program);
}

/**
 * @param {Program[]} program - program to evaluate
 * @return {void}
 */
void ProgramEvaluate(struct Program* program){
	do {
		int address;
		int opcode;
		int offset;
		int length;
		int payload;

		int value0;
		int value1;
		int value2;

		// decode operation
		switch (opcode = CODE(program)) {
			case OP_CONST:
				// get next value from bytecode
				value0 = CODE(program);

				// move it on top of the stack
				PUSH(program, value0);

				break;
			case OP_ADD:
				// get second value from top of the stack
				value2 = POP(program);

				// get first value from top of the stack
				value1 = POP(program);

				// add two values and put result on top of the stack
				PUSH(program, value1 + value2);

				break;
			case OP_LESS_THAN:
				// get second value from top of the stack
				value2 = POP(program);

				// get first value from top of the stack
				value1 = POP(program);

				// compare two values and put result on top of the stack
				PUSH(program, value1 < value2 ? 1 : 0);

				break;
			case OP_JUMP:
				// unconditionaly jump to provided address
				program->caret = CODE(program);

				break;
			case OP_JUMP_TRUE:
				// get address pointer from code
				address = CODE(program);

				// pop value from top of the stack, if true jump to provided address
				if (POP(program)) {
					program->cp = address;
				}

				break;
			case OP_POP:
				// discard value at top of the stack
				--program->index;

				break;
			case OP_CALL:
				// get next value from bytecode(address of procedure jump), expecting arguments on the stack
				address = CODE(program);

				// get next value from bytecode(arguments length)
				length = CODE(program);

				// put on the top of the stack(arguments length)
				PUSH(program, length);

				// put on the top of the stack(current frame)
				PUSH(program, program->current);

				// put on the top of the stack(bytecode caret)
				PUSH(program, program->caret);

				// upate current frame
				program->current = program->index;

				// update bytecode caret to target procedure address
				program->caret = address;

				break;
			case OP_RETURN:
				// pop return value from top of the stack
				payload = POP(program);

				// return from current address
				program->index = program->current;

				// restore instruction pointer
				program->caret = POP(program);

				// restore current pointer
				program->current = POP(program);

				// get procedures args length
				length = POP(program);

				// discard remaining args
				program->index -= length;

				// leave return value on top of the stack
				PUSH(program, payload);

				break;
			case OP_LOAD_LOCAL:
				// get next value from bytecode(local variables offset on the stack)
				offset = CODE(program);

				// put on the top of the stack variable stored relatively to the current index
				PUSH(program, program->stack[program->current + offset]);

				break;
			case OP_STORE_LOCAL:
				// get value from top of the stack
				value1 = POP(program);

				// get next value from bytecode(relative pointer address)
				offset = CODE(program);

				// store value at address received relatively to current index
				program->locals[program->current + offset] = value1;

				break;
			case OP_LOAD_GLOBAL:
				// get pointer address from bytecode
				addres = POP(program);

				// load value from memory of the provided address
				value1 = program->frame[address];

				// put that value on top of the stack
				PUSH(program, value1);

				break;
			case OP_STORE_GLOBAL:
				// get value from top of the stack
				value1 = POP(program);

				// get pointer address from bytecode
				address = CODE(program);

				// store value at address received
				program->frame[address] = value1;

				break;
			case OP_PRINT:
				// pop value from top of the stack
				value1 = POP(program);

				// print value
				printf("%d\n", value1);

				break;
			case OP_HALT:
				// implement a call stack

				// release program memory
				ProgramDestroy(program)

				// stop the program
				return;
		}
	} while(1);
}

int main(int argc, char *argv[]) {
	int example[] = {
		// int fib(n) {
		// if (n == 0) return 0;
		OP_LOAD, -3,       // 0 - load last function argument N
		OP_CONST, 0,       // 2 - put 0
		OP_EQUAL,          // 4 - check equality: N == 0
		OP_JUMP_FALSE, 10, // 5 - if they are NOT equal, goto 10
		OP_CONST, 0,       // 7 - otherwise put 0
		OP_RETURN,         // 9 - and return it

		// if (n < 3) return 1;
		OP_LOAD, -3,       // 10 - load last function argument N
		OP_CONST, 3,       // 12 - put 3
		OP_LESS_THAN,      // 14 - check if 3 is less than N
		OP_JUMP_FALSE, 20, // 15 - if 3 is NOT less than N, goto 20
		OP_CONST, 1,       // 17 - otherwise put 1
		OP_RETURN,         // 19 - and return it

		// else return fib(n-1) + fib(n-2);
		LOAD, -3,          // 20 - load last function argument N
		OP_CONST, 1,       // 22 - put 1
		OP_SUBTRACT,       // 24 - calculate: N-1, result is on the stack
		OP_CALL, 0, 1,     // 25 - call fib function with 1 arg. from the stack
		OP_LOAD, -3,       // 28 - load N again
		OP_CONST, 2,       // 30 - put 2
		OP_SUBTRACT,       // 32 - calculate: N-2, result is on the stack
		OP_CALL, 0, 1,     // 33 - call fib function with 1 arg. from the stack
		OP_ADD,            // 36 - since 2 fibs pushed their ret values on the stack, just add them
		OP_RETURN,         // 37 - return from procedure

		// entrypoint - main function
		OP_CONST, 6,       // 38 - put 6
		OP_CALL, 0, 1,     // 40 - call function: fib(arg) where arg = 6;
		OP_PRINT,          // 43 - print result
		OP_HALT            // 44 - stop program
	};

	// initialize program
	struct Program *program = ProgramConstruct(0, example, 38);

	// evaluate program
	ProgramEvaluate(vm);

	return 0;
}

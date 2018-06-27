#include <stdlib.h>
#include <stdio.h>

enum {
	OP_HALT,         // stop program
	OP_PRINT,        // print value on top of the stack
	OP_ADD,          // addition
	OP_SUBTRACT,     // subtraction
	OP_MULTIPLY,     // multiplition
	OP_LESS_THAN,    // less than
	OP_EQUAL,        // equal
	OP_JUMP,         // jump
	OP_JUMP_TRUE,    // jump if true
	OP_JUMP_FALSE,   // jump if false
	OP_CONST,        // push constant
	OP_CALL,         // call procedure
	OP_POP,          // discard away top of the stack
	OP_RETURN,       // return from procedure
	OP_LOAD_LOCAL,   // load from local
	OP_STORE_LOCAL,  // store in local
	OP_LOAD_GLOBAL,  // load from global
	OP_STORE_GLOBAL, // store in global
};

#define MACRO_STACK_POP(program) program->stack[program->index--]
#define MACRO_STACK_PUSH(program, value) program->stack[++program->index] = value
#define MACRO_CARET_NEXT(program) program->bytecode[program->caret++]
#define MACRO_CARET_GOTO_NEXT(program, operation) goto *operation[MACRO_CARET_NEXT(program)]

#define POP(program) program->stack[program->index--] // pop value from top of the stack
#define PUSH(program, value) program->stack[++program->index] = value // push value on top of the stack
#define CODE(program) program->bytecode[program->caret++] // get next bytecode

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
	int *bytecode;
	int *frame;
	int *stack;

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
	struct Program *program = malloc(sizeof(program));
	int *frame = malloc(sizeof(frame) * 16000);
	int *stack = malloc(sizeof(stack) * 16000);

	program->bytecode = bytecode;
	program->frame = frame;
	program->stack = stack;
	program->caret = caret;
	program->current = 0;
	program->index = -1;

	return program;
}

/**
 * @param {Program[]} program - program to destroy
 * @return {void}
 */
void ProgramDestroy(struct Program *program){
	free(program->frame);
	free(program->stack);
	free(program);
}

/**
 * @param {Program[]} program - program to evaluate
 * @return {void}
 */
void ProgramEvaluate(struct Program* program) {
	int address;
	int offset;
	int length;
	int payload;

	// registers
	int value0;
	int value1;
	int value2;

{
	// indices of labels are the relevant opcodes
  static void* operation[] = {
  	&&LABEL_HALT,
  	&&LABEL_PRINT,
  	&&LABEL_ADD,
  	&&LABEL_SUBTRACT,
  	&&LABEL_MULTIPLY,
  	&&LABEL_LESS_THAN,
  	&&LABEL_EQUAL,
  	&&LABEL_JUMP,
  	&&LABEL_JUMP_TRUE,
  	&&LABEL_JUMP_FALSE,
  	&&LABEL_CONST,
  	&&LABEL_CALL,
  	&&LABEL_POP,
  	&&LABEL_RETURN,
  	&&LABEL_LOAD_LOCAL,
  	&&LABEL_STORE_LOCAL,
  	&&LABEL_LOAD_GLOBAL,
  	&&LABEL_STORE_GLOBAL,
  };

  // goto initial instruction
  MACRO_CARET_GOTO_NEXT(program, operation);

 	LABEL_HALT: {
		// release program memory
		ProgramDestroy(program);

		// stop the program
		return;
 	}

 	LABEL_PRINT: {
 		// pop value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// print value
 		printf("result: %d\n", value1);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_ADD: {
 		// get second value from top of the stack
 		value2 = MACRO_STACK_POP(program);

 		// get first value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// add two values and put result on top of the stack
 		MACRO_STACK_PUSH(program, value1 + value2);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_SUBTRACT: {
 		// get second value from top of the stack
 		value2 = MACRO_STACK_POP(program);

 		// get first value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// subtract two values and put result on top of the stack
 		MACRO_STACK_PUSH(program, value1 - value2);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_MULTIPLY: {
 		// get second value from top of the stack
 		value2 = MACRO_STACK_POP(program);

 		// get first value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// multiply two values and put result on top of the stack
 		MACRO_STACK_PUSH(program, value1 * value2);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_LESS_THAN: {
 		// get second value from top of the stack
 		value2 = MACRO_STACK_POP(program);

 		// get first value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// compare two values and put result on top of the stack
 		MACRO_STACK_PUSH(program, value1 < value2 ? 1 : 0);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_EQUAL: {
 		// get second value from top of the stack
 		value2 = MACRO_STACK_POP(program);

 		// get first value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// compare two values and put result on top of the stack
 		MACRO_STACK_PUSH(program, value1 == value2 ? 1 : 0);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_JUMP: {
 		// unconditionaly jump to provided address
 		program->caret = MACRO_CARET_NEXT(program);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_JUMP_TRUE: {
 		// get address pointer from code
 		address = MACRO_CARET_NEXT(program);

 		// pop value from top of the stack, if true jump to provided address
 		if (MACRO_STACK_POP(program) != 0) {
 			program->caret = address;
 		}

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_JUMP_FALSE: {
 		// get address pointer from code
 		address = MACRO_CARET_NEXT(program);

 		// pop value from top of the stack, if false jump to provided address
 		if (MACRO_STACK_POP(program) == 0) {
 			program->caret = address;
 		}

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_CONST: {
 		// get next value from bytecode
 		value0 = MACRO_CARET_NEXT(program);

 		// move it on top of the stack
 		MACRO_STACK_PUSH(program, value0);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_POP: {
 		// discard value at top of the stack
 		--program->index;

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_CALL: {
 		// get next value from bytecode(address of procedure jump), expecting arguments on the stack
 		address = MACRO_CARET_NEXT(program);

 		// get next value from bytecode(arguments length)
 		length = MACRO_CARET_NEXT(program);

 		// put on the top of the stack(arguments length)
 		MACRO_STACK_PUSH(program, length);

 		// put on the top of the stack(current frame)
 		MACRO_STACK_PUSH(program, program->current);

 		// put on the top of the stack(bytecode caret)
 		MACRO_STACK_PUSH(program, program->caret);

 		// upate current frame
 		program->current = program->index;

 		// update bytecode caret to target procedure address
 		program->caret = address;

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_RETURN: {
 		// pop return value from top of the stack
 		payload = MACRO_STACK_POP(program);

 		// return from current address
 		program->index = program->current;

 		// restore instruction pointer
 		program->caret = MACRO_STACK_POP(program);

 		// restore current pointer
 		program->current = MACRO_STACK_POP(program);

 		// get procedures args length
 		length = MACRO_STACK_POP(program);

 		// discard remaining args
 		program->index -= length;

 		// leave return value on top of the stack
 		MACRO_STACK_PUSH(program, payload);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_LOAD_LOCAL: {
 		// get next value from bytecode(local variables offset on the stack)
 		offset = MACRO_CARET_NEXT(program);

 		// put on the top of the stack variable stored relatively to the current index
 		MACRO_STACK_PUSH(program, program->stack[program->current - offset]);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_STORE_LOCAL: {
 		// get value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// get next value from bytecode(relative pointer address)
 		offset = MACRO_CARET_NEXT(program);

 		// store value at address received relatively to current index
 		program->frame[program->current - offset] = value1;

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_LOAD_GLOBAL: {
 		// get pointer address from bytecode
 		address = MACRO_STACK_POP(program);

 		// load value from memory of the provided address
 		value1 = program->frame[address];

 		// put that value on top of the stack
 		MACRO_STACK_PUSH(program, value1);

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}

 	LABEL_STORE_GLOBAL: {
 		// get value from top of the stack
 		value1 = MACRO_STACK_POP(program);

 		// get pointer address from bytecode
 		address = MACRO_CARET_NEXT(program);

 		// store value at address received
 		program->frame[address] = value1;

 		// goto next instruction
 		MACRO_CARET_GOTO_NEXT(program, operation);
 	}
}

	return;

	do {
		// decode operation
		switch (CODE(program)) {
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
			case OP_EQUAL:
				// get second value from top of the stack
				value2 = POP(program);

				// get first value from top of the stack
				value1 = POP(program);

				// compare two values and put result on top of the stack
				PUSH(program, value1 == value2 ? 1 : 0);

				break;
			case OP_JUMP:
				// unconditionaly jump to provided address
				program->caret = CODE(program);

				break;
			case OP_JUMP_TRUE:
				// get address pointer from code
				address = CODE(program);

				// pop value from top of the stack, if true jump to provided address
				if (POP(program) != 0) {
					program->caret = address;
				}

				break;
			case OP_JUMP_FALSE:
				// get address pointer from code
				address = CODE(program);

				// // pop value from top of the stack, if true jump to provided address
				if (POP(program) == 0) {
					program->caret = address;
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
				PUSH(program, program->stack[program->current - offset]);

				break;
			case OP_STORE_LOCAL:
				// get value from top of the stack
				value1 = POP(program);

				// get next value from bytecode(relative pointer address)
				offset = CODE(program);

				// store value at address received relatively to current index
				program->frame[program->current - offset] = value1;

				break;
			case OP_LOAD_GLOBAL:
				// get pointer address from bytecode
				address = POP(program);

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
				printf("result: %d\n", value1);

				break;
			case OP_HALT:
				// release program memory
				ProgramDestroy(program);

				// stop the program
				return;
		}
	} while(1);
}

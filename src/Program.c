#include "Shared.h"
#include "Program.h"

#define MACRO_STACK_POP(program) program->index--
#define MACRO_STACK_POP_VALUE(program) program->stack[MACRO_STACK_POP(program)]
#define MACRO_STACK_PUSH_VALUE(program, value) program->stack[++program->index] = value
#define MACRO_CARET_NEXT_OPCODE(program) program->bytecode[program->caret++]
#define MACRO_CARET_NEXT_OPCODE_GOTO(program, operation) goto *operation[MACRO_CARET_NEXT_OPCODE(program)]

Program *ProgramConstruct(Int64 *bytecode, Int64 caret, Int64 size) {
	Program *program = malloc(sizeof(*program));
	Float64 *frame = malloc(sizeof(*frame) * size);
	Float64 *stack = malloc(sizeof(*stack) * 16000);

	program->caret = caret;
	program->current = 0;
	program->index = -1;
	program->bytecode = bytecode;
	program->frame = frame;
	program->stack = stack;

	return program;
}

void ProgramDestroy(Program *program) {
	free(program->frame);
	free(program->stack);
	free(program);
}

void ProgramEvaluate(Program *program) {
	Int64 offset;
	Int64 length;
	Int64 address;

	// registers
	Float64 value1;
	Float64 value2;

	// indices point to relevant opcode
	static void *operation[] = {
		&&LABEL_HALT,
		&&LABEL_PRINT,
		&&LABEL_ADD,
		&&LABEL_SUBTRACT,
		&&LABEL_MULTIPLY,
		&&LABEL_DIVIDE,
		&&LABEL_LESS_THAN,
		&&LABEL_GREATER_THAN,
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
	MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);

	LABEL_HALT: {
		// stop the program
		return;
	}

	LABEL_PRINT: {
		// pop value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// print value
		printf("%d\n", (int)value2);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_ADD: {
		// get second value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get first value from top of the stack
		value1 = MACRO_STACK_POP_VALUE(program);

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// add two values and put result on top of the stack
			MACRO_STACK_PUSH_VALUE(program, value1 + value2);
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_SUBTRACT: {
		// get second value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get first value from top of the stack
		value1 = MACRO_STACK_POP_VALUE(program);

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// subtract two values and put result on top of the stack
			MACRO_STACK_PUSH_VALUE(program, value1 - value2);
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_MULTIPLY: {
		// get second value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get first value from top of the stack
		value1 = MACRO_STACK_POP_VALUE(program);

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// multiply two values and put result on top of the stack
			MACRO_STACK_PUSH_VALUE(program, value1 * value2);
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_DIVIDE: {
		// get second value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get first value from top of the stack
		value1 = MACRO_STACK_POP_VALUE(program);

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// divide two values and put result on top of the stack
			MACRO_STACK_PUSH_VALUE(program, value1 / value2);
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_LESS_THAN: {
		// get second value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get first value from top of the stack
		value1 = MACRO_STACK_POP_VALUE(program);

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// compare two values and put result on top of the stack
			MACRO_STACK_PUSH_VALUE(program, value1 < value2);
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_GREATER_THAN: {
		// get second value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get first value from top of the stack
		value1 = MACRO_STACK_POP_VALUE(program);

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// compare two values and put result on top of the stack
			MACRO_STACK_PUSH_VALUE(program, value1 > value2);
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}


	LABEL_EQUAL: {
		// get second value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get first value from top of the stack
		value1 = MACRO_STACK_POP_VALUE(program);

		// compare two values and put result on top of the stack
		MACRO_STACK_PUSH_VALUE(program, value1 == value2);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_JUMP: {
		// unconditionaly jump to provided address
		program->caret = MACRO_CARET_NEXT_OPCODE(program);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_JUMP_TRUE: {
		// get address pointer from code
		address = MACRO_CARET_NEXT_OPCODE(program);

		// pop value from top of the stack, if true jump to provided address
		if (MACRO_STACK_POP_VALUE(program)) {
			program->caret = address;
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_JUMP_FALSE: {
		// get address pointer from code
		address = MACRO_CARET_NEXT_OPCODE(program);

		// pop value from top of the stack, if false jump to provided address
		if (!MACRO_STACK_POP_VALUE(program)) {
			program->caret = address;
		}

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_CONST: {
		// get next value from bytecode
		value2 = MACRO_CARET_NEXT_OPCODE(program);

		// move it on top of the stack
		MACRO_STACK_PUSH_VALUE(program, value2);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_POP: {
		// discard value at top of the stack
		MACRO_STACK_POP(program);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_CALL: {
		// get next value from bytecode(address of procedure jump), expecting arguments on the stack
		address = MACRO_CARET_NEXT_OPCODE(program);

		// get next value from bytecode(arguments length)
		length = MACRO_CARET_NEXT_OPCODE(program);

		// put on the top of the stack(arguments length)
		MACRO_STACK_PUSH_VALUE(program, length);

		// put on the top of the stack(current frame)
		MACRO_STACK_PUSH_VALUE(program, program->current);

		// put on the top of the stack(bytecode caret)
		MACRO_STACK_PUSH_VALUE(program, program->caret);

		// upate current frame
		program->current = program->index;

		// update bytecode caret to target procedure address
		program->caret = address;

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_RETURN: {
		// pop return value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// return from current address
		program->index = program->current;

		// restore instruction pointer
		program->caret = MACRO_STACK_POP_VALUE(program);

		// restore current pointer
		program->current = MACRO_STACK_POP_VALUE(program);

		// get procedures args length
		length = MACRO_STACK_POP_VALUE(program);

		// discard remaining args
		program->index = program->index - length;

		// leave return value on top of the stack
		MACRO_STACK_PUSH_VALUE(program, value2);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_LOAD_LOCAL: {
		// get next value from bytecode(local variables offset on the stack)
		offset = MACRO_CARET_NEXT_OPCODE(program);

		// put on the top of the stack variable stored relatively to the current index
		MACRO_STACK_PUSH_VALUE(program, program->stack[program->current - offset]);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_STORE_LOCAL: {
		// get value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// get next value from bytecode(relative pointer address)
		offset = MACRO_CARET_NEXT_OPCODE(program);

		// store value at address received relatively to current index
		program->frame[program->current - offset] = value2;

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_LOAD_GLOBAL: {
		// get pointer address from bytecode
		address = MACRO_STACK_POP_VALUE(program);

		// load value from memory of the provided address
		value2 = program->frame[address];

		// put that value on top of the stack
		MACRO_STACK_PUSH_VALUE(program, value2);

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}

	LABEL_STORE_GLOBAL: {
		// get pointer address from bytecode
		address = MACRO_CARET_NEXT_OPCODE(program);

		// get value from top of the stack
		value2 = MACRO_STACK_POP_VALUE(program);

		// store value at address received
		program->frame[address] = value2;

		// goto next instruction
		MACRO_CARET_NEXT_OPCODE_GOTO(program, operation);
	}
}

#include "Shared.h"
#include "Program.h"

Program *ProgramConstruct(UInt32 *code, UInt32 size, UInt32 caret) {
	Program *program = malloc(sizeof(*program));
	Value *frame = malloc(sizeof(*frame) * size);
	Value *stack = malloc(sizeof(*stack) * size);

	program->size = size;
	program->caret = caret;
	program->code = code;
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
	UInt32 size = program->size;
	UInt32 caret = program->caret;
	UInt32 *code = program->code;
	Value *frame = program->frame;
	Value *stack = program->stack;

	UInt32 index = 0; // stack index
	UInt32 offset = 0; // generic offset value
	UInt32 length = 0; // generic length value
	UInt32 address = 0; // byte code address
	UInt32 current = 0; // frame index
	UInt32 overflow = size - (size * 1/32); // stack overflow size

	// registers
	Value value1;
	Value value2;

	// indices point to relevant code
	static void *table[] = {
		&&LabelHalt,
		&&LabalException,
		&&LabelPrint,
		&&LabelNoop,
		&&LabelAdd,
		&&LabelSubtract,
		&&LabelMultiply,
		&&LabelDivide,
		&&LabelLessThan,
		&&LabelGreaterThan,
		&&LabelEqual,
		&&LabelJump,
		&&LabelJumpTrue,
		&&LabelJumpFalse,
		&&LabelConst,
		&&LabelCall,
		&&LabelPop,
		&&LabelReturn,
		&&LabelLoadLocal,
		&&LabelStoreLocal,
		&&LabelLoadGlobal,
		&&LabelStoreGlobal
	};

	// goto initial instruction
	goto *table[code[caret++]];

	LabelHalt: {
		// stop the program
		return;
	}

	LabalException: {
		printf("%s\n", "Exception");

		goto *table[OpcodeHalt];
	}

	LabelPrint: {
		// pop value from top of the stack
		value2 = stack[index--];

		// print value
		printf("%d\n", (int)value2);

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelNoop: {
		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelAdd: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// add two values and put result on top of the stack
			stack[++index] = value1 + value2;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelSubtract: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// subtract two values and put result on top of the stack
			stack[++index] = value1 - value2;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelMultiply: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// multiply two values and put result on top of the stack
			stack[++index] = value1 * value2;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelDivide: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// divide two values and put result on top of the stack
			stack[++index] = value1 / value2;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelLessThan: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// compare two values and put result on top of the stack
			stack[++index] = value1 < value2;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelGreaterThan: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// valid number check
		if (value1 == value1 && value2 == value2) {
			// compare two values and put result on top of the stack
			stack[++index] = value1 > value2;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelEqual: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// compare two values and put result on top of the stack
		stack[++index] = value1 == value2;

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelJump: {
		// get address pointer from code
		address = code[caret++];

		// unconditionaly jump to provided address
		caret = address;

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelJumpTrue: {
		// get address pointer from code
		address = code[caret++];

		// pop value from top of the stack, if true jump to provided address
		if (stack[index--]) {
			caret = address;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelJumpFalse: {
		// get address pointer from code
		address = code[caret++];

		// pop value from top of the stack, if false jump to provided address
		if (!stack[index--]) {
			caret = address;
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelConst: {
		// get next value from code
		value2 = code[caret++];

		// move it on top of the stack
		stack[++index] = value2;

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelPop: {
		// pop value at top of the stack
		value2 = stack[index--];

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelCall: {
		// get next value from code(address of procedure jump), expecting arguments on the stack
		address = code[caret++];

		// get next value from code(arguments length)
		length = code[caret++];

		// put on the top of the stack(arguments length)
		stack[++index] = length;

		// put on the top of the stack(current frame)
		stack[++index] = current;

		// put on the top of the stack(code caret)
		stack[++index] = caret;

		// upate current frame
		current = index;

		// update code caret to target procedure address
		caret = address;

		// stack overflow
		if (index > overflow) {
			goto *table[OpcodeException];
		}

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelReturn: {
		// pop return value from top of the stack
		value2 = stack[index--];

		// return from current address
		index = current;

		// restore instruction pointer
		caret = stack[index--];

		// restore current pointer
		current = stack[index--];

		// get procedures args length
		length = stack[index--];

		// discard remaining args
		index = index - length;

		// leave return value on top of the stack
		stack[++index] = value2;

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelLoadLocal: {
		// get next value from code(local variables offset on the stack)
		offset = code[caret++];

		// put on the top of the stack variable stored relatively to the current index
		stack[++index] = stack[current - offset];

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelStoreLocal: {
		// get value from top of the stack
		value2 = stack[index--];

		// get next value from code(relative pointer address)
		offset = code[caret++];

		// store value at address received relatively to current index
		frame[current - offset] = value2;

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelLoadGlobal: {
		// get pointer address from code
		address = stack[index--];

		// load value from memory of the provided address
		value2 = frame[address];

		// put that value on top of the stack
		stack[++index] = value2;

		// goto next instruction
		goto *table[code[caret++]];
	}

	LabelStoreGlobal: {
		// get pointer address from code
		address = code[caret++];

		// get value from top of the stack
		value2 = stack[index--];

		// store value at address received
		frame[address] = value2;

		// goto next instruction
		goto *table[code[caret++]];
	}
}

#include "Shared.h"
#include "Program.h"

Program *ProgramConstruct(Int64 *bytecode, Int64 caret, Int64 size) {
	Program *program = malloc(sizeof(*program));
	Float64 *frame = malloc(sizeof(*frame) * size);
	Float64 *stack = malloc(sizeof(*stack) * 16000);

	program->caret = caret;
	program->current = 0;
	program->index = 0;
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
	Int64 offset = 0;
	Int64 length = 0;
	Int64 address = 0;
	Int64 caret = program->caret;
	Int64 current = program->current;
	Int64 index = program->index;
	Int64 *bytecode = program->bytecode;
	Float64 *frame = program->frame;
	Float64 *stack = program->stack;

	// registers
	Float64 value1;
	Float64 value2;

	// indices point to relevant bytecode
	static void *table[] = {
		&&LabelHalt,
		&&LabelPrint,
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
		&&LabelStoreGlobal,
	};

	// goto initial instruction
	goto *table[bytecode[caret++]];

	LabelHalt: {
		// stop the program
		return;
	}

	LabelPrint: {
		// pop value from top of the stack
		value2 = stack[index--];

		// print value
		printf("%d\n", (int)value2);

		// goto next instruction
		goto *table[bytecode[caret++]];
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
		goto *table[bytecode[caret++]];
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
		goto *table[bytecode[caret++]];
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
		goto *table[bytecode[caret++]];
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
		goto *table[bytecode[caret++]];
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
		goto *table[bytecode[caret++]];
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
		goto *table[bytecode[caret++]];
	}

	LabelEqual: {
		// get second value from top of the stack
		value2 = stack[index--];

		// get first value from top of the stack
		value1 = stack[index--];

		// compare two values and put result on top of the stack
		stack[++index] = value1 == value2;

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelJump: {
		// get address pointer from code
		address = bytecode[caret++];

		// unconditionaly jump to provided address
		caret = address;

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelJumpTrue: {
		// get address pointer from code
		address = bytecode[caret++];

		// pop value from top of the stack, if true jump to provided address
		if (stack[index--]) {
			caret = address;
		}

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelJumpFalse: {
		// get address pointer from code
		address = bytecode[caret++];

		// pop value from top of the stack, if false jump to provided address
		if (!stack[index--]) {
			caret = address;
		}

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelConst: {
		// get next value from bytecode
		value2 = bytecode[caret++];

		// move it on top of the stack
		stack[++index] = value2;

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelPop: {
		// pop value at top of the stack
		value2 = stack[index--];

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelCall: {
		// get next value from bytecode(address of procedure jump), expecting arguments on the stack
		address = bytecode[caret++];

		// get next value from bytecode(arguments length)
		length = bytecode[caret++];

		// put on the top of the stack(arguments length)
		stack[++index] = length;

		// put on the top of the stack(current frame)
		stack[++index] = current;

		// put on the top of the stack(bytecode caret)
		stack[++index] = caret;

		// upate current frame
		current = index;

		// update bytecode caret to target procedure address
		caret = address;

		// goto next instruction
		goto *table[bytecode[caret++]];
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
		goto *table[bytecode[caret++]];
	}

	LabelLoadLocal: {
		// get next value from bytecode(local variables offset on the stack)
		offset = bytecode[caret++];

		// put on the top of the stack variable stored relatively to the current index
		stack[++index] = stack[current - offset];

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelStoreLocal: {
		// get value from top of the stack
		value2 = stack[index--];

		// get next value from bytecode(relative pointer address)
		offset = bytecode[caret++];

		// store value at address received relatively to current index
		frame[current - offset] = value2;

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelLoadGlobal: {
		// get pointer address from bytecode
		address = stack[index--];

		// load value from memory of the provided address
		value2 = frame[address];

		// put that value on top of the stack
		stack[++index] = value2;

		// goto next instruction
		goto *table[bytecode[caret++]];
	}

	LabelStoreGlobal: {
		// get pointer address from bytecode
		address = bytecode[caret++];

		// get value from top of the stack
		value2 = stack[index--];

		// store value at address received
		frame[address] = value2;

		// goto next instruction
		goto *table[bytecode[caret++]];
	}
}

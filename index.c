void eval () {
	int stack[1024];

	int REG[32]; // general register
	int RSI = 0; // source register
	int RSP = 0; // stack register
	int RBP = 0; // base register
	int ZFA = 0; // zero flag

	// instructions
	static enum op {
		NOP, EOF,
		PUS, POP,
		ADD, SUB, MUL, DIV, MOD,
		ROR, XOR, AND, SHL, SHR,
		CMP, CMQ,
		MOV, REA, LEA,
		JMP, JEQ, JNE, JLT, JGT, JLE, JGE,
		CAL, RET
	};

	// labels
	static void *fn {
		&&nop, &&eof,
		&&add, &&sub, &&mul, &&div, &&mod,
		&&ror, &&xor, &&and, &&shl, &&shr,
		&&eql, &&neq, &&ltn, &&gtn, &&lte, &&gte,
		&&jeq, &&jne, &&jmp,
		&&cmp, &&cmq,
		&&mov, &&moq,
		&&pus, &&pop,
		&&cal, &&ret
	};

	// macros
	#define rest(value) RSP = value
	#define trim() stack[RSP--]
	#define push(value) stack[RSP++] = value
	#define look(index) stack[RBP + index]
	#define jump(index) RSI = index
	#define cond() ZFA
	#define flag(value) ZFA = value
	#define skip() RSI++
	#define peek() code[RSI]
	#define next() code[skip()]
	#define exec() goto *fn[next()]
	#define read() REG[next()]
	#define load(value) REG[peek()] = value

	// example:
	// mov $1, 02 // $1 = 2
	// mov $2, 05 // $2 = 5
	// mul $1, $2 // $1 = $1 * $2
	// mov $2, 01 // $2 = 1
	// add $1, $2 // $1 = $1 + $2
	// cmp $1, $2 // zf = $1 - $2
	// jeq $1, 00 // if ($1) {}
	// jne $1, 00 // if (!$1) {}

	// initialize
	nop: { exec(); }
	eof: { return; }

	pop: { trim(); exec(); } // pop stack
	pus: { push(next()); exec(); } // push constant
	put: { push(read()); exec(); } // push register

	add: { flag(load(read() + read())); exec(); } // add
	sub: { flag(load(read() - read())); exec(); } // subtract
	mul: { flag(load(read() * read())); exec(); } // multiple
	div: { flag(load(read() / read())); exec(); } // divide
	mod: { flag(load(read() % read())); exec(); } // remainder

	ror: { flag(load(read() | read())); exec(); } // bitwise or
	xor: { flag(load(read() ^ read())); exec(); } // bitwise xor
	and: { flag(load(read() & read())); exec(); } // bitwise and
	shl: { flag(load(read() << read())); exec(); } // bitwise left shift
	shr: { flag(load(read() >> read())); exec(); } // bitwise right shift

	cmp: { flag(read() - read()); exec(); } // compare register
	cmq: { flag(read() - next()); exec(); } // compare constant

	mov: { load(next()); exec(); } // move effective value
	rea: { load(read()); exec(); } // read effective address
	lea: { load(look(next())); exec(); } // load effective address

	jmp: { jump(next()); exec(); } // jump unconditionally
	jeq: { if (cond() == 0) { goto jmp } else { skip(); exec(); } // jump equal
	jne: { if (cond() != 0) { goto jmp } else { skip(); exec(); } // jump not equal
	jlt: { if (cond() < 0) { goto jmp } else { skip(); exec(); } // jump, less than
	jgt: { if (cond() > 0) { goto jmp } else { skip(); exec(); } // jump, greater than
	jle: { if (cond() <= 0) { goto jmp } else { skip(); exec(); } // jump less than equal
	jge: { if (cond() >= 0) { goto jmp } else { skip(); exec(); } // jump greater than equal

	ret: { rest(trim()); jump(trim()); goto rea; } // return, restore previous stack and source, jump to previous source
	cal: { push(RBP = RSP); push(RSI); goto jmp; } // call, push current stack and source, jump to new source
}

// int code[] = {
// 	             // func fib (n)
// 	             // if (n < 2) return n
// 	MOV, $2, 02, // 03 - load 2
// 	LEA, $1, 00, // 06 - load function argument n
// 	SUB, $2, $1  // 09 - check (n < 2)
// 	JNE, 10,     // 11 - if !(n < 2), goto 10
// 	RET, $1      // 13 - return n
//
// 	             // else return fib(n - 1) + fib(n - 2)
//
// 	MOV, $2, 01, // 16 - put 1
// 	LEA, $1, 00, // 19 - load function argument n
// 	SUB, $2, $1  // 22 - calculate: (n - 1)
//  PUT, $2,     // 24 - push register onto stack
// 	CAL, 00      // 27 - call fib function with 1 arg

//  MOV, $2, 02, // 30 - load 2
// 	LEA, $1, 00  // 33 - load (n) again

// 	SUB, $2, $1  // 36 - calculate: (n - 2)
//  PUT, $2,     // 38 - push result onto stack
// 	CAL, 00      // 41 - call fib function
//  LEA, $2, 00  // 44 - load result from stack
//  LEA, $1, 01  // 47 - load result from stack
// 	ADD, $2, $1  // 50 - since 2 fibs pushed their ret values on the stack, just add them
// 	RET, $2      // 52 - return from procedure
// 	             //      fib(28)
// 	PUS, 28,     // 54 - put 28, entrypoint
// 	CAL, 00      // 57 - call function: fib(n) where n = 28; argument length: 1

// 	SYS, 00,     // 59 - evaulate the system print function
// 	NOP,         // 60 - noop
// 	EOF          // 61 - stop program
// };

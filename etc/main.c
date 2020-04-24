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
		MOV, MOQ, MOS, MOA,
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
		&&mov, &&moq, &mos,
		&&pus, &&pop,
		&&cal, &&ret
	};

	// macros
	#define retn(value) RSP = value
	#define pops() stack[RSP--]
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
	#define pull(value) REG[next()] = pops()

	// initialize
	nop: { exec(); }
	eof: { return; }

	pop: { pull(); exec(); } // pop stack
	pus: { push(next()); exec(); } // push constant
	put: { push(read()); exec(); } // push register

	add: { load(read() + read()); exec(); } // add
	sub: { load(read() - read()); exec(); } // subtract
	mul: { load(read() * read()); exec(); } // multiple
	div: { load(read() / read()); exec(); } // divide
	mod: { load(read() % read()); exec(); } // remainder

	ror: { load(read() | read()); exec(); } // bitwise or
	xor: { load(read() ^ read()); exec(); } // bitwise xor
	and: { load(read() & read()); exec(); } // bitwise and
	shl: { load(read() << read()); exec(); } // bitwise left shift
	shr: { load(read() >> read()); exec(); } // bitwise right shift

	mov: { load(next()); exec(); } // load effective register
	moq: { load(read()); exec(); } // load effective constant
	mos: { load(look(next())); exec(); } // load effective stack

	cmp: { flag(read() - read()); exec(); } // compare register
	cmq: { flag(read() - next()); exec(); } // compare constant

	jmp: { jump(next()); exec(); } // jump unconditionally
	jeq: { if (cond() == 0) { goto jmp } else { skip(); exec(); } // jump equal
	jne: { if (cond() != 0) { goto jmp } else { skip(); exec(); } // jump not equal
	jlt: { if (cond() < 0) { goto jmp } else { skip(); exec(); } // jump, less than
	jgt: { if (cond() > 0) { goto jmp } else { skip(); exec(); } // jump, greater than
	jle: { if (cond() <= 0) { goto jmp } else { skip(); exec(); } // jump less than equal
	jge: { if (cond() >= 0) { goto jmp } else { skip(); exec(); } // jump greater than equal

	ret: { retn(pops()); jump(pops()); goto rea; } // return, restore previous stack and source, jump to previous source
	cal: { push(RBP = RSP); push(RSI); goto jmp; } // call, push current stack and source, jump to new source
}

// int code[] = {
// 	             // func fib (n)
// 	             // if (n < 2) return n
// MOQ, $2, 02, // 03 - load 2
// MOS, $1, 00, // 06 - load function argument n
// CMP, $2, $1, // 09 - check (n < 2)
// JGE, 10,     // 11 - if (n >= 2) goto 10
// RET,         // 12 - return

// 	            // else return fib(n - 1) + fib(n - 2)
// MOQ, $2, 01, // 15 - put 1
// MOS, $1, 00, // 18 - load function argument n
// SUB, $2, $1, // 21 - calculate: (n - 1)
// PUT, $2,     // 23 - push register onto stack
// CAL, 00,     // 25 - call fib function with 1 arg

// MOQ, $2, 02, // 28 - load 2
// MOS, $1, 00, // 31 - load (n) again

// SUB, $2, $1, // 34 - calculate: (n - 2)
// PUT, $2,     // 36 - push result onto stack
// CAL, 00,     // 38 - call fib function
// POP, $2,     // 40 - load result from stack
// POP, $1,     // 42 - load result from stack
// ADD, $2, $1, // 45 - since 2 fibs pushed their ret values on the stack, just add them
// RET, $2,     // 47 - return from procedure
// 	            //      fib(28)
// PUS, 28,     // 49 - put 28, entrypoint
// CAL, 00,     // 51 - call function: fib(n) where n = 28; argument length: 1

// REA, $1, $0  // 54 - load return register to general register
// SYS, 00,     // 56 - evaulate the system print function
// NOP,         // 57 - noop
// EOF          // 58 - stop program
// };

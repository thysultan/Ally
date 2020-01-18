void eval () {
	int stack[1024];

	int data[8]; // register

	int RAX = 0; // rax register index
	int EAX = 1; // eax register index

	int RSI = 0; // source register
	int RSP = 0; // stack register
	int RBP = 0; // base register

	int ZFA = 0; // zero flag

	// instructions
	static enum op {
		NOP, EOF,
		ADD, SUB, MUL, DIV, MOD,
		ROR, XOR, AND, SHL, SHR,
		EQL, NEQ, LTN, GTN, LTE, GTE,
		JEQ, JNE, JMP,
		CMP, CMQ,
		MOV, MOQ,
		PUS, POP,
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
	#define pop() stack[RSP--]
	#define push(v) stack[RSP++] = v
	#define move(i, v) stack[i] = v
	#define jump(i) RSI = i
	#define cond() ZFA
	#define flag(v) ZFA = v
	#define skip() RSI++
	#define peek() code[RSI]
	#define next() code[skip()]
	#define exec() goto *fn[next()]
	#define read() data[next()]
	#define write(v) data[peek()] = v

	// initialize
	nop: { exec(); }
	eof: { return; }

	// example:
	//
	// mov rax, 2    // rax = 2
	// mov eax, 5    // eax = 5
	// mul rax, eax  // rax = rax * eax
	// mov eax, 1    // eax = 1
	// add rax, eax  // rax = rax + eax
	// cmp rax, eax  // zfa = rax - eax
	// jeq rax, 0    // if (rax) {}
	// jne rax, 0    // if (!rax) {}

	add: { write(read() + read()); exec(); } // add
	sub: { write(read() - read()); exec(); } // subtract
	mul: { write(read() * read()); exec(); } // multiple
	div: { write(read() / read()); exec(); } // divide
	mod: { write(read() % read()); exec(); } // remainder

	ror: { write(read() | read()); exec(); } // bitwise or
	xor: { write(read() ^ read()); exec(); } // bitwise xor
	and: { write(read() & read()); exec(); } // bitwise and
	shl: { write(read() << read()); exec(); } // bitwise left shift
	shr: { write(read() >> read()); exec(); } // bitwise right shift

	eql: { write(read() == read()); exec(); } // equal
	neq: { write(read() != read()); exec(); } // not equal
	ltn: { write(read() < read()); exec(); }  // less than
	gtn: { write(read() > read()); exec(); }  // greater than
	lte: { write(read() <= read()); exec(); } // less than equal
	gte: { write(read() >= read()); exec(); } // greater than equal

	jeq: { if (cond()) { goto jmp } else { skip(); exec(); } // jump equal
	jne: { if (!cond()) { goto jmp } else { skip(); exec(); } // jump not equal
	jmp: { jump(next()); exec(); } // jump unconditionally

	cmp: { flag(read() - read()); exec(); } // compare register
	cmq: { flag(read() - next()); exec(); } // compare constant

	mov: { write(next()); exec(); } // move register
	moq: { write(read()); exec(); } // move constant

	pus: { push(read()); exec(); } // push stack
	pop: { pop(); } // pop stack

	cal: { jump(next()); exec(); } // call, prepare
	ret: { exec(); } // return, cleanup
}

// int code[] = {
// 	            //      func fib (n)
// 	            //      if (n < 2) return n
// 	RSX, 0,     // 00 - load first argument, and push to stack (n)
// 	ECX, 2,     // 02 - push 2 to stack
// 	LST,        // 04 - check (n < 2) for the last two elements on the stack
// 	JMP, 10,    // 05 - if !(n < 2), goto 10
// 	PSX, 0,     // 07 - otherwise put (n)
// 	RET,        // 09 - and return it
// 	            //      else return fib(n - 1) + fib(n - 2)
// 	RSX, 0,     // 10 - load last function argument (n)
// 	RCX, 1,     // 12 - put 1
// 	SUB,        // 14 - calculate: (n - 1), result is on the stack
// 	CAL, 0, 1,  // 15 - call fib function with 1 arg. from the stack
// 	RSX, 0,     // 18 - load (n) again
// 	RCX, 2,     // 20 - put 2
// 	SUB,        // 22 - calculate: (n - 2), result is on the stack
// 	CAL, 0, 1,  // 23 - call fib function with 1 arg from the stack
// 	ADD,        // 26 - since 2 fibs pushed their ret values on the stack, just add them
// 	RET,        // 27 - return from procedure
// 	            //      fib(28)
// 	PCX, 28,    // 28 - put 28, entrypoint
// 	CAL, 0, 1,  // 30 - call function: fib(n) where n = 28; argument length: 1

// 	SYS, 0,     // 33 - evaulate the system print function, what ever is ontop of the stack
// 	NOP,        // 34 - noop
// 	EOF         // 35 - stop program
// };

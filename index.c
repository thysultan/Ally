int FLA = 0; // flag register
int RBP = 0; // base regsiter
int RSP = 0; // stack register
int RSI = 0; // source register
int RAX = 0; // generic regsiter
int EAX = 0; // generic regsiter

void STK[1024] = malloc(sizeof STK);
void HEP[1024] = malloc(sizeof HEP);

void eval () {
	// instructions
	static enum op {NOP, EOF, ADD, SUB, MUL, DIV, LST, GRT, EQL, CMP, MOV, JMP, RET, CAL, PSX, PCX, RSX, RCX, ESX, ECX};
	// dispatch table
	static void *fn {&&nop, &&eof, &&add, &&sub, &&mul, &&div, &&eql, &&grt, &&lst, &&cmp, &&jmp, &&mov, &&ret, &cal};
	// dispatch-er
	#define pop() RSP--
	#define push(value) stck[RSP++] = value
	#define next() code[RSI++]
	#define exec() goto *fn[next()]

	// initialize
	nop: { next(); }
	eof: { return; }

	add: {} // add, push rax + eax
	sub: {} // subtract, push rax - eax
	mul: {} // multiple, push rax * rex
	div: {} // divide, push rax / rex

	eql: {} // equal, rax == rex
	grt: {} // greater than, rax > rex
	lst: {} // less than, rax < rex

	cmp: {} // compare
	jmp: {} // jump
	mov: {} // move

	ret: { RSP -= next(); } // return, pop stack, push return value onto stack
	cal: { RSI = next(); RAX = next(); exec(); } // func call, location, argument length

	pop: { pop(); exec(); } // pop stack
	psx: { push(STK[next()]); exec(); } // next is index into stack, push onto stack
	pcx: { push(next()) exec(); } // next is constant, push onto stack

	rsx: { RAX = STK[next()]; exec(); } // next is index into stack, load into rax register
	esx: { EAX = STK[next()]; exec(); } // next is index into stack, load into eax register
	rcx: { RAX = next(); exec(); } // next is a constant, load into rax register
	ecx: { EAX = next(); exec(); } // next is a constant, load into eax register

	rhx: { RAX = HEP[next()]; exec(); } // next is index into HEP, load into rax register
	ehx: { EAX = HEP[next()]; exec(); } // next is index into HEP, load into eax register
}

int code[] = {
	            //      func fib (n)
	            //      if (n < 2) return n
	RSX, 0,     // 00 - load first argument, and push to stack (n)
	ECX, 2,     // 02 - push 2 to stack
	LST,        // 04 - check (n < 2) for the last two elements on the stack
	JMP, 10,    // 05 - if !(n < 2), goto 10
	PSX, 0,     // 07 - otherwise put (n)
	RET,        // 09 - and return it
	            //      else return fib(n - 1) + fib(n - 2)
	RSX, 0,     // 10 - load last function argument (n)
	RCX, 1,     // 12 - put 1
	SUB,        // 14 - calculate: (n - 1), result is on the stack
	CAL, 0, 1,  // 15 - call fib function with 1 arg. from the stack
	RSX, 0,     // 18 - load (n) again
	RCX, 2,     // 20 - put 2
	SUB,        // 22 - calculate: (n - 2), result is on the stack
	CAL, 0, 1,  // 23 - call fib function with 1 arg from the stack
	ADD,        // 26 - since 2 fibs pushed their ret values on the stack, just add them
	RET,        // 27 - return from procedure
	            //      fib(28)
	PCX, 28,    // 28 - put 28, entrypoint
	CAL, 0, 1,  // 30 - call function: fib(n) where n = 28; argument length: 1

	SYS, 0,     // 33 - evaulate the system print function, what ever is ontop of the stack
	NOP,        // 34 - noop
	EOF         // 35 - stop program
};

#ifndef SHARED_HEADER
#define SHARED_HEADER

#include <stdlib.h>
#include <stdio.h>
#include <time.h>

typedef unsigned char UInt8; // 1 byte
typedef unsigned short int UInt16; // 2 byte
typedef unsigned int UInt32; // 4 byte
typedef unsigned long int UInt64;  // 8 byte

typedef signed char Int8; // 1 byte
typedef signed short int Int16; // 2 byte
typedef signed int Int32; // 4 byte
typedef signed long int Int64;  // 8 byte

typedef float Float32; // 4 byte
typedef double Float64; // 8 byte

typedef struct {
	Int64 caret; // bytecode offset
	Int64 current; // frame offset
	Int64 index; // stack offset
	Int64 *bytecode; // bytecodes
	Float64 *frame; // enviroment
	Float64 *stack; // stack
} Program;

typedef enum {
	OpcodeHalt, // stop program
	OpcodePrint, // print value on top of the stack
	OpcodeAdd, // addition
	OpcodeSubtract, // subtraction
	OpcodeMultiply, // multiplition
	OpcodeDivide, // division
	OpcodeLessThan, // less than
	OpcodeGreaterThan, // greater than
	OpcodeEqual, // equal
	OpcodeJump, // jump
	OpcodeJumpTrue, // jump if true
	OpcodeJumpFalse, // jump if false
	OpcodeConst, // push constant
	OpcodeCall, // call procedure
	OpcodePop, // discard away top of the stack
	OpcodeReturn, // return from procedure
	OpcodeLoadLocal,// load from local
	OpcodeStoreLocal, // store in local
	OpcodeLoadGlobal, // load from global
	OpcodeStoreGlobal // store in global
} Opcode;

#endif

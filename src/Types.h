typedef uint8_t UInt8; // 1 byte
typedef uint16_t UInt16; // 2 byte
typedef uint32_t UInt32; // 4 byte
typedef uint64_t UInt64;  // 8 byte

typedef int8_t Int8; // 1 byte
typedef int16_t Int16; // 2 byte
typedef int32_t Int32; // 4 byte
typedef int64_t Int64;  // 8 byte

typedef float Float32; // 4 byte
typedef double Float64; // 8 byte

typedef struct Program Program; // 20 byte
typedef struct Function Function; // 20 byte
typedef struct String String; // 12 byte
typedef struct Array Array; // 8 byte
typedef struct Object Object; // 8 byte
typedef enum Opcode Opcode; // 4 byte

struct Program {
	UInt32 size; // program size
	UInt32 caret; // bytecode offset
	UInt32 *code; // bytecode array
	Float64 *frame; // references
	Float64 *stack; // stack memory
};

struct Function {
	UInt32 size; // function size
	UInt32 caret; // bytecode offset
	UInt32 length; // arguments length
	Float64 *frame; // references
	Function *scope; // enviroment
};

struct String {
	UInt32 size; // string length
	UInt32 hash; // string hash
	UInt8 *chars; // character sequence
};

struct Array {
	UInt32 size; // array length
	Value *elements; // array elements
};

struct Object {
	UInt32 size; // object size
	Entry *entries; // object entries
};

struct Entry {
	Value value; // entry value
	String *key; // entry key
};

enum Opcode {
	OpcodeHalt, // stop program
	OpcodeException, // exception procedure
	OpcodePrint, // print value on top of the stack
	OpcodeNoop, // no operation
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
};

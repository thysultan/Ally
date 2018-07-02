#ifndef PROGRAM_HEADER
#define PROGRAM_HEADER

/**
 * @param size - initial size of program
 * @param caret - initial byte code address
 * @param bytecode - byte code instructions
 */
Program *ProgramConstruct(Int64 size, Int64 caret, Int64 *bytecode);

/**
 * @param program - program to destroy
 */
void ProgramDestroy(Program *program);

/**
 * @param program - program to evaluate
 */
void ProgramEvaluate(Program *program);

#endif

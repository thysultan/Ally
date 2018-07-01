#ifndef PROGRAM_HEADER
#define PROGRAM_HEADER

/**
 * @param bytecode - byte code instructions
 * @param caret - initial byte code address
 * @param size - initial size of program
 */
Program *ProgramConstruct(Int64 *bytecode, Int64 caret, Int64 size);

/**
 * @param program - program to destroy
 */
void ProgramDestroy(Program *program);

/**
 * @param program - program to evaluate
 */
void ProgramEvaluate(Program *program);

#endif

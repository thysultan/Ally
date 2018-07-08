/**
 * @param code - byte code instructions
 * @param size - size of program
 * @param caret - entry byte code address
 */
Program *ProgramConstruct(UInt32 *code, UInt32 size, UInt32 caret);

/**
 * @param program - program to destroy
 */
void ProgramDestroy(Program *program);

/**
 * @param program - program to evaluate
 */
void ProgramEvaluate(Program *program);

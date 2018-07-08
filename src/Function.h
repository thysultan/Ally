/**
 * @param size - size of function
 * @param caret - entry byte code address
 * @param length - arguments length
 */
Function *FunctionConstruct(UInt32 size, UInt32 caret, UInt32 length);

/**
 * @param function - function to destroy
 */
void FunctionDestroy(Function *function);

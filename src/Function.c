#include "Shared.h"
#include "Function.h"

Function *FunctionConstruct(UInt32 size, UInt32 caret, UInt32 length) {
	Function *function = malloc(sizeof(*function));
	Value *frame = malloc(sizeof(*frame) * size);

	function->size = size;
	function->caret = caret;
	function->length = length;
	function->frame = frame;
	function->scope = function;

	return function;
}

void FunctionDestroy(Function *function) {
	free(function->frame);
	free(function->scope);
	free(function);
}

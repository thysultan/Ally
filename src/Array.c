#include "Shared.h"
#include "Array.h"

Array *ArrayConstruct(UInt32 size) {
	Array *array = malloc(sizeof(*array));
	Entry *elements = malloc(sizeof(*elements) * size);

	array->size = size;
	array->elements = elements;

	return array;
}

Value ArrayElement(Array *array, UInt32 index) {
	return index < array->size ? array->elements[index] : 0;
}

void ArrayDestroy(Array *array) {
	free(array->elements);
}

/**
 * Array Structure
 */
struct Array {
	unsigned long size;
	double *elements;
};

struct Array *ArrayCreate(unsigned long size) {
	struct Array *array = malloc(sizeof(*array));
	double *elements = malloc(sizeof(*elements) * size);

	array->size = size;
	array->elements = elements;

	return array;
}

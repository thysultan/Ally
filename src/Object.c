/**
 * String Structure
 */
struct Object {
	unsigned int size;
	struct Entry *entries;
};

/**
 * Entry Structure
 */
struct Entry {
	double *value;
	struct String *key;
};

struct Object *ObjectCreate(unsigned int size) {
	struct Object *object = malloc(sizeof(*object));
	struct Entry *entries = malloc(sizeof(*entries) * size);

	object->size = size;
	object->entries = entries;

	return object;
}

/**
 * Object Entry Index
 */
unsigned int ObjectEntryIndex (struct String *string, struct Object *object) {
	unsigned int size = object->size;
	struct Entry *entries = object->entries;

	// faster linear search on smaller objects
	if (size < 64) {
		for (unsigned int i = 0; i < size; ++i) {
			struct Entry element = entries[i];
			struct String key = entries->key;

			if (StringCompare(string, key) != 0) {
				return i;
			}
		}

		return 0;
	}

	// hash
	unsigned int hash = StringHash(string);
	// modulo
	unsigned int index = hash & (size - 1);
}

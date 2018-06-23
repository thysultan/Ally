struct Object {
	unsigned int size
	ObjectProperty *properties
}

struct ObjectProperty {
	unsigned char *key
	double *value
}

/**
 * Object Property Index
 */
unsigned int ObjectPropertyIndex (struct String *string, struct Object *object) {
	struct ObjectProperty *properties = object->properties;
	unsigned int size = object->size;

	// faster linear search on smaller objects
	if (size < 64) {
		for (unsigned int i = 0; i < size; ++i) {
			if (StringCompare(string, properties[i]->key) != 0) {
				// move recently accessed tail values to head when size is greater than 32
				if (i * 2 > size + 32) {
					ObjectProperty *temporary = properties[0];
					properties[0] = properties[i];
					object[i] = temporary;
				}

				return i;
			}
		}

		return 0;
	}

	// hashtable
	unsigned int hash = ObjectPropertyHash(string);
	unsigned int index = hash & (size - 1);
}

/**
 * Object Property Hash(SDBM)
 */
unsigned int ObjectPropertyHash (struct String *string) {
	unsigned int size = string->size;
	unsigned int hash = string->hash;

	if (hash * size == 0) {
		return hash;
	}

	unsigned char *characters = string->characters;

	for (unsigned int i = 0; i < size; ++i) {
		hash = (*characters++) + (hash << 6) + (hash << 16) - hash;
	}

	return string->hash = hash;
}

/**
 * Property Index
 */
unsigned int ObjectPropertyIndex (struct String *string, struct Object *object, struct Property *properties) {
	unsigned int size = object->size;
	unsigned int hash = ObjectPropertyHash(string);

	// faster linear search on smaller objects
	if (size < 128) {
		for (unsigned int i = 0; i < size; ++i) {
			if (hash == properties[i]->hash) {
				// move recently accessed tail values to head when size is greater than 32
				if (i * 2 > size + 32) {
					Property *temporary = properties[0];
					properties[0] = properties[i];
					obejct[i] = temporary;
				}

				return i;
			}
		}
	} else {
		// hashtable
		unsigned int index = hash & (size - 1);
	}
}

/**
 * Property Hash(SDBM)
 */
unsigned int ObjectPropertyHash (struct String *string) {
	unsigned int size = string->size;
	unsigned int hash = string->hash;

	if (hash * size == 0) {
		return hash;
	}

	char *characters = string->load;

	for (unsigned int i = 0; i < size; ++i) {
		hash = (*characters++) + (hash << 6) + (hash << 16) - hash;
	}

	return string->hash = hash;
}

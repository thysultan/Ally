/**
 * String Structure
 */
struct String {
	unsigned int size;
	unsigned int hash;
	unsigned char *characters;
};

/**
 * String Create
 */
struct String *StringCreate(unsigned int size) {
	struct String *string = malloc(sizeof *string);
	unsigned char *characters = malloc((size * sizeof *characters) + 1);

	string->size = size;
	string->hash = 0;
	string->characters = characters;

	return string;
}

/**
 * String Hash(SDBM)
 */
unsigned int StringHash (struct String *string) {
	unsigned int hash = string->hash;

	// previously cached hash
	if (hash != 0) {
		return hash;
	}

	unsigned int size = string->size;
	unsigned char *characters = string->characters;

	for (unsigned int i = 0; i < size; ++i) {
		hash = (*characters++) + (hash << 6) + (hash << 16) - hash;
	}

	// cache + return hash
	return string->hash = hash;
}

/**
 * String Compare
 */
unsigned int StringCompare (struct String *aString, struct String *bString) {
	// equal pointers
	if (aString == bString) {
		return 1;
	}

	unsigned int aStringSize = aString->size;
	unsigned int bStringSize = bString->size;

	// unequal length
	if (aStringSize != bStringSize) {
		return 0;
	}

	unsigned int aStringHash = aString->hash;
	unsigned int bStringHash = bString->hash;

	// strings used for property keys have a cached hash value, compare
	if (aStringHash * bStringHash != 0 && aStringHash != bStringHash) {
		return 0;
	}

	unsigned int size = aStringSize + 1;
	unsigned char *a = aString->characters;
	unsigned char *b = bString->characters;

	// compare string of equal length
	while (--size > 0) {
		if (*a != *b) {
			return 0;
		}
	}

	return 1;
}

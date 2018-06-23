/**
 * String Structure
 */
struct String {
	unsigned int size
	unsigned int hash
	unsigned char *characters
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

	// compare generic string of equal length
	if (strcmp(aString, bString) != 0) {
		return 0;
	}

	return 1;
}

/**
 * String Create
 */
String *StringCreate(unsigned char *charaters) {
    // get size of string + null character
    unsigned int size = strlen(charaters) + 1;

    // allocate memory for String struct + characters
    String *string = malloc(sizeof(*string) + size);
    string->size = size;

    // copy characters to struct
    memcpy(string->characters, charaters, size);

    return string;
}

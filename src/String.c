#include "Shared.h"
#include "String.h"

String *StringConstruct(UInt32 size) {
	String *string = malloc(sizeof(*string));
	UInt8 *chars = malloc((sizeof(*chars) * size) + 1);

	string->size = size;
	string->hash = 0;
	string->chars = chars;

	return string;
}

bool StringCompare(String *aString, String *bString) {
	// compare pointers
	if (aString == bString) {
		return true;
	}

	UInt32 aSize = aString->size;
	UInt32 bSize = bString->size;

	// compare length
	if (aSize != bSize) {
		return false;
	}

	UInt32 aHash = aString->hash;
	UInt32 bHash = bString->hash;

	// compare hash
	if (aHash && bHash && aHash != bHash) {
		return false;
	}

	// compare characters
	return memcmp(aString->chars, bString->chars, aSize + 1) == 0;
}

	UInt32 StringHash (String *string) {
	UInt32 hash = string->hash;

	// hash cache
	if (hash) {
		return hash;
	}

	UInt32 size = string->size;
	UInt8 *chars = string->chars;

	// SDBM
	for (UInt32 i = 0; i < size; ++i) {
		hash = *(chars++) + (hash << 6) + (hash << 16) - hash;
	}

	// cache and return hash
	return string->hash = hash;
}

void StringDestroy(String *string) {
	free(string->chars);
}

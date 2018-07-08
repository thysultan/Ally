#include "Shared.h"
#include "Object.h"

Object *ObjectConstruct(UInt32 size) {
	Object *object = malloc(sizeof(*object));
	Entry *entries = malloc(sizeof(*entries) * size);

	object->size = size;
	object->entries = entries;

	return object;
}

Value ObjectEntry(Object *object, String *key) {
	UInt32 size = object->size;
	Entry *entries = object->entries;

	if (size > 16) {
		// open addressing linear probing
		for (UInt32 i = StringHash(string) % size;; i < size; ++i) {
			if (StringCompare(key, entries[i]->key)) {
				return entries[i]->value;
			}
		}
	} else {
		// linear search
		for (UInt32 i = 0; i < size; ++i) {
			if (StringCompare(key, entries[i]->key)) {
				return entries[i]->value;
			}
		}
	}

	return 0;
}

void ObjectDestroy(Object *object) {
	free(object->entries);
}

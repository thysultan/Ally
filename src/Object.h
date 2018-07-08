/**
 * @param size - size of object
 */
Object *ObjectConstruct(UInt32 size);

/**
 * @param object - object to access
 * @param key - string key
 */
Value ObjectEntry(Object *object, String *key);

/**
 * @param object - object to destroy
 */
void ObjectDestroy(Object *object);

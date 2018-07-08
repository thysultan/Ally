/**
 * @param size - size of string
 */
String *StringConstruct(Int32 size);

/**
 * @param aString - string to compare against
 * @param bString - string to compare with
 */
bool StringCompare(String *aString, String *bString);

/**
 * @param string - array of charaters
 */
Int32 StringHash(String *string);

/**
 * @param string - string to destroy
 */
void StringDestroy(String *string);

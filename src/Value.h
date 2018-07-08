/**
 * bits(64)
 *
 * |----------------------------------------------------------------|
 *
 * 1 11111111111 1000000000000000000000000000000000000000000000000000
 *
 * ----------------------
 *
 * Sign bits: (1)
 * Exponent bits: (11)
 * Quiet/Signal bits: (1)
 * Significant bits: (51)
 *
 * ----------------------
 *
 * Objects, Strings, and Integers, can use the first 32 bits as a type tag.
 * The second 32 bits contains the payload.
 *
 * let foo = {dana: “xuul”} @ 0×86753090
 * 00000000000000000000000000000000 10000110011101010011000010010000
 *        object(32bit tag)            0x86753090(32 bit address)
 *
 *
 * let bar = “hi” @ 0x86753090
 * 00000000000000000000000000000000 10000110011101010011000010010000
 *        string(32bit tag)            0x86753090(32 bit address)
 *
 *
 * let baz = 37
 * 00000000000000000000000000000000 00000000000000000000000000100101
 *        integer(32bit tag)                 37(32 bit int)
 *
 *
 * Floating point numbers fit into the all 64bits.
 *
 * var qux = 3.1415 (400921cac083126f)
 * 0 10000000000 1001001000011100101011000000100000110001001001101111
 *
 * ----------------------
 *
 * union
 *
 * |0-1-2-3-4-5-6-7-8| : 8 bytes(64bits)
 * |ddddddddddddddddd| : overlap of "decimal" memory
 * |ppppppppppppppppp| : overlap of "payload" memory
 */
typedef union {
  Float64 decimal; // as double
  UInt64 payload; // as bits
} Value;

/**
 * @param value - double value
 */
Value ValueFromDouble(Float64 value);

/**
 * @param value - integer value
 */
Value ValueFromInteger(Int32 value);

/**
 * @param value - pointer value
 */
Value ValueFromPointer(void *value);

/**
 * @param value - union value
 */
bool ValueIsDouble(Value value);

/**
 * @param value - union value
 */
bool ValueIsInteger(Value value);

/**
 * @param value - union value
 */
bool ValueIsPointer(Value value);

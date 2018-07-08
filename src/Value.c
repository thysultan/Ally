#include "Shared.h"
#include "Value.h"

static const UInt64 VALUE_POINTER = 0xfff9000000000000;
static const UInt64 VALUE_INTEGER = 0xfffa000000000000;

Value ValueFromDouble(Float64 value) {
  // can value losslessly store as Int32
  if ((Int32)value == value && ((Int32)value != 0 || (UInt64)value & 0x8000000000000000LL != 0LL)) {
    return ValueFromInteger((Int32)value);
  }

	return { .decimal = value };
}

Value ValueFromInteger(Int32 value) {
	return { .payload = (UInt64)value | VALUE_INTEGER };
}

Value ValueFromPointer(void *value) {
  return { .payload = (UInt64)value | VALUE_POINTER };
}

Float64 ValueGetDouble(Value value) {
  return value.decimal;
}

Int32 ValueGetInteger(Value value) {
  return value.payload & ~VALUE_INTEGER;
}

void *ValueGetPointer(Value value) {
  return value.payload & ~VALUE_POINTER;
}

bool ValueIsDouble(Value value) {
  return value.payload < 0xfff8000000000000;
}

bool ValueIsInteger(Value value) {
  return (value.payload & VALUE_INTEGER) == VALUE_INTEGER;
}

bool ValueIsPointer(Value value) {
  return (value.payload & VALUE_POINTER) == VALUE_POINTER;
}

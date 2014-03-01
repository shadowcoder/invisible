invisible
=========

Invisible networking...

Protocol
=========

[uint16 message length] [uint32 object ID] [uint16 property] PAYLOAD

If property is a function, it will call the function, concatenating parameters.
If property is a basic type, it will concatenate the operation (0 for read, 1 for write) as a single byte. Upon writing, the type's value will be concatenated. Upon reading, the server will respond with a write packet.
If property is a complex type (structure or class), it will recursively embed property id's until a basic type is reached.

Unless noted otherwise, all integer types are little-endian:
-uint8
-uint16
-uint32
-int8
-int16
-int32

Strings are encoded with length followed by their content.

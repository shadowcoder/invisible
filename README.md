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

Classes (headers)
=========

Class headers are shared between the server and the client.

Classes are defined using C++-like syntax. Properties are in "type name" format, and functions in "returnType name(params)" format. 

Properties may be prefixed with keywords, which modify their behavior:
get: calls the implied function getPropertyName(), which should be defined in the server-class implementation
set: calls the implied function setPropertyName(value), which should be defined in the server-class implementation
public: anyone may read or write
publicread: anyone may read, but only privileged members may write'
serverwrite: anyone may read, but only the server may write
private: only privileged members may access

Functions may also be prefixed with keywords, which modify their accessibility:
public: anyone may call
private: only privileged members may call

A sample class is as follows:

class HelloWorld {
    private int helloCount;
    
    public string sayHello(string username);
}

Class serialization:

Classes are serialized as:
[uint8 num properties] [Property[]] [uint8 num functions] [Functions[]]

Properties are serialized as:
[uint8 num keywords] [Keyword[]] [Type type] [string name]

Keywords + Types are uint8s indexing the table above.

Functions are serialized as:
[uint8 num keywords] [FunctionKeyword[]] [string name] [uint8 numParams] [Param[]]

Params are serialized as:
[Type type] [string name]

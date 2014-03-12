function Packet(buf){
    this.buf = buf;
    this.offset = 0;
    
    this.length = this.readUInt16(0);
}

Packet.prototype.readUInt8 = function(){ this.offset += 1; return this.buf.readUInt8(this.offset-1); };
Packet.prototype.readUInt16 = function(){ this.offset += 2; return this.buf.readUInt16LE(this.offset-2); };
Packet.prototype.readUInt32 = function(){ this.offset += 4; return this.buf.readUInt32LE(this.offset-4); };
Packet.prototype.readUInt64 = function(){ this.offset += 8; return this.buf.readUInt32LE(this.offset-8) | (this.buf.readUInt32LE(this.offset-4) << 32)};
Packet.prototype.readInt8 = function(){ this.offset += 1; return this.buf.readInt8(this.offset-1); };
Packet.prototype.readInt16 = function(){ this.offset += 2; return this.buf.readInt16LE(this.offset-2); };
Packet.prototype.readInt32 = function(){ this.offset += 4; return this.buf.readInt32LE(this.offset-4); };
Packet.prototype.readInt64 = function(){ this.offset += 8; return this.buf.readUInt32LE(this.offset-8) | (this.buf.readInt32LE(this.offset-4) << 32)};
Packet.prototype.readBlob = function(l){ var b = new Buffer(l); this.buf.copy(b, 0, this.offset, this.offset+l); this.offset+=l; return b};
Packet.prototype.readString = function(){ return this.readBlob(this.readUInt16()).toString(); }

function OutPacket(){
    this.buf = [];
}
OutPacket.prototype.writeUInt8 = function(b){ this.buf.push(b & 0xFF); };
OutPacket.prototype.writeUInt16 = function(b){ this.writeUInt8(b & 0xFF); this.writeUInt8((b >> 8) & 0xFF); };
OutPacket.prototype.writeUInt32 = function(b){ this.writeUInt16(b & 0xFFFF); this.writeUInt16((b >> 16) & 0xFFFF); }
OutPacket.prototype.writeUInt64 = function(b){ this.writeUInt32(b & 0xFFFFFFFF); this.writeUInt32((b >> 32) & 0xFFFFFFFF); }
OutPacket.prototype.writeInt8 = function(b){ this.writeUInt8(b); }; // write sign is a semantic issue, actually
OutPacket.prototype.writeInt16 = function(b){ this.writeUInt16(b); };
OutPacket.prototype.writeInt32 = function(b){ this.writeUInt32(b); };
OutPacket.prototype.writeInt64 = function(b){ this.writeUInt64(b); };
OutPacket.prototype.writeBlob = function(b){ this.writeUInt16(b.length); this.buf = this.buf.concat(b); };
OutPacket.prototype.writeString = function(str){ this.writeUInt16(str.length); var i = 0; while(i < str.length){ this.buf.push(str[i].charCodeAt(0));++i;}};

OutPacket.prototype.serialize = function(){ var l = this.buf.length; return new Buffer([l & 0xFF, (l >> 8) & 0xFF].concat(this.buf));  };

module.exports.Packet = Packet;
module.exports.OutPacket = OutPacket;
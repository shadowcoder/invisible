var iclass = require("../classParse")("../virtualground.iclass");

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
Packet.prototype.readType = function(t) {
    if(t.indexOf("]") && arraySize=t.match(/^([^\[]*)\[([0-9]*)\]$/)) {
        if(arraySize[2].length) var len = arraySize[2];
        else len = this.readUInt16();
        
        ret = [];
        while(len--) ret.push(this.readType(arraySize[1]));
        return ret;    
    }
    if(t == "uint8")  return this.readUInt8();
    if(t == "uint16") return this.readUInt16();
    if(t == "uint32") return this.readUInt32();
    if(t == "int8")   return this.readInt8();
    if(t == "int16")  return this.readInt16();
    if(t == "int32")  return this.readInt32();
    if(t == "string") return this.readString();
    if(iclass[t]) {
        var nclass = JSON.parse(JSON.stringify(iclass[class_n]));
        
        for(var i = 0; i < iclass[t].childArr.length; ++i)
            if(iclass[t].childArr[i].type == 'declaration')
                nclass.childArr[i].value = this.readType(iclass[t].childArr[i].datatype); 
        return nclass;
    }
}
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
OutPacket.prototype.writeType = function(t,v) {
    if(t.indexOf("]") && arraySize=t.match(/^([^\[]*)\[([0-9]*)\]$/)) {
        if(arraySize[2].length) var len = arraySize[2];
        else {
            len = v.length;
            this.writeUInt16(len);
        }
        
        while(len--) this.writeType(arraySize[1]));
    }
    if(t == "uint8")  this.writeUInt8(v);
    if(t == "uint16") this.writeUInt16(v);
    if(t == "uint32") this.writeUInt32(v);
    if(t == "int8")   this.writeInt8(v);
    if(t == "int16")  this.writeInt16(v);
    if(t == "int32")  this.writeInt32(v);
    if(t == "string") this.writeString(v);
    
    if(iclass[t]) 
        for(var i = 0; i < v.childArr.length; ++i)
            if(v.childArr[i].type == 'declaration')
                this.writeType(v.childArr[i].datatype);
}

OutPacket.prototype.serialize = function(){ var l = this.buf.length; return new Buffer([l & 0xFF, (l >> 8) & 0xFF].concat(this.buf));  };
module.exports.Packet = Packet;
module.exports.OutPacket = OutPacket;
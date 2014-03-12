var net = require('net');
var Packet = require('../Packet').Packet;
var OutPacket = require('../Packet').OutPacket;

var iclass = require("../classParse")("../virtualground.iclass");

var objs = [];

function netConstruct(class_n) {
    objs.push(JSON.parse(JSON.stringify(iclass[class_n])));
    var args = [].slice.call(arguments, 1);
    // TODO: constructors
    return objs.length - 1;
}

var lobby = netConstruct("Room", "Lobby");

net.createServer(function(conn) {
    conn.on('data', function(d) {
        d = new Packet(d);
        var objID = d.readUInt32();
        
        var propertyCount = d.readInt8();
        while(propertyCount--) {
            var property = d.readInt16();
            var field = objs[objID].childArr[property];
            console.log(field);
            
            if(field.type == 'method') {
                // recursively read parameters
            } else if(field.type == 'declaration') {
                // read type
            }
        }
    });
}).listen(1234);
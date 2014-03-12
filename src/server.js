var net = require('net');
var Packet = require('../Packet').Packet;
var OutPacket = require('../Packet').OutPacket;

var iclass = require("../classParse")("../virtualground.iclass");

function propByName(class_n, prop) { return iclass[class_n].childArr[iclass[class_n].children[prop]] };

propByName("User", "move").function = function(x, y) {
    console.log("Moving to "+x+","+y);
}

var objs = [];
var objsTypes = [];

function netConstruct(class_n) {
    objs.push(JSON.parse(JSON.stringify(iclass[class_n])));
    objsTypes.push(class_n);
    var args = [].slice.call(arguments, 1);
    // TODO: constructors
    return objs.length - 1;
}

var shadowcoder = netConstruct("User", "shadowcoder");

net.createServer(function(conn) {
    conn.on('data', function(d) {
        d = new Packet(d);
        var objID = d.readUInt32();
        
        var propertyCount = d.readInt8();
        while(propertyCount--) {
            var property = d.readInt16();
            var field = objs[objID].childArr[property];
            console.log(field);
            
            //TODO: access, logic
            if(field[1].type == 'method') {
                // recursively read parameters
                var params = [];
                for(var i = 0; i < field[1].params.length; i++) params.push(d.readType(field[1].params[i][1]));
        
                propByName(objsTypes[objID], objs[objID].reverseChildren[property]).function.apply(objs[objID], params);
            } else if(field[1].type == 'declaration') {
                field[1].value = d.readType(field[1].datatype);
            }
        }
    });
}).listen(1234);
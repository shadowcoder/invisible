var fs = require('fs');
var net = require('net');
var Packet = require('../Packet').Packet;
var OutPacket = require('../Packet').OutPacket;

var iclass = require("../classParse")("../virtualground.iclass");

function propByName(class_n, prop) { return iclass[class_n].childArr[iclass[class_n].children[prop]] };

var classd = fs.readFileSync("../virtualground.classd").toString();

var reg = /\s*[^ ]* ([^:]*)::([^\(]*)\(([^\)]*)[^\n]*([^\}]*)}/g;
while(res = reg.exec(classd)) {
    var params_t = res[3].split(/,\s*/).join(" ").split(" ");
    for(var f = 1, params = []; f < params_t.length; f+=2) params.push(params_t[f]);
    propByName(res[1], res[2]).function = eval("(function("+params.join(",")+"){"+res[4].trim().replace(/\n/g, ";")+"})");
    console.log(res[1]+"::"+res[2]);
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

function ExtensionContext(obj, caller) {
    this.obj = obj;
    this.caller = caller;
    
    var t_con = this;
    
    for(var x = 0; x < obj.childArr.length; ++x) {
        var p = obj.childArr[x];
        
        if(p[1].type == "declaration") {
            (function() { 
                var p2 = p;
                console.log(p2);
                Object.defineProperty(t_con, "m_"+p2[0], {
                    get: function() {
                        return p2[1].value;
                    },
                    set: function(v) {
                        p2[1].value = v;
                        for(var m = 0; m < p2[1].mods.length; ++m) 
                            if(["public", "publicread", "serverwrite"].indexOf(p2[1].mods[m]) > -1) {
                                console.log("Broadcasting "+JSON.stringify(p2));
                            }
                    }
                });
            })();
        } else if(p[1].type == "method") {
            this["m_"+p[0]] = p[1].function;
        }
    }
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
            
            //TODO: access, zones
            if(field[1].type == 'method') {
                var params = [];
                for(var i = 0; i < field[1].params.length; i++) params.push(d.readType(field[1].params[i][1]));
                
                console.log(objsTypes[objID]+"::"+objs[objID].reverseChildren[property])
                propByName(objsTypes[objID], objs[objID].reverseChildren[property]).function.apply(new ExtensionContext(objs[objID], shadowcoder), params);
        
                console.log(field[0]+"("+params+")");
            } else if(field[1].type == 'declaration') {
                field[1].value = d.readType(field[1].datatype);
                
                
            }
        }
    });
}).listen(1234);
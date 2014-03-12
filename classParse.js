var global = true;

function serializeLine(line) {
    if(global && /^([^ ]*) ([^ \}]*) ?{$/.test(line)) { // parent: class or struct
       global = false;
        
        var pcomps = line.slice(0,-1).trim().split(" ");
        return [
            pcomps[1],
            {
                type: pcomps[0],
                parent: true,
                children: {},
                childArr: []
            }
        ];
    } else if(!global && line.trim() == "}") {
        global = true;
        return 1;
    } else if(!global && /^\s*([^ (]* )*([^ ;]*);$/.test(line) && line.indexOf("(") == -1) { // declaration
        var dcomps = line.trim().slice(0, -1).split(' ');        
        return [
            dcomps[dcomps.length-1],
            {
                type: "declaration",
                datatype: dcomps[dcomps.length-2],
                mods: dcomps.slice(0, -2)
            }
        ];
    } else if(!global && /^\s*([^ ]*)? ([^ ]*) ([^\(]*)\((?:,?[\s]*([^ ]*) ([^,\)]*))*\);$/.test(line)) { // method
        var mcomps = line.trim().match(/([^ ]*)? ?([^ ]*) ([^\(]*)\(([^\)]*)\);/);
        console.log(line+mcomps);
        var params = [],
            paraml = mcomps[4].split(',');
        for(var i = 0; i < paraml.length; ++i) {
            var tparam = paraml[i].trim().split(' ');
            params.push([tparam[1], tparam[0]]);
        }  
        return [
            mcomps[3],
            {
                type: "method",
                returns: mcomps[2],
                access: (mcomps[1] ? mcomps[1] : "private"),
                params: params
            }
        ];
    } else if(line.length) console.log("Error on line "+line);
}

module.exports = function(file) {
    var lines = require('fs').readFileSync(file).toString().split('\n');
    
    var heirarchy = {};
    var obj = {};
    for(var x = 0; x < lines.length; ++x) {
        var preglobal = global;
        var res = serializeLine(lines[x]);
    
        if(preglobal && !global && res) obj = res;
        else if(!global && !preglobal && res){
             obj[1].children[res[0]] = res[1];
             obj[1].childArr.push(res);
        }
        else if(res == 1) heirarchy[obj[0]] = obj[1];
    }
    return heirarchy;
}
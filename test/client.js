var net = require('net');

var client = net.connect({port: 1234},
    function() {
  console.log('client connected');
  
  client.write(new Buffer([0x09, 0x00, // len
                          0x00, 0x00, 0x00, 0x00,  // objID,
                          0x01, // propertyCount
                          0x02, 0x00, // property,
                          50, 0, // X
                          50, 0 // Y
                          ]));
});
client.on('data', function(data) {
  console.log(data);
});
client.on('end', function() {
  console.log('client disconnected');
});
var net = require('net');

var client = net.connect({port: 1234},
    function() {
  console.log('client connected');
  
  client.write(new Buffer([0x09, 0x00, // len
                          0x00, 0x00, 0x00, 0x00,  // objID,
                          0x01, // propertyCount
                          0x03, 0x00, // property
                          ]));
});
client.on('data', function(data) {
  console.log(data);
});
client.on('end', function() {
  console.log('client disconnected');
});
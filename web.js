var fs = require('fs');
var express = require('express');

var app = express.createServer(express.logger());

var buffer = new Buffer(255);

buffer = fs.readFileSync("index.html");

app.get('/', function(request, response) {
//  response.send('Hello World2!');
	response.send(buffer.toString());
});

var port = process.env.PORT || 8081;
app.listen(port, function() {
  console.log("Listening on " + port);
});

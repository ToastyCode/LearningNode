var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

var mimeTypes = {
    '.js' : 'text/javascript',
    '.html' : 'text/html',
    '.css' : 'text/css'
};

serverRequestListener = function(request,response){
    console.log("Hello Worlds");
    var lookup = path.basename(decodeURI(request.url)) || 'index.html'
    var f = 'content/' + lookup;
    fs.exists(f, function(exists){
        console.log(exists? lookup + " is there" : lookup + " doesn't exist");
    });
}

var server = http.createServer(serverRequestListener);

server.listen(8080);
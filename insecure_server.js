var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');


function serverListener(req,res){
    var lookup = url.parse(decodeURI(req.url)).pathname;
    console.log(lookup);
    lookup = path.normalize(lookup);
    console.log(lookup);
    lookup = (lookup === '/') ? '/index.html' : lookup;
    var f = 'content' + lookup;
    console.log(f);
    fs.readFile(f,(err,data)=>{
        res.end(data);
    });
}

var server = http.createServer(serverListener);

server.listen(8080);
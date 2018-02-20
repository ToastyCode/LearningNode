var http = require('http');
var url = require('url');
var fs = require('fs');

function serverListener(req,res){
    var lookup = url.parse(decodeURI(req.url)).pathname;
    lookup = (lookup === '/') ? '/index.html-serve' : lookup + '-serve';
    var f = 'content-pseudosafe' + lookup;
    console.log(f);
    fs.exists(f,(exists)=>{
        if(!exists){
            res.writeHead(404);
            res.end('Pqge not found!');
            return;
        }
        fs.readFile(f,(err,data)=>{
            res.end(data);
        });
    });
}

var server = http.createServer(serverListener);

server.listen(8080);
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
    var lookup = path.basename(decodeURI(request.url)) || 'index.html'
    var f = 'content/' + lookup;
    fs.exists(f, function(exists){
        if(exists){
            response.writeHead(200,mimeTypes[path.extname(decodeURI(request.url))]);
            fs.readFile(f,(err,data)=>{
                if(err){
                    response.writeHead(500);
                    response.write("Server Error!");
                    response.end();
                    return;
                }
                mimeType = mimeTypes[path.extname(lookup)];
                response.writeHead(200,{'Content-type':mimeType});
                response.write(data);
                response.end();
            });
            return;
        }
        response.writeHead(404);
        response.end();
    });
}

var server = http.createServer(serverRequestListener);

server.listen(8080);
var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

var mimeTypes = {
    '.js' : 'text/javascript',
    '.html' : 'text/html',
    '.css' : 'text/css'
};

var cache = {};
function cacheAndDeliver(f, cb){
    fs.stat(f,(err,stats)=>{
        if(err){return console.log("Oh no! Error",err);}
        var lastChanged = Date.parse(stats.mtime);
        isUpdated = (cache[f]) && lastChanged > cache[f].timestamp;
        console.log(isUpdated);
        if(!cache[f] || isUpdated){
            fs.readFile(f, function(err, data){
                console.log('loading '+f+' from file');
                if(!err){
                    cache[f]= {content: data, timestamp: Date.now()};
                }
                cb(err, data);
            });
            return;
        }
        console.log('loading '+f+' from cache');
        cb(null, cache[f].content);
    });
}

serverRequestListener = function(request,response){
    var lookup = path.basename(decodeURI(request.url)) || 'index.html'
    var f = 'content/' + lookup;

    if(request.url === '/favicon.ico'){
        console.log('Not found: ' + f);
        response.writeHead(404);
        response.end();
        return;
    }

    fs.exists(f, function(exists){
        if(exists){
            cacheAndDeliver(f,(err,data)=>{
                if(err){
                    response.writeHead(500);
                    response.end('Server Error!');
                    return;
                }
                response.writeHead(200,{"Content-type":mimeTypes[path.extname(lookup)]});
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
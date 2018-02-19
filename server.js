var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

var mimeTypes = {
    '.js' : 'text/javascript',
    '.html' : 'text/html',
    '.css' : 'text/css'
};

var cache = {
    store: {},
    maxSize: 26214400, //(bytes) 25mb
    maxAge: 5400 * 1000, //(ms) 1 and a half hours
    cleanAfter: 7200 * 1000, //(ms) two hours
    cleanedAt: 0, //to be set dynamically
    clean: function(now){
        if(now - this.cleanAfter > this.cleanedAt){
            this.cleanedAt = now;
            var that = this;
            Object.keys(this.store).forEach((file)=>{
                if(now > that.store[file].timestamp + that.maxAge){
                    delete that.store[file];
                }
            });
        }
    }
};
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

function serverRequestListener (request,response){
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
            var headers = {'Content-type': mimeTypes[path.extname(f)]};
            if(cache[f]){
                console.log('Loding Data From Cache');
                response.writeHead(200,headers);
                response.end(cache[f].content);
                return;
            }

            console.log('Streaming Data From Disk');
            

            var s = fs.createReadStream(f);
            s.once('open',()=>{
                response.writeHead(200,headers)
                s.pipe(response);
            });
            s.once('error',(e)=>{
                console.log(e);
                response.writeHead(500);
                response.end('Server Error!');
            });

            fs.stat(f,(err,stats)=>{
                if(stats.size<cache.maxSize){
                    var bufferOffset = 0;
                    cache[f] = {content: new Buffer(stats.size)};
                    s.on('data',(chunk)=>{
                        chunk.copy(cache[f].content,bufferOffset),
                        bufferOffset += chunk.length;
                    });
                }
            });

            return;
        }
        response.writeHead(404);
        response.end();
    });
    cache.clean(Date.now());
}

var server = http.createServer(serverRequestListener);


server.listen(25000);
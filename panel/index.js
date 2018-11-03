const webserver = require("./lib/webserver");
const GameWrapper = require("./lib/GameWrapper");

if(!process.env.DRYRUN){
    const {stderr, stdout} = new GameWrapper();
    //const stderrCache, stdoutCache;
    stdout.on('data', function (data) { 
        //var newLine = data.replace(/[^\x20-\x7E\n]+/g, "").trim();
        //stderrCache += newLine;
        //io.sockets.emit('stdout', newLine);
    }); 
    stderr.on('data', function(data) {
        //var newLine = data.replace(/[^\x20-\x7E\n]+/g, "").trim();
        //stdoutCache += newLine;
        //io.sockets.emit('stderr', newLine);
    });
}
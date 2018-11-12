const Tail = require('tail').Tail;
var logFile, logCache;
if(!process.env.DRYRUN) 
{
    logFile = new Tail("/var/log/unturned.log",{logger: console, fromBeginning:true}); ///opt/unturned/U4/Saved/Logs/U4.log
    logCache = "";
    logFile.on("line", function(data) {
        console.log("book",data);
    });
}
module.exports = function(socket){
    if(!process.env.DRYRUN){
        logFile.on("line", function(data) {
            var newLine = data + "<br />";
            logCache += newLine;
            socket.emit('log', newLine);
        });
        if(logCache != "")
            socket.emit("log",logCache);
    }
}; 
const LogFileWatcher = require("../../LogFileWatcher");
if(!process.env.DRYRUN) 
{
    const logFile = new LogFileWatcher();
    var logCache = "";
}
module.exports = function(socket){
    if(!process.env.DRYRUN){
        logFile.on("line", function(data) {
            var newLine = data + "<br />";
            logCache += newLine;
            io.sockets.emit('log', newLine);
        });
        socket.emit("log",log);
    }
};
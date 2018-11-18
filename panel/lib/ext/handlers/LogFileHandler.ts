import { IWebSocketHandler } from "unturned2-api";
import * as SocketIO from "socket.io";
import { Tail } from "tail";
import * as fs from "fs";

export default class LogFileHandler implements IWebSocketHandler {
    private logFile : Tail;
    private logCache = "";
    private enabled = false;
    private static logFile = "/opt/unturned/U4/Saved/Logs/U4.log";
    constructor(){
        if(!fs.existsSync(LogFileHandler.logFile)) return;
        this.enabled = true;
        this.logFile = new Tail(LogFileHandler.logFile,{logger: console});
        this.logFile.on("line", function(data) {
            var newLine = data + "<br />";
            this.logCache += newLine;
        });
    }
    
    OnConnect(socket: SocketIO.Socket){
        if(!this.enabled) return;
        this.logFile.on("line", function(data) {
            var newLine = data + "<br />";
            socket.emit('log', newLine);
        });
        if(this.logCache != ""){
            socket.emit("log",this.logCache);
        }
    }
}
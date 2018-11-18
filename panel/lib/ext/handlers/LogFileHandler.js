"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tail_1 = require("tail");
const fs = require("fs");
class LogFileHandler {
    constructor() {
        this.logCache = "";
        this.enabled = false;
        if (!fs.existsSync(LogFileHandler.logFile))
            return;
        this.enabled = true;
        this.logFile = new tail_1.Tail(LogFileHandler.logFile, { logger: console });
        this.logFile.on("line", function (data) {
            var newLine = data + "<br />";
            this.logCache += newLine;
        });
    }
    OnConnect(socket) {
        if (!this.enabled)
            return;
        this.logFile.on("line", function (data) {
            var newLine = data + "<br />";
            socket.emit('log', newLine);
        });
        if (this.logCache != "") {
            socket.emit("log", this.logCache);
        }
    }
}
LogFileHandler.logFile = "/opt/unturned/U4/Saved/Logs/U4.log";
exports.default = LogFileHandler;
//# sourceMappingURL=LogFileHandler.js.map
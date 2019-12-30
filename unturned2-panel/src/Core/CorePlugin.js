"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RCONClient_1 = require("./RCONClient");
const path = require("path");
const WebSocketServer_1 = require("../WebSocketServer");
const WebServer_1 = require("../WebServer");
const Tail = require("tail");
const fs = require("fs");
class CorePlugin {
    constructor() {
        this.logCache = "";
        this.enabled = false;
        this.logFileName = "/opt/unturned/U4/Saved/Logs/U4.log";
    }
    get name() { return "Core"; }
    load() {
        this.rcon = new RCONClient_1.default(process.env.RCON_PORT || 5000, "localhost", "1234");
        this.rcon.on("LOG", function (message) {
            WebSocketServer_1.default.broadcast("rcon.log", message + "<br />");
        });
        if (!fs.existsSync(this.logFileName))
            return;
        this.enabled = true;
        this.logFile = new Tail(this.logFileName, { logger: console });
        this.logFile.on("line", function (data) {
            var newLine = data + "<br />";
            this.logCache += newLine;
        });
    }
    getViews() {
        return [
            new WebServer_1.View("home", path.join(path.resolve("./src/Core/Views/")), "Home", "home")
        ];
    }
    handleWSConnected(socket) {
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
    registerRoutes(router) {
        router.get('/', (req, res) => {
            res.end('Hello, World!');
        });
    }
}
exports.default = CorePlugin;
//# sourceMappingURL=CorePlugin.js.map
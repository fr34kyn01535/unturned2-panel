"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebServer_1 = require("./lib/WebServer");
const RCONClient_1 = require("./lib/RCONClient");
const fs = require("fs");
const uuid = require("uuid");
const WebSocketServer_1 = require("./lib/WebSocketServer");
if (!fs.existsSync("./session.key"))
    fs.writeFileSync("./session.key", uuid.v4());
const jwtSecret = fs.readFileSync("./session.key", "utf8");
const webserver = new WebServer_1.default(process.env.DOMAIN || "localhost", process.env.HTTP_PORT || 2080, jwtSecret || uuid.v4(), process.env.STEAM_API_KEY, process.env.EMAIL, (process.env.DOMAIN != null && process.env.EMAIL != null), process.env.HTTPS_PORT || 2443);
const websocket = new WebSocketServer_1.default(webserver.server, jwtSecret);
var rcon = new RCONClient_1.default(process.env.RCON_PORT || 5000, "localhost", "1234");
rcon.on("LOG", function (message) {
    websocket.emit("rcon.log", message + "<br />");
});
//# sourceMappingURL=index.js.map
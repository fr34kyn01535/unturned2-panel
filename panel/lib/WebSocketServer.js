"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
class WebSocketServer {
    on(name, event) {
        this.io.on(name, event);
    }
    emit(name, event) {
        this.io.emit(name, event);
    }
    constructor(webserver, jwtSecret) {
        this.io = require('socket.io')(webserver);
        var handlers = [];
        function addHandler(directory) {
            console.log("adding", directory);
            fs.readdirSync(directory).forEach(function (handler) {
                if (!handler.endsWith(".js"))
                    return;
                var fullPath = path.resolve(directory, path.parse(handler).name);
                handlers.push(new (require(fullPath).default));
            });
        }
        ;
        addHandler(path.resolve("./lib/ext/handlers/"));
        fs.readdirSync("./plugins").forEach(function (directory) {
            var handlersDirectory = path.resolve("./plugins/", directory, "handlers");
            if (fs.existsSync(handlersDirectory))
                addHandler(handlersDirectory);
        });
        this.io.on('connection', function (socket) {
            socket.on('connected', function (token) {
                if (token)
                    socket.user = jwt.verify(token, jwtSecret);
                //if(socket.user == null) socket.close();
                handlers.forEach(function (handler) {
                    try {
                        handler.OnConnect(socket);
                    }
                    catch (e) {
                        console.error("Failed to execute socket handler", e);
                    }
                });
            });
        });
    }
}
exports.default = WebSocketServer;
//# sourceMappingURL=WebSocketServer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io");
const jwt = require("jsonwebtoken");
const events_1 = require("events");
class WebSocketServer extends events_1.EventEmitter {
    static broadcast(topic, data) {
        this.io.emit(topic, data);
    }
    constructor(server, configuration) {
        super();
        var that = this;
        WebSocketServer.io = this.io = io(server);
        this.io.on('connection', function (socket) {
            socket.on('connected', function (token) {
                if (token)
                    socket.user = jwt.verify(token, configuration.jwtSecret);
                that.emit("connected", socket);
            });
        });
    }
}
exports.default = WebSocketServer;
//# sourceMappingURL=WebSocketServer.js.map
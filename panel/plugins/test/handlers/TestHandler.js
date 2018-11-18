"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a server side websocket handler. The OnConnect method is called on every new connection.
 * You can listen to events of a client with socket.on and send using socket.emit
 */
class LogFileHandler {
    constructor() {
    }
    OnConnect(socket) {
        socket.on("pingsocket", function () {
            socket.emit("pongsocket", "from my handler");
            socket.broadcast.emit("pongsocket", "from my handler");
        });
    }
}
exports.default = LogFileHandler;
//# sourceMappingURL=TestHandler.js.map
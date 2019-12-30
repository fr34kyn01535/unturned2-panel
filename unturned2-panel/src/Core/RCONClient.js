"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const events_1 = require("events");
class RCONClient extends events_1.EventEmitter {
    send(message) {
        console.log("Sending: " + message);
        this.client.write("RCON 1 " + message);
    }
    connect() {
        console.log('Connecting...');
        this.client.connect(this.port, this.host, () => {
            this.client.write('RCON 1 AUTH ' + this.password, 'utf-8');
            this.keepalive = setInterval(() => {
                this.send("PING");
            }, 10000);
        });
    }
    constructor(port, host, password) {
        super();
        var that = this;
        this.port = port;
        this.host = host;
        this.password = password;
        this.client = new net_1.Socket();
        this.client.setEncoding('utf-8');
        this.client.setKeepAlive(true);
        this.client.setTimeout(5000);
        this.client.on('data', function (data) {
            var parsed = /RCON (\d+) (\w*)(?: (.*)|)/.exec(data);
            if (parsed.length !== 4)
                return console.log("Could not parse RCON result", data);
            var [text, version, command, args] = parsed;
            if (version != "1")
                return console.log("Invalid RCON version", version);
            switch (command.toUpperCase()) {
                case "AUTH":
                    console.log("Connected");
                    break;
                case "PING":
                    that.send("PONG");
                    break;
                default:
                    {
                        that.emit(command, args);
                        console.log("Received: " + text);
                    }
                    ;
            }
        });
        this.client.on('close', function (err) {
            console.log('Connection closed');
            this.destroy();
            clearInterval(that.keepalive);
            setTimeout(function () {
                that.connect();
            }, 10000);
        });
        this.client.on('error', function (ex) {
            console.error('Connection error', ex);
        });
        //this.connect(); 
    }
}
exports.default = RCONClient;
//# sourceMappingURL=RCONClient.js.map
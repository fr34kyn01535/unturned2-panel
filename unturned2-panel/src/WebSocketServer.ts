import * as io from "socket.io"
import {RequestUser} from "./WebServer";
import * as jwt from "jsonwebtoken"
import { Configuration } from "./ConfigManager";
import { EventEmitter } from "events";
import { Server } from "net";

interface WebSocketUser extends RequestUser {}

export interface WebSocketConnection extends io.EngineSocket{
    user : WebSocketUser
} 

export default class WebSocketServer extends EventEmitter {
    private static io : io.Server;
    private io : io.Server;

    public static broadcast(topic : string, data : any){ 
        this.io.emit(topic,data);
    }
    
    constructor(server : Server, configuration : Configuration){
        super();
        var that = this;
        WebSocketServer.io = this.io = io(server);

        this.io.on('connection', function (socket : WebSocketConnection) {
            socket.on('connected', function (token) {
                if(token) socket.user = jwt.verify(token,configuration.jwtSecret);
                that.emit("connected",socket);
            });
        });
    }
}

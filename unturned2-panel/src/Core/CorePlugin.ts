import RCONClient from "./RCONClient";
import {Plugin} from "../PluginManager"
import * as path from 'path';
import WebSocketServer, { WebSocketConnection } from "../WebSocketServer";
import { View, Request, Response, Router } from "../WebServer";
import * as Tail from "tail"
import * as fs from "fs"


export default class CorePlugin implements Plugin {
    get name() { return "Core"; }
    private rcon : RCONClient

    private logFile : Tail;
    private logCache = "";
    private enabled = false;
    private logFileName = "/opt/unturned/U4/Saved/Logs/U4.log";

    load(){
        this.rcon = new RCONClient((<any>process.env.RCON_PORT) || 5000, "localhost", "1234");
        this.rcon.on("LOG",function(message){
            WebSocketServer.broadcast("rcon.log",message + "<br />"); 
        });

        if(!fs.existsSync(this.logFileName)) return;
        this.enabled = true;
        this.logFile = new Tail(this.logFileName,{logger: console});
        this.logFile.on("line", function(data) {
            var newLine = data + "<br />";
            this.logCache += newLine;
        });
    }

    getViews() : View[] {
        return [
            new View("home",path.join(path.resolve("./src/Core/Views/")),"Home","home")
        ];
    }

    handleWSConnected(socket: WebSocketConnection) {
        if(!this.enabled) return;
        this.logFile.on("line", function(data) {
            var newLine = data + "<br />";
            socket.emit('log', newLine);
        });
        if(this.logCache != ""){
            socket.emit("log",this.logCache);
        }
    }
    
    registerRoutes(router : Router){
        router.get('/' ,(req: Request, res) => {
            res.end('Hello, World!');
        });
    }


}
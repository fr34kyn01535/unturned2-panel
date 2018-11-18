import WebServer  from "./lib/WebServer";
import RCONClient from"./lib/RCONClient";
import * as fs from 'fs'; 
import * as uuid from 'uuid';
import WebSocketServer from "./lib/WebSocketServer";

if(!fs.existsSync("./session.key"))
    fs.writeFileSync("./session.key",uuid.v4());
const jwtSecret = fs.readFileSync("./session.key", "utf8");

const webserver = new WebServer(
        process.env.DOMAIN || "localhost", 
        (<any>process.env.HTTP_PORT) || 2080, 
        jwtSecret || uuid.v4(), 
        process.env.STEAM_API_KEY, 
        process.env.EMAIL,
        (process.env.DOMAIN != null && process.env.EMAIL != null),
        (<any>process.env.HTTPS_PORT) || 2443
    );

const websocket = new WebSocketServer(webserver.server,jwtSecret);

var rcon = new RCONClient((<any>process.env.RCON_PORT) || 5000, "localhost", "1234");
rcon.on("LOG",function(message){
    websocket.emit("rcon.log",message + "<br />"); 
});
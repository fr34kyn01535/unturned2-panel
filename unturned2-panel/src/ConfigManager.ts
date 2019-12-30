import * as fs from "fs"
import * as uuid from "uuid"

export class Configuration{
    jwtSecret : string;
    httpPort : number;
    httpsPort : number;
    steamApiKey : string;
    domain : string;
    email: string;
    enableSSL: boolean;
    autoSSL: boolean;
}

var configuration = new Configuration();

if(!fs.existsSync("./session.key")) fs.writeFileSync("./session.key",uuid.v4());
var jwtSecret = fs.readFileSync("./session.key", "utf8");

configuration.jwtSecret= jwtSecret;
configuration.httpPort= (<any>process.env.HTTP_PORT) || 2080;
configuration.httpsPort= (<any>process.env.HTTPS_PORT) || 2443;
configuration.steamApiKey= process.env.STEAM_API_KEY;
configuration.domain=process.env.DOMAIN || "localhost";
configuration.email= process.env.EMAIL;
configuration.autoSSL= (process.env.DOMAIN != null && process.env.EMAIL != null);

export default configuration;
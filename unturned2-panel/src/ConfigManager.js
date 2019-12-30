"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const uuid = require("uuid");
class Configuration {
}
exports.Configuration = Configuration;
var configuration = new Configuration();
if (!fs.existsSync("./session.key"))
    fs.writeFileSync("./session.key", uuid.v4());
var jwtSecret = fs.readFileSync("./session.key", "utf8");
configuration.jwtSecret = jwtSecret;
configuration.httpPort = process.env.HTTP_PORT || 2080;
configuration.httpsPort = process.env.HTTPS_PORT || 2443;
configuration.steamApiKey = process.env.STEAM_API_KEY;
configuration.domain = process.env.DOMAIN || "localhost";
configuration.email = process.env.EMAIL;
configuration.autoSSL = (process.env.DOMAIN != null && process.env.EMAIL != null);
exports.default = configuration;
//# sourceMappingURL=ConfigManager.js.map
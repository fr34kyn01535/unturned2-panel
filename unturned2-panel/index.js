"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigManager_1 = require("./src/ConfigManager");
const WebServer_1 = require("./src/WebServer");
const WebSocketServer_1 = require("./src/WebSocketServer");
exports.WebSocketServer = WebSocketServer_1.default;
const PluginManager_1 = require("./src/PluginManager");
var args = process.argv.slice(2);
if (args[0] == "run") {
    const www = new WebServer_1.default(ConfigManager_1.default);
    const ws = new WebSocketServer_1.default(www.server, ConfigManager_1.default);
    const pluginManager = new PluginManager_1.default(ws, www);
    pluginManager.loadPlugins();
}
var WebServer_2 = require("./src/WebServer");
exports.View = WebServer_2.View;
//# sourceMappingURL=index.js.map
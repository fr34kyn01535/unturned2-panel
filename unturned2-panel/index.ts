import configuration from "./src/ConfigManager";
import WebServer from "./src/WebServer";
import WebSocketServer from "./src/WebSocketServer";
import PluginManager from "./src/PluginManager";

const www = new WebServer(configuration);

const ws = new WebSocketServer(www.server, configuration);

const pluginManager = new PluginManager(ws,www);

pluginManager.loadPlugins();


export { WebSocketServer }
export { Plugin } from "./src/PluginManager"
export { WebSocketConnection } from "./src/WebSocketServer"
export { View, Router, Request, Response} from "./src/WebServer"
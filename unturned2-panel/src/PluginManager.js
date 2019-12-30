"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const fs = require("fs");
class PluginRegistration {
    constructor(path) {
        this.path = path;
    }
}
exports.PluginRegistration = PluginRegistration;
class ViewRegistration {
    constructor(view, plugin) {
        this.view = view;
        this.plugin = plugin;
    }
}
exports.ViewRegistration = ViewRegistration;
class MenuItem {
}
class PluginManager {
    constructor(ws, www) {
        this.plugins = new Array();
        this.routers = new Map();
        var that = this;
        this.ws = ws;
        this.www = www;
        this.ws.on("connected", function (socket) {
            that.plugins.forEach(function (plugin) {
                try {
                    plugin.instance.handleWSConnected(socket);
                }
                catch (e) {
                    console.error("Failed to execute socket handler", e);
                }
            });
        });
        this.www.app.use('/views/:plugin/:view.:ext', (req, res, next) => {
            var registration = this.getViews().find(registration => registration.view.name.toLowerCase() == req.params.view.toLowerCase() &&
                registration.plugin.name.toLowerCase() == req.params.plugin.toLowerCase());
            if (registration == null)
                return next();
            var fileName = req.params.view + "." + req.params.ext;
            var fullPath = path.join(registration.view.path, fileName);
            fs.stat(fullPath, function (err, stat) {
                if (err)
                    return next(err);
                const mtime = new Date(stat.mtimeMs).toUTCString();
                if (req.headers['if-modified-since'] === mtime) {
                    res.writeHead(304);
                    return res.end();
                }
                fs.readFile(fullPath, "utf8", function (err, data) {
                    if (err)
                        return next(err);
                    res.contentType(fileName);
                    if (req.params.ext == "js") {
                        data = '"use strict";app.register.controller("' + req.params.view + '", ' + data + ');';
                    }
                    if (req.params.ext == "html") {
                        data = '<div ng-controller="' + req.params.view + ' as vm">' + data + '</div>';
                    }
                    res.send(data);
                    res.end();
                });
            });
        });
        this.www.app.get('/config', function (req, res) {
            var views = that.getViews();
            return res.json({
                title: "Unturned II Dashboard",
                menuItems: views.map(registration => {
                    var menuItem = new MenuItem();
                    menuItem.id = registration.view.name.toLowerCase();
                    menuItem.plugin = registration.plugin.name.toLowerCase();
                    menuItem.icon = registration.view.icon;
                    menuItem.title = registration.view.title;
                    menuItem.view = registration.view.name;
                    menuItem.visible = registration.view.visible;
                    return menuItem;
                })
            });
        });
    }
    loadPlugins() {
        var that = this;
        this.plugins.push(new PluginRegistration("./Core/CorePlugin"));
        fs.readdir(path.resolve(__dirname, "../node_modules/"), function (err, items) {
            if (err)
                console.error("Failed to load plugins: " + err);
            items.filter(item => item.indexOf("unturned2-panel-ext-") == 0).forEach(item => {
                console.log("Loading " + item);
                that.plugins.push(new PluginRegistration(item));
            });
            that.plugins.forEach(plugin => {
                plugin.instance = new (require(plugin.path).default);
                plugin.name = plugin.instance.name;
            });
            that.registerRoutes();
            that.plugins.forEach(plugin => plugin.instance.load());
        });
    }
    getViews() {
        var views = new Array();
        this.plugins.forEach(plugin => {
            if (plugin.instance.getViews() != null) {
                plugin.instance.getViews().forEach(view => {
                    views.push(new ViewRegistration(view, plugin));
                });
            }
        });
        return views;
    }
    registerRoutes() {
        this.plugins.forEach(plugin => {
            let pluginRouter = express.Router();
            let routeName = plugin.name.toLowerCase();
            plugin.instance.registerRoutes(pluginRouter);
            this.routers[routeName] = pluginRouter;
            this.www.addRouter(routeName, pluginRouter);
        });
    }
}
exports.default = PluginManager;
//# sourceMappingURL=PluginManager.js.map
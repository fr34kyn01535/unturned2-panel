"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
/**
 * Base for routers
 */
class BaseRouter {
    constructor() {
        this.router = express.Router();
        this.root = "";
    }
    GetRouter() {
        return this.router;
    }
    GetRoot() {
        return this.root;
    }
}
exports.BaseRouter = BaseRouter;
var express_1 = require("express");
exports.Router = express_1.Router;
//# sourceMappingURL=index.js.map
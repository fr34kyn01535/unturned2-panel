"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unturned2_api_1 = require("unturned2-api");
const path = require("path");
class APIRouter extends unturned2_api_1.BaseRouter {
    constructor() {
        super();
        this.root = "api";
        this.router.get('/', (req, res) => {
            res.end('Hello, World!');
        });
        this.router.get('/logout', (req, res) => {
            res.redirect('/#/logout');
        });
        this.router.get('/config', (req, res) => {
            res.sendFile(path.resolve("./config.json"));
        });
    }
}
exports.default = APIRouter;
//# sourceMappingURL=ApiRouter.js.map
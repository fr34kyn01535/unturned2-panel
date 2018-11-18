"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unturned2_api_1 = require("unturned2-api");
/**
 * This is a server side route registration.
 * The router is automatically registered at /<root>/.
 * When the user is authenticated - req.user is set to the user profile.
 */
class TestRouter extends unturned2_api_1.BaseRouter {
    constructor() {
        super();
        this.root = "test";
        this.router.get('/ping', function (req, res) {
            if (req.user) {
                return res.send("hello " + req.user.userName);
            }
            else {
                return res.send("i dont know you");
            }
        });
    }
}
exports.default = TestRouter;
//# sourceMappingURL=TestRouter.js.map
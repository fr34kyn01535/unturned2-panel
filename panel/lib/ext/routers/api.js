const router = require('express').Router();
const webserver = require("../../webserver");
const path = require("path");

router.get('/' ,function (req, res) {
    console.log(req.user);
    res.end('Hello, World!');
});
router.get('/logout', function(req, res) {
    res.redirect('/#/logout');
});
router.get('/config', function(req,res){
    res.sendFile(path.resolve("./config.json"));
}); 
module.exports = router;
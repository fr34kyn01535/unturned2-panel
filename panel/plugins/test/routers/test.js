"use strict";
//This is a server side route registration. 
//The router is automatically registered at /<name of the file without .js>/.
//When the user is authenticated - req.user is set to the user profile.
const router = require('express').Router();

router.get('/ping' ,function (req, res) {
    if(req.user){
       return res.send("hello "+req.user.userName);
    }else{
       return res.send("i dont know you");
    }
});

module.exports = router;
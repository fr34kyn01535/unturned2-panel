const express = require('express');
const app = express();
const passport = require("passport");
const uuid = require("uuid");
const path = require('path');
const fs = require("fs");
const jwt = require("jsonwebtoken");
var server;
var enableSSL = process.env.DOMAIN && process.env.EMAIL;
var domain = process.env.DOMAIN || "localhost";
var address = (enableSSL ? "https://" : "http://") + domain;
if(enableSSL){ 
    console.log(process.env.DOMAIN, process.env.EMAIL)
    const glx = require('greenlock-express').create({
        server: 'https://acme-v02.api.letsencrypt.org/directory',
        version: 'draft-11',
        telemetry: false,
        email: process.env.EMAIL,
        agreeTos: true,
        approveDomains: [ process.env.DOMAIN ]
    });
    server = require('https').createServer(glx.httpsOptions, app).listen(process.env.HTTPS_PORT || 2443, function () {
        console.log("Listening on", this.address());
    });

    require('http').createServer(glx.middleware(require('redirect-https')())).listen(process.env.HTTP_PORT || 2080, function () {
        console.log("Listening for ACME http-01 challenges on", this.address());
    });
}else{
    server = require('http').createServer(app).listen(process.env.HTTP_PORT || 2080, function () {
        console.log("Listening on", this.address());
    });
}


if(!fs.existsSync("./session.key"))
    fs.writeFileSync("./session.key",uuid.v4())
    const jtwSecret = fs.readFileSync("./session.key", "utf8");

passport.use(new (require("passport-steam"))({
    returnURL:  address + '/auth',
    realm: address,
    apiKey: process.env.STEAM_API_KEY
  },
  function(identifier, profile, done) { done(null,profile); }
));

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(user, done) { done(null, user); });

app.use(passport.initialize());
app.use(passport.session({ resave: true,  saveUninitialized: true }));

app.use(express.static('./www'));

app.get('/auth/login', passport.authenticate('steam'));
app.use(function(req, res, next){ 
    const auth = req.get("authorization");
    var token;
    if(auth != null) token = new Buffer(auth.split(" ").pop(), "base64").toString("utf8");
    if(token != null) req.user = jwt.verify(token, jtwSecret);
    next();
});

app.get('/auth', passport.authenticate('steam', { failureRedirect: '/api/login' }),
  function(req, res) {
    var session = {
        steamID: req.user.id,
        avatar:  req.user.photos[0].value,
        userName:  req.user.displayName,
        name:  req.user._json.realname
    }
    var token = jwt.sign(session, jtwSecret); 
    res.redirect('/#/login/'+Buffer.from(token).toString('base64'));
});

var io = require('socket.io')(server);

app.use(function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).end();
  });
var handlers = [];
function addHandler(directory){
    console.log("adding" ,directory);
    fs.readdirSync(directory).forEach(function(handler) {
        console.log("adding" ,path.resolve(directory,path.parse(handler).name));
        handlers.push(require(path.resolve(directory,path.parse(handler).name)));
    });
};

function addRouter(directory){
    fs.readdirSync(directory).forEach(function(router) {
        var name = path.parse(router).name;
        app.use("/" + name, require(path.resolve(directory,name)));
    });
};

addHandler(path.resolve("./lib/ext/handlers/"));
addRouter("./lib/ext/routers/");
app.use('/views/',express.static('./lib/ext/views'));

fs.readdirSync("./plugins").forEach(function(directory){
    viewsDirectory = path.resolve("./plugins/",directory,"views");
    if(fs.existsSync(viewsDirectory)) app.use('/views/',express.static(viewsDirectory));

    handlersDirectory = path.resolve("./plugins/",directory,"handlers");
    if(fs.existsSync(handlersDirectory)) addHandler(handlersDirectory);

    routersDirectory = path.resolve("./plugins/",directory,"routers");
    if(fs.existsSync(routersDirectory)) addRouter(routersDirectory);
});

io.on('connection', function (socket) {
    socket.on('connected', function (token) {
        if(token) socket.user = jwt.verify(token,jtwSecret);
        //if(socket.user == null) socket.close();
        socket.handlers = [];
        handlers.forEach(function(handler){
            socket.handlers.push(handler(socket));
        });
    });
});
module.exports = { };
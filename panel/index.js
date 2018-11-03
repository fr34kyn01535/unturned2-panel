const express = require('express');
const app = express();
const passport = require("passport");
const uuid = require("uuid");
const fs = require("fs");
const jwt = require("jsonwebtoken");
var server;
var enableSSL = process.env.DOMAIN && process.env.EMAIL;
var domain = process.env.DOMAIN || "localhost";
var address = (enableSSL ? "https://" : "http://") + domain;
Tail = require('tail').Tail;

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
    returnURL:  address + '/api/auth',
    realm: address,
    apiKey: process.env.STEAM_API_KEY
  },
  function(identifier, profile, done) { done(null,profile); }
));

function validate(req, res, next){ 
    const auth = req.get("authorization");
    if (!auth) {
        return res.status(401).send("Authorization Required");
      } else {
        var token =new Buffer(auth.split(" ").pop(), "base64").toString("utf8");
        console.log("jwt",token)
        next();
    }
}

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(user, done) { done(null, user); });

app.use(passport.initialize());
app.use(passport.session({ resave: true,  saveUninitialized: true }));

app.use(express.static('www'));

app.get('/api/login', passport.authenticate('steam'));

app.get('/api/auth', passport.authenticate('steam', { failureRedirect: '/api/login' }),
  function(req, res) {
    var session = {
        steamID: req.user.id,
        avatar:  req.user.photos[0].value,
        userName:  req.user.displayName,
        name:  req.user._json.realname
    }
    var token = jwt.sign(session, jtwSecret); 
    console.log('/#/login/'+Buffer.from(token).toString('base64'));
    res.redirect('/#/login/'+Buffer.from(token).toString('base64'));
});

app.get('/api/logout', function(req, res) {
    res.redirect('/#/logout');
});

app.get('/api/', validate ,function (req, res) {
    res.end('Hello, World!');
});

app.get('/api/config', function (req, res) {
    res.json(
        {
            title: "Unturned II Dashboard",
            menuItems:[
                {
                    id: "home",
                    icon : "home",
                    title: "Home",
                    view: "home",
                    visible: true,
                },
                {
                    id: "test",
                    icon : "build",
                    title: "Test",
                    view: "test",
                    visible: true
                }
            ],
        });
});
stdout = new Tail("/opt/unturned/U4/Saved/Logs/U4.log");
stdout.on("line", function(data) {
    io.sockets.emit('log', data);
});
var io = require('socket.io')(server);
io.on('connection', function (socket) {
    socket.on('connected', function (token) {
        if(token) socket.user = jwt.verify(token,jtwSecret);
      //if(socket.user == null) socket.close();
      socket.emit("connected","Connected");
      socket.emit("stdout",stdout);
      socket.emit("stderr",stderr);
    });
  });
  var stdout = "";
  var stderr = "";
if(process.platform !== "win32"){
    const child = require('child_process').spawn('/bin/bash',['-c','/opt/unturned/U4Server.sh -rconport=3000'],{cwd:"/opt/unturned/"});
    
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) { 
        stdout+=data.replace(/[^\x20-\x7E\n]+/g, "").trim();
        console.log("stdout",data); 
        io.sockets.emit('stdout', data);
    }); 
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        stderr+=data.replace(/[^\x20-\x7E\n]+/g, "").trim();
        console.error("stderr",data); 
        io.sockets.emit('stderr', data);
    });
    child.on('close', function (code) {
        console.log('process exit code ' + code);
        process.exit(code)
    });
    
}

///opt/unturned/U4/Saved/Logs/U4.log 
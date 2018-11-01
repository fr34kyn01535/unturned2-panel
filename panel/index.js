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
                    children:[
                        {
                            id: "test",
                            icon : "build",
                            title: "Test",
                            view: "test",
                            visible: true
                        }
                    ]
                },
            ],
        });
});

var io = require('socket.io')(server);
io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('connected', function (token) {
      socket.user = jwt.verify(token,jtwSecret);
      console.log("client connected",socket.user);
      if(socket.user == null) socket.close();
    });
  });
if(process.platform !== "win32"){
    const spawn = require('child_process').spawn;
    const readline = require('readline');
    const prc = spawn('/opt/unturned/U4Server.sh',{cwd:"/opt/unturned/", shell:true});
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data) {
        const str = data.toString()
        const lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });

    prc.on('close', function (code) {
        console.log('process exit code ' + code);
        process.exit(code)
    });
}
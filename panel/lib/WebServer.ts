import * as express from 'express';
import * as passport from "passport";
import * as path from 'path';
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import * as url  from 'url';
import { BaseRouter } from 'unturned2-api';

export default class WebServer{
    public app;
    public server : string;

    private addRouter(directory){
        var that = this;
        fs.readdirSync(directory).forEach(function(routerName) {
            if(!routerName.endsWith(".js")) return;
            var name = path.parse(routerName).name;
            var fullPath = path.resolve(directory,name);
            var routerFunction = require(fullPath);
            var router :BaseRouter = (<BaseRouter>new routerFunction.default());
            var root = router.GetRoot()
            if(!root) return console.error("Router " +fullPath+ " can't be registered without supplying a root");
            console.log("Registering router "+ fullPath +" at /"+root);
            that.app.use("/" + root, router.GetRouter());
        });
    };

    private viewHandler(root: string) {
        var handler = function (req, res, next) {
            root = path.resolve(root);
            var pathname = url.parse(req.url).pathname;
            var filename = path.join(root, pathname);
            if(filename.indexOf(root) !== 0 || !fs.existsSync(filename)) {
                pathname = pathname.replace(/(.js|.html)/,".view$1");
                filename = path.join(root, pathname);
                if(filename.indexOf(root) !== 0 || !fs.existsSync(filename)) return next();
            }
            fs.stat(filename, function(err, stat){
              if(err) return next(err);
              if(stat.isDirectory()){
                res.writeHead(301, {
                  'Location': pathname + '/'
                });
                return res.end();
              }
              const mtime = new Date(stat.mtimeMs).toUTCString();
              if(req.headers['if-modified-since'] === mtime){
                res.writeHead(304);
                return res.end();
              }

              fs.readFile(filename, "utf8",function(err, data) {
                if(err) return next(err);
                res.contentType(filename);
                var controllerName = /(\w*).view.(:?js|html)$/.exec(filename)[1];
                if(filename.endsWith(".view.js")){
                    data = '"use strict";app.register.controller("'+controllerName+'", ' + data+ ');';
                }
                if(filename.endsWith(".view.html")){
                    data = '<div ng-controller="'+controllerName+' as vm">'+data+'</div>';
                }
                res.send(data);
                res.end();
              }); 

            });
        };
        return handler;
    }

    constructor(domain : string, httpPort :number, jwtSecret:string,steamAPIKey : string, email:string, enableSSL : boolean = false,  httpsPort: number = 2443){
        var that = this;
        this.app = express();
        var address = (enableSSL ? "https://" : "http://") + domain;
        if(enableSSL){ 
            const glx = require('greenlock-express').create({
                server: 'https://acme-v02.api.letsencrypt.org/directory',
                version: 'draft-11',
                telemetry: false,
                email: email,
                agreeTos: true,
                approveDomains: [ domain ]
            });
            this.server = require('https').createServer(glx.httpsOptions, this.app).listen(httpsPort, function () {
                console.log("Listening on", this.address());
            });

            require('http').createServer(glx.middleware(require('redirect-https')())).listen(httpPort, function () {
                console.log("Listening for ACME http-01 challenges on", this.address());
            });
        }else{
            this.server = require('http').createServer(this.app).listen(httpPort, function () {
                console.log("Listening on", this.address());
            });
        }

        passport.use(new (require("passport-steam"))({ returnURL:  address + '/auth', realm: address, apiKey: steamAPIKey }, function(identifier, profile, done) { done(null,profile); }));

        passport.serializeUser(function(user, done) { done(null, user); });
        passport.deserializeUser(function(user, done) { done(null, user); });

        this.app.use(passport.initialize());
        this.app.use(passport.session({ resave: true,  saveUninitialized: true }));

        this.app.use(express.static('./www'));

        this.app.get('/auth/login', passport.authenticate('steam'));
        this.app.use(function(req, res, next){ 
            const auth = req.get("authorization");
            var token;
            if(auth != null) token = new Buffer(auth.split(" ").pop(), "base64").toString("utf8");
            if(token != null) req.user = jwt.verify(token, jwtSecret);
            next();
        });

        this.app.get('/auth', passport.authenticate('steam', { failureRedirect: '/api/login' }),
        function(req, res) {
            var session =  {
                steamID: req.user.id,
                avatar:  req.user.photos[0].value,
                userName:  req.user.displayName,
                name:  req.user._json.realname
            }
            var token = jwt.sign(session, jwtSecret); 
            res.redirect('/#/login/'+Buffer.from(token).toString('base64'));
        });

        this.app.use(function errorHandler(err, req, res, next) {
            console.error(err);
            res.status(500).end();
        });

        this.addRouter("./lib/ext/routers/");
        this.app.use('/views/',this.viewHandler('./lib/ext/views'));

        fs.readdirSync("./plugins").forEach(function(directory){
            var viewsDirectory = path.resolve("./plugins/",directory,"views");
            if(fs.existsSync(viewsDirectory)) that.app.use('/views/',that.viewHandler(viewsDirectory));

            var routersDirectory = path.resolve("./plugins/",directory,"routers");
            if(fs.existsSync(routersDirectory)) that.addRouter(routersDirectory);
        });
    }
}
import * as express from 'express';
import * as express_static from 'express-serve-static-core';
import * as passport from "passport";
import * as jwt from "jsonwebtoken";
import * as http from "http";
import * as https from "https";
import { Server } from 'net';
import { Configuration } from './ConfigManager';
import { EventEmitter } from 'events';

export interface RequestUser {
    steamID: string;
    avatar: string;
    userName: string;
    name: string;
}

interface PassportUser {
    id,
    photos,
    displayName,
    _json,
}


export interface PassportAuthenticationRequest extends express_static.Request {
    user: PassportUser;
}

export interface Request extends express_static.Request {
    user: RequestUser;
}

export interface Response extends express_static.Response<any> { }

export interface Router extends express_static.IRouter { };

export class View{
    constructor(name: string, path: string, title : string = null, icon : string = null, visible: boolean = true) {
        this.name = name;
        this.path = path;
        this.icon = icon;
        this.title = title;
        this.visible = (title == null || icon == null) ? false : visible;
    }
    path : string
    name : string
    icon : string
    title : string
    visible: boolean
}

export class ViewRequest{
    constructor(name: string){
        this.name = name;
    }
    readonly name:string;
    path: string = null;
}

export default class WebServer extends EventEmitter{
    public app : express.Application;
    public server : Server;
    
    public addRouter(root : string, router : express.IRouter){
        this.app.use("/" + root, router);
    }

    constructor(configuration: Configuration){
        super();
        this.app = express();
        var address = (configuration.enableSSL ? "https://" : "http://") + configuration.domain + (
            configuration.enableSSL ? 
                configuration.httpsPort != 443 ? ":" + configuration.httpsPort : "" : 
                configuration.httpPort != 80 ? ":" + configuration.httpPort : ""
            );
        if(configuration.autoSSL){ 
            const glx = require('greenlock-express').create({
                server: 'https://acme-v02.api.letsencrypt.org/directory',
                version: 'draft-11',
                telemetry: false,
                email: configuration.email,
                agreeTos: true,
                approveDomains: [ configuration.domain ]
            });
            this.server = https.createServer(glx.httpsOptions, this.app).listen(configuration.httpsPort, function () {
                console.log("Listening on", this.address());
            });

            http.createServer(glx.middleware(require('redirect-https')())).listen(configuration.httpPort, function () {
                console.log("Listening for ACME http-01 challenges on", this.address());
            });
        }else{
            this.server = http.createServer(this.app).listen(configuration.httpPort, function () {
                console.log("Listening on", this.address());
            });
        }

        passport.use(new (require("passport-steam"))({ returnURL:  address + '/auth', realm: address, apiKey: configuration.steamApiKey }, function(identifier, profile, done) { done(null,profile); }));

        passport.serializeUser(function(user, done) { done(null, user); });
        passport.deserializeUser(function(user, done) { done(null, user); });

        this.app.use(passport.initialize());
        this.app.use(passport.session({ resave: true,  saveUninitialized: true }));

        this.app.use(express.static('./www'));

        this.app.get('/auth/login', passport.authenticate('steam'));
        this.app.use(function(req : Request, res, next) { 
            const auth = req.get("authorization");
            var token;
            if(auth != null) token = new Buffer(auth.split(" ").pop(), "base64").toString("utf8");
            if(token != null) req.user = jwt.verify(token, configuration.jwtSecret);
            next();
        });

        this.app.get('/auth', passport.authenticate('steam', { failureRedirect: '/api/login' }),
        function(req : PassportAuthenticationRequest, res) {
            var session =  {
                steamID: req.user.id,
                avatar:  req.user.photos[0].value,
                userName:  req.user.displayName,
                name:  req.user._json.realname
            }
            var token = jwt.sign(session, configuration.jwtSecret); 
            res.redirect('/#/login/'+Buffer.from(token).toString('base64'));
        });

        
        this.app.get('/logout', (req: Request, res: Response) => {
            res.redirect('/#/logout');
        });

        this.app.use(function errorHandler(err, req, res, next) {
            console.error(err);
            res.status(500).end();
        });

    }
}
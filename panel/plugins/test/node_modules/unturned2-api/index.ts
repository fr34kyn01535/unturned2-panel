import * as express from 'express';
import { Socket } from "socket.io";


/**
 * Base for routers
 */
export class BaseRouter {
    protected router = express.Router();
    public root = "";
    public GetRouter(){
        return this.router;
    }
    public GetRoot(){
        return this.root;
    }
}

/**
 * Base for websocket handlers
 */
export interface IWebSocketHandler{
    /**
     * This method is called for every new connection
     * @param socket The socket object of the new connection
     */
    OnConnect(socket: Socket) : void
}

export interface Request extends express.Request {
    user : User 
}

export interface User {
    steamID:string
    avatar:string
    userName:string
    name:string
}

export { Socket } from "socket.io";
export { Router, Response } from "express";

import { BaseRouter, Request, Response  } from 'unturned2-api';

import * as path from  "path";

export default class APIRouter extends BaseRouter{
    constructor(){
        super();
        this.root = "api";
        this.router.get('/' ,(req: Request, res: Response) => {
            res.end('Hello, World!');
        });

        this.router.get('/logout', (req: Request, res: Response) => {
            res.redirect('/#/logout');
        });

        this.router.get('/config', (req: Request, res: Response) => {
            res.sendFile(path.resolve("./config.json"));
        }); 
    }
}
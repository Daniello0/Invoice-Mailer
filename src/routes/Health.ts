import {Request, Response, Router} from "express";

const health = Router();
health.get("/test", (_req: Request, res: Response) => {
    res.sendStatus(200);
});

export default health;
import {Request, Response, Router} from "express";

const testRoute = Router();
testRoute.get("/test", (_req: Request, res: Response) => {
    res.sendStatus(200);
});

export default testRoute;
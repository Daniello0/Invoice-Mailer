import {Request, Response, Router} from "express";

const createUser: Router = Router();
createUser.post("/api/client", (_req: Request, res: Response) => {
    res.sendStatus(500);
});

export default createUser;
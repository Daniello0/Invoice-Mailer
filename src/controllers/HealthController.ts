import {Request, Response} from "express";

export const healthController = (_req: Request, res: Response) => {
    res.sendStatus(200);
}
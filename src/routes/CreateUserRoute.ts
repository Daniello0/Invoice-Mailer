import {Express, Router} from "express";
import {createUserController} from "../controllers/CreateUserController.js";

export const setupCreateUserRoute = (app: Express) => {
    const createUser: Router = Router();
    createUser.post("/api/client", createUserController);
    app.use(createUser)
}
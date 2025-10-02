import {Express, Router} from "express";
import {healthController} from "../controllers/HealthController.js";

export const setupHealthRoute = (app: Express) => {
    const healthRoute = Router();
    healthRoute.get("/test", healthController);
    app.use(healthRoute);
}
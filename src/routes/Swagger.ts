import path from "node:path";
import process from "node:process";
import swaggerJsdoc from "swagger-jsdoc";
import {Express} from "express";
import swaggerUi from "swagger-ui-express";

const setupSwagger = (expressApp: Express): void => {
    const swaggerOptions: swaggerJsdoc.Options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Invoice Generation API",
                version: "1.0.0",
                description: "API для создания и отправки счетов на оплату.",
            },
            servers: [
                {
                    url: "http://localhost:3001",
                    description: "Локальный сервер для разработки",
                },
            ],
            components: {
                schemas: {},
            },
        },
        apis: [
            path.join(process.cwd(), "server.ts"),
            path.join(process.cwd(), "schemas/*.ts"),
        ],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    expressApp.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default setupSwagger;
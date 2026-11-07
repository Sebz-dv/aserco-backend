"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const schema_1 = require("./database/schema");
async function startServer() {
    try {
        await (0, database_1.ensureDatabase)();
        await (0, schema_1.initializeSchema)();
        const app = (0, app_1.createApp)();
        app.listen(env_1.env.PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${env_1.env.PORT}`);
        });
    }
    catch (error) {
        console.error('No se pudo iniciar el servidor:', error);
        process.exit(1);
    }
}
startServer();

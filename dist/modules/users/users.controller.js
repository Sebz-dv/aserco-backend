"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = meController;
const users_service_1 = require("./users.service");
async function meController(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Usuario no autenticado.' });
        }
        const profile = await (0, users_service_1.getAuthenticatedUser)(user.id);
        return res.status(200).json({ user: profile });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error al consultar el usuario.' });
    }
}

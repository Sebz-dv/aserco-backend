"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'aserco-dev-secret';
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token faltante o inválido.' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.sub || !decoded.email || !decoded.name) {
            return res.status(401).json({ message: 'Token inválido o expirado.' });
        }
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
        };
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
}

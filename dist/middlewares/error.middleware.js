"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
function errorMiddleware(err, _req, res, _next) {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
}

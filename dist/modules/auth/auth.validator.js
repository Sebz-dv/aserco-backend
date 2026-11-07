"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
    email: zod_1.z.string().trim().email('Debe ingresar un email válido.'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Debe ingresar un email válido.'),
    password: zod_1.z.string().min(1, 'La contraseña es obligatoria.'),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'El refresh token es obligatorio.'),
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'aserco-dev-secret';
function createToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: '7d',
    });
}
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
        }
        const [existingRows] = await database_1.pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [String(email).trim().toLowerCase()]);
        if (existingRows.length > 0) {
            return res.status(409).json({ message: 'El correo ya está registrado.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(String(password), 10);
        const [result] = await database_1.pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [String(name).trim(), String(email).trim().toLowerCase(), passwordHash]);
        const user = {
            id: result.insertId,
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
        };
        const token = createToken(user);
        return res.status(201).json({
            message: 'Usuario creado correctamente.',
            token,
            user,
        });
    }
    catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: 'Error al registrar usuario.' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
        }
        const [rows] = await database_1.pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1', [String(email).trim().toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        const user = rows[0];
        const validPassword = await bcryptjs_1.default.compare(String(password), user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        const authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        return res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token: createToken(authUser),
            user: authUser,
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
});
router.get('/me', authMiddleware_1.verifyToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Usuario no autenticado.' });
        }
        return res.status(200).json({
            message: 'Usuario autenticado.',
            token: '',
            user,
        });
    }
    catch (error) {
        console.error('Error en /me:', error);
        return res.status(500).json({ message: 'Error al consultar usuario.' });
    }
});
exports.default = router;

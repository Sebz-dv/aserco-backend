"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_POLICY = void 0;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.validatePasswordPolicy = validatePasswordPolicy;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 10);
}
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function validatePasswordPolicy(password) {
    if (typeof password !== 'string' || !exports.PASSWORD_POLICY.test(password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial.');
    }
}

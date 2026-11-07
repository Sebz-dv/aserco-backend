"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthUser = registerAuthUser;
exports.loginAuthUser = loginAuthUser;
exports.validateToken = validateToken;
const crypto_1 = require("crypto");
const jwt_1 = require("../../utils/jwt");
const users_service_1 = require("../users/users.service");
async function registerAuthUser(name, email, password) {
    const user = await (0, users_service_1.registerUser)(name, email, password);
    const sessionId = (0, crypto_1.randomUUID)();
    const accessToken = (0, jwt_1.signAccessToken)({ sub: user.id, email: user.email, name: user.name, sessionId });
    const refreshToken = (0, jwt_1.signRefreshToken)({ sub: user.id, email: user.email, name: user.name, sessionId });
    return {
        user,
        accessToken,
        refreshToken,
    };
}
async function loginAuthUser(email, password) {
    const user = await (0, users_service_1.authenticateUser)(email, password);
    const sessionId = (0, crypto_1.randomUUID)();
    const accessToken = (0, jwt_1.signAccessToken)({ sub: user.id, email: user.email, name: user.name, sessionId });
    const refreshToken = (0, jwt_1.signRefreshToken)({ sub: user.id, email: user.email, name: user.name, sessionId });
    return {
        user,
        accessToken,
        refreshToken,
    };
}
function validateToken(token) {
    return (0, jwt_1.verifyToken)(token);
}

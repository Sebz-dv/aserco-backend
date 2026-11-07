"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const node_path_1 = __importDefault(require("node:path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const knowledge_routes_1 = __importDefault(require("./modules/knowledge/knowledge.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: true, credentials: true }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use('/uploads', express_1.default.static(node_path_1.default.resolve(process.cwd(), 'uploads')));
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.get('/api/health', (_req, res) => {
        res.json({ ok: true, message: 'API funcionando correctamente.' });
    });
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/users', users_routes_1.default);
    app.use('/api/admin', admin_routes_1.default);
    app.use('/api/knowledge', knowledge_routes_1.default);
    app.use((err, _req, res, _next) => {
        (0, error_middleware_1.errorMiddleware)(err, _req, res, _next);
    });
    return app;
}

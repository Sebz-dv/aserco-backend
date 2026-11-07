"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const users_controller_1 = require("./users.controller");
const router = (0, express_1.Router)();
router.get('/me', auth_middleware_1.authMiddleware, users_controller_1.meController);
exports.default = router;

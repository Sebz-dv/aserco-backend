"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const admin_middleware_1 = require("../../middlewares/admin.middleware");
const knowledge_controller_1 = require("./knowledge.controller");
const ensureKnowledgePermission = (permissionName) => {
    return (req, res, next) => {
        const permissions = req.user?.permissions ?? [];
        if (!permissions.includes(permissionName)) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a este módulo de conocimiento.' });
        }
        return next();
    };
};
const router = (0, express_1.Router)();
const uploadDir = node_path_1.default.resolve(process.cwd(), 'uploads', 'knowledge');
node_fs_1.default.mkdirSync(uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
        const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '');
        const extension = node_path_1.default.extname(safeName) || '';
        const baseName = node_path_1.default.basename(safeName, extension).slice(0, 80) || 'upload';
        const timestamp = Date.now();
        callback(null, `${baseName}-${timestamp}${extension}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        const isAllowed = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
        if (!isAllowed) {
            return callback(new Error('Solo se permiten imágenes y videos.'));
        }
        return callback(null, true);
    },
});
const hasKnowledgeUploadPermission = (req) => {
    const permissions = req.user?.permissions ?? [];
    return [
        'knowledge.articles.create',
        'knowledge.categories.manage',
        'knowledge.events.manage',
        'knowledge.resources.manage',
        'knowledge.media.manage',
    ].some((permission) => permissions.includes(permission));
};
router.post('/admin/upload', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, (req, res, next) => {
    if (!hasKnowledgeUploadPermission(req)) {
        return res.status(403).json({ message: 'No tienes permiso para subir archivos.' });
    }
    return next();
}, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Debes adjuntar un archivo de imagen o video.' });
    }
    const fileUrl = `/uploads/knowledge/${req.file.filename}`;
    return res.status(201).json({
        message: 'Archivo subido correctamente.',
        url: fileUrl,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
    });
});
router.get('/articles', knowledge_controller_1.listKnowledgeArticlesController);
router.get('/articles/:slug', knowledge_controller_1.getKnowledgeArticleController);
router.get('/categories', knowledge_controller_1.listKnowledgeCategoriesController);
router.get('/events', knowledge_controller_1.listKnowledgeEventsController);
router.get('/calls', knowledge_controller_1.listKnowledgeCallsController);
router.get('/resources', knowledge_controller_1.listKnowledgeResourcesController);
router.get('/media', knowledge_controller_1.listKnowledgeMediaController);
router.get('/admin/dashboard', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.dashboard.view'), knowledge_controller_1.getKnowledgeDashboardController);
router.post('/admin/articles', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.articles.create'), knowledge_controller_1.createKnowledgeArticleController);
router.patch('/admin/articles/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.articles.edit'), knowledge_controller_1.updateKnowledgeArticleController);
router.delete('/admin/articles/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.articles.edit'), knowledge_controller_1.deleteKnowledgeArticleController);
router.post('/admin/categories', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.categories.manage'), knowledge_controller_1.createKnowledgeCategoryController);
router.patch('/admin/categories/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.categories.manage'), knowledge_controller_1.updateKnowledgeCategoryController);
router.delete('/admin/categories/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.categories.manage'), knowledge_controller_1.deleteKnowledgeCategoryController);
router.post('/admin/events', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.events.manage'), knowledge_controller_1.createKnowledgeEventController);
router.patch('/admin/events/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.events.manage'), knowledge_controller_1.updateKnowledgeEventController);
router.delete('/admin/events/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.events.manage'), knowledge_controller_1.deleteKnowledgeEventController);
router.post('/admin/calls', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), knowledge_controller_1.createKnowledgeCallController);
router.patch('/admin/calls/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), knowledge_controller_1.updateKnowledgeCallController);
router.delete('/admin/calls/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), knowledge_controller_1.deleteKnowledgeCallController);
router.post('/admin/resources', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), knowledge_controller_1.createKnowledgeResourceController);
router.patch('/admin/resources/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), knowledge_controller_1.updateKnowledgeResourceController);
router.delete('/admin/resources/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), knowledge_controller_1.deleteKnowledgeResourceController);
router.post('/admin/media', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.media.manage'), knowledge_controller_1.createKnowledgeMediaController);
router.patch('/admin/media/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.media.manage'), knowledge_controller_1.updateKnowledgeMediaController);
router.delete('/admin/media/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, ensureKnowledgePermission('knowledge.media.manage'), knowledge_controller_1.deleteKnowledgeMediaController);
exports.default = router;

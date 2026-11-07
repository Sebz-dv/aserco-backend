import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import {
  createKnowledgeArticleController,
  createKnowledgeCallController,
  createKnowledgeCategoryController,
  createKnowledgeEventController,
  createKnowledgeMediaController,
  createKnowledgeResourceController,
  deleteKnowledgeArticleController,
  deleteKnowledgeCallController,
  deleteKnowledgeCategoryController,
  deleteKnowledgeEventController,
  deleteKnowledgeMediaController,
  deleteKnowledgeResourceController,
  getKnowledgeArticleController,
  getKnowledgeDashboardController,
  listKnowledgeArticlesController,
  listKnowledgeCallsController,
  listKnowledgeCategoriesController,
  listKnowledgeEventsController,
  listKnowledgeMediaController,
  listKnowledgeResourcesController,
  updateKnowledgeArticleController,
  updateKnowledgeCallController,
  updateKnowledgeCategoryController,
  updateKnowledgeEventController,
  updateKnowledgeMediaController,
  updateKnowledgeResourceController,
} from './knowledge.controller';

const ensureKnowledgePermission = (permissionName: string) => {
  return (req: any, res: any, next: () => void) => {
    const permissions = req.user?.permissions ?? [];
    if (!permissions.includes(permissionName)) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este módulo de conocimiento.' });
    }

    return next();
  };
};

const router = Router();

const uploadDir = path.resolve(process.cwd(), 'uploads', 'knowledge');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '');
    const extension = path.extname(safeName) || '';
    const baseName = path.basename(safeName, extension).slice(0, 80) || 'upload';
    const timestamp = Date.now();
    callback(null, `${baseName}-${timestamp}${extension}`);
  },
});

const upload = multer({
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

const hasKnowledgeUploadPermission = (req: any) => {
  const permissions = req.user?.permissions ?? [];
  return [
    'knowledge.articles.create',
    'knowledge.categories.manage',
    'knowledge.events.manage',
    'knowledge.resources.manage',
    'knowledge.media.manage',
  ].some((permission) => permissions.includes(permission));
};

router.post('/admin/upload', authMiddleware, adminMiddleware, (req: any, res: any, next: () => void) => {
  if (!hasKnowledgeUploadPermission(req)) {
    return res.status(403).json({ message: 'No tienes permiso para subir archivos.' });
  }

  return next();
}, upload.single('file'), (req: any, res: any) => {
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

router.get('/articles', listKnowledgeArticlesController);
router.get('/articles/:slug', getKnowledgeArticleController);
router.get('/categories', listKnowledgeCategoriesController);
router.get('/events', listKnowledgeEventsController);
router.get('/calls', listKnowledgeCallsController);
router.get('/resources', listKnowledgeResourcesController);
router.get('/media', listKnowledgeMediaController);

router.get('/admin/dashboard', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.dashboard.view'), getKnowledgeDashboardController);
router.post('/admin/articles', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.articles.create'), createKnowledgeArticleController);
router.patch('/admin/articles/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.articles.edit'), updateKnowledgeArticleController);
router.delete('/admin/articles/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.articles.edit'), deleteKnowledgeArticleController);
router.post('/admin/categories', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.categories.manage'), createKnowledgeCategoryController);
router.patch('/admin/categories/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.categories.manage'), updateKnowledgeCategoryController);
router.delete('/admin/categories/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.categories.manage'), deleteKnowledgeCategoryController);
router.post('/admin/events', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.events.manage'), createKnowledgeEventController);
router.patch('/admin/events/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.events.manage'), updateKnowledgeEventController);
router.delete('/admin/events/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.events.manage'), deleteKnowledgeEventController);
router.post('/admin/calls', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), createKnowledgeCallController);
router.patch('/admin/calls/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), updateKnowledgeCallController);
router.delete('/admin/calls/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), deleteKnowledgeCallController);
router.post('/admin/resources', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), createKnowledgeResourceController);
router.patch('/admin/resources/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), updateKnowledgeResourceController);
router.delete('/admin/resources/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.resources.manage'), deleteKnowledgeResourceController);
router.post('/admin/media', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.media.manage'), createKnowledgeMediaController);
router.patch('/admin/media/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.media.manage'), updateKnowledgeMediaController);
router.delete('/admin/media/:id', authMiddleware, adminMiddleware, ensureKnowledgePermission('knowledge.media.manage'), deleteKnowledgeMediaController);

export default router;

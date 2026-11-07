"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listKnowledgeArticlesController = listKnowledgeArticlesController;
exports.getKnowledgeArticleController = getKnowledgeArticleController;
exports.listKnowledgeCategoriesController = listKnowledgeCategoriesController;
exports.listKnowledgeEventsController = listKnowledgeEventsController;
exports.listKnowledgeCallsController = listKnowledgeCallsController;
exports.listKnowledgeResourcesController = listKnowledgeResourcesController;
exports.listKnowledgeMediaController = listKnowledgeMediaController;
exports.getKnowledgeDashboardController = getKnowledgeDashboardController;
exports.createKnowledgeArticleController = createKnowledgeArticleController;
exports.createKnowledgeCategoryController = createKnowledgeCategoryController;
exports.updateKnowledgeCategoryController = updateKnowledgeCategoryController;
exports.deleteKnowledgeCategoryController = deleteKnowledgeCategoryController;
exports.createKnowledgeEventController = createKnowledgeEventController;
exports.updateKnowledgeEventController = updateKnowledgeEventController;
exports.deleteKnowledgeEventController = deleteKnowledgeEventController;
exports.createKnowledgeCallController = createKnowledgeCallController;
exports.updateKnowledgeCallController = updateKnowledgeCallController;
exports.deleteKnowledgeCallController = deleteKnowledgeCallController;
exports.createKnowledgeResourceController = createKnowledgeResourceController;
exports.updateKnowledgeResourceController = updateKnowledgeResourceController;
exports.deleteKnowledgeResourceController = deleteKnowledgeResourceController;
exports.createKnowledgeMediaController = createKnowledgeMediaController;
exports.updateKnowledgeMediaController = updateKnowledgeMediaController;
exports.deleteKnowledgeMediaController = deleteKnowledgeMediaController;
exports.updateKnowledgeArticleController = updateKnowledgeArticleController;
exports.deleteKnowledgeArticleController = deleteKnowledgeArticleController;
const knowledge_service_1 = require("./knowledge.service");
async function listKnowledgeArticlesController(_req, res) {
    try {
        const articles = await (0, knowledge_service_1.listPublicKnowledgeArticles)();
        return res.status(200).json({ articles });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar artículos.' });
    }
}
async function getKnowledgeArticleController(req, res) {
    try {
        const article = await (0, knowledge_service_1.getPublicKnowledgeArticle)(String(req.params.slug ?? ''));
        if (!article) {
            return res.status(404).json({ message: 'Artículo no encontrado.' });
        }
        return res.status(200).json({ article });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al consultar el artículo.' });
    }
}
async function listKnowledgeCategoriesController(_req, res) {
    try {
        const categories = await (0, knowledge_service_1.listPublicKnowledgeCategories)();
        return res.status(200).json({ categories });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar categorías.' });
    }
}
async function listKnowledgeEventsController(_req, res) {
    try {
        const events = await (0, knowledge_service_1.listPublicKnowledgeEvents)();
        return res.status(200).json({ events });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar eventos.' });
    }
}
async function listKnowledgeCallsController(_req, res) {
    try {
        const calls = await (0, knowledge_service_1.listPublicKnowledgeCalls)();
        return res.status(200).json({ calls });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar convocatorias.' });
    }
}
async function listKnowledgeResourcesController(_req, res) {
    try {
        const resources = await (0, knowledge_service_1.listPublicKnowledgeResources)();
        return res.status(200).json({ resources });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar recursos.' });
    }
}
async function listKnowledgeMediaController(_req, res) {
    try {
        const media = await (0, knowledge_service_1.listPublicKnowledgeMedia)();
        return res.status(200).json({ media });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar multimedia.' });
    }
}
async function getKnowledgeDashboardController(_req, res) {
    try {
        const dashboard = await (0, knowledge_service_1.getKnowledgeAdminDashboard)();
        return res.status(200).json({ dashboard });
    }
    catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al consultar el dashboard.' });
    }
}
async function createKnowledgeArticleController(req, res) {
    try {
        const payload = req.body;
        const result = await (0, knowledge_service_1.createKnowledgeArticleEntry)({
            title: payload.title ?? '',
            subtitle: payload.subtitle,
            excerpt: payload.excerpt,
            content: payload.content,
            categoryId: payload.categoryId,
            authorName: payload.authorName,
            coverImageUrl: payload.coverImageUrl,
            seoTitle: payload.seoTitle,
            seoDescription: payload.seoDescription,
            status: payload.status,
            featured: payload.featured,
            readTime: payload.readTime,
            createdBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(201).json({ message: 'Artículo creado correctamente.', article: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el artículo.' });
    }
}
async function createKnowledgeCategoryController(req, res) {
    try {
        const { name, description, color, imageUrl } = req.body;
        const result = await (0, knowledge_service_1.createKnowledgeCategoryEntry)({
            name: name ?? '',
            description,
            color,
            imageUrl,
            createdBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(201).json({ message: 'Categoría creada correctamente.', category: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear la categoría.' });
    }
}
async function updateKnowledgeCategoryController(req, res) {
    try {
        const categoryId = Number(req.params.id ?? 0);
        const payload = req.body;
        const result = await (0, knowledge_service_1.updateKnowledgeCategoryEntry)(categoryId, {
            name: payload.name,
            description: payload.description,
            color: payload.color,
            imageUrl: payload.imageUrl,
            updatedBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(200).json({ message: 'Categoría actualizada correctamente.', category: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo actualizar la categoría.';
        return res.status(error instanceof Error && error.message === 'La categoría solicitada no existe.' ? 404 : 400).json({ message });
    }
}
async function deleteKnowledgeCategoryController(req, res) {
    try {
        const categoryId = Number(req.params.id ?? 0);
        const result = await (0, knowledge_service_1.deleteKnowledgeCategoryEntry)(categoryId);
        return res.status(200).json({ message: 'Categoría eliminada correctamente.', category: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar la categoría.';
        return res.status(error instanceof Error && error.message === 'La categoría solicitada no existe.' ? 404 : 400).json({ message });
    }
}
async function createKnowledgeEventController(req, res) {
    try {
        const payload = req.body;
        const result = await (0, knowledge_service_1.createKnowledgeEventEntry)({
            title: payload.title ?? '',
            summary: payload.summary,
            description: payload.description,
            eventDate: payload.eventDate,
            location: payload.location,
            isVirtual: payload.isVirtual,
            status: payload.status,
            coverImageUrl: payload.coverImageUrl,
            createdBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(201).json({ message: 'Evento creado correctamente.', event: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el evento.' });
    }
}
async function updateKnowledgeEventController(req, res) {
    try {
        const eventId = Number(req.params.id ?? 0);
        const payload = req.body;
        const result = await (0, knowledge_service_1.updateKnowledgeEventEntry)(eventId, { ...payload, updatedBy: Number(req.user?.id ?? 0) || null });
        return res.status(200).json({ message: 'Evento actualizado correctamente.', event: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo actualizar el evento.';
        return res.status(error instanceof Error && error.message === 'El evento solicitado no existe.' ? 404 : 400).json({ message });
    }
}
async function deleteKnowledgeEventController(req, res) {
    try {
        const eventId = Number(req.params.id ?? 0);
        const result = await (0, knowledge_service_1.deleteKnowledgeEventEntry)(eventId);
        return res.status(200).json({ message: 'Evento eliminado correctamente.', event: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar el evento.';
        return res.status(error instanceof Error && error.message === 'El evento solicitado no existe.' ? 404 : 400).json({ message });
    }
}
async function createKnowledgeCallController(req, res) {
    try {
        const payload = req.body;
        const result = await (0, knowledge_service_1.createKnowledgeCallEntry)({
            title: payload.title ?? '',
            summary: payload.summary,
            description: payload.description,
            startDate: payload.startDate,
            endDate: payload.endDate,
            status: payload.status,
            organization: payload.organization,
            createdBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(201).json({ message: 'Convocatoria creada correctamente.', call: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear la convocatoria.' });
    }
}
async function updateKnowledgeCallController(req, res) {
    try {
        const callId = Number(req.params.id ?? 0);
        const payload = req.body;
        const result = await (0, knowledge_service_1.updateKnowledgeCallEntry)(callId, { ...payload, updatedBy: Number(req.user?.id ?? 0) || null });
        return res.status(200).json({ message: 'Convocatoria actualizada correctamente.', call: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo actualizar la convocatoria.';
        return res.status(error instanceof Error && error.message === 'La convocatoria solicitada no existe.' ? 404 : 400).json({ message });
    }
}
async function deleteKnowledgeCallController(req, res) {
    try {
        const callId = Number(req.params.id ?? 0);
        const result = await (0, knowledge_service_1.deleteKnowledgeCallEntry)(callId);
        return res.status(200).json({ message: 'Convocatoria eliminada correctamente.', call: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar la convocatoria.';
        return res.status(error instanceof Error && error.message === 'La convocatoria solicitada no existe.' ? 404 : 400).json({ message });
    }
}
async function createKnowledgeResourceController(req, res) {
    try {
        const payload = req.body;
        const result = await (0, knowledge_service_1.createKnowledgeResourceEntry)({
            title: payload.title ?? '',
            summary: payload.summary,
            type: payload.type,
            fileUrl: payload.fileUrl,
            externalUrl: payload.externalUrl,
            status: payload.status,
            createdBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(201).json({ message: 'Recurso creado correctamente.', resource: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el recurso.' });
    }
}
async function updateKnowledgeResourceController(req, res) {
    try {
        const resourceId = Number(req.params.id ?? 0);
        const payload = req.body;
        const result = await (0, knowledge_service_1.updateKnowledgeResourceEntry)(resourceId, { ...payload, updatedBy: Number(req.user?.id ?? 0) || null });
        return res.status(200).json({ message: 'Recurso actualizado correctamente.', resource: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo actualizar el recurso.';
        return res.status(error instanceof Error && error.message === 'El recurso solicitado no existe.' ? 404 : 400).json({ message });
    }
}
async function deleteKnowledgeResourceController(req, res) {
    try {
        const resourceId = Number(req.params.id ?? 0);
        const result = await (0, knowledge_service_1.deleteKnowledgeResourceEntry)(resourceId);
        return res.status(200).json({ message: 'Recurso eliminado correctamente.', resource: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar el recurso.';
        return res.status(error instanceof Error && error.message === 'El recurso solicitado no existe.' ? 404 : 400).json({ message });
    }
}
async function createKnowledgeMediaController(req, res) {
    try {
        const payload = req.body;
        const result = await (0, knowledge_service_1.createKnowledgeMediaEntry)({
            title: payload.title ?? '',
            type: payload.type,
            url: payload.url,
            thumbnail: payload.thumbnail,
            description: payload.description,
            createdBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(201).json({ message: 'Multimedia creada correctamente.', media: result });
    }
    catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear la multimedia.' });
    }
}
async function updateKnowledgeMediaController(req, res) {
    try {
        const mediaId = Number(req.params.id ?? 0);
        const payload = req.body;
        const result = await (0, knowledge_service_1.updateKnowledgeMediaEntry)(mediaId, { ...payload, updatedBy: Number(req.user?.id ?? 0) || null });
        return res.status(200).json({ message: 'Multimedia actualizada correctamente.', media: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo actualizar la multimedia.';
        return res.status(error instanceof Error && error.message === 'El archivo multimedia solicitado no existe.' ? 404 : 400).json({ message });
    }
}
async function deleteKnowledgeMediaController(req, res) {
    try {
        const mediaId = Number(req.params.id ?? 0);
        const result = await (0, knowledge_service_1.deleteKnowledgeMediaEntry)(mediaId);
        return res.status(200).json({ message: 'Multimedia eliminada correctamente.', media: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar la multimedia.';
        return res.status(error instanceof Error && error.message === 'El archivo multimedia solicitado no existe.' ? 404 : 400).json({ message });
    }
}
async function updateKnowledgeArticleController(req, res) {
    try {
        const articleId = Number(req.params.id ?? 0);
        const payload = req.body;
        const result = await (0, knowledge_service_1.updateKnowledgeArticleEntry)(articleId, {
            title: payload.title,
            subtitle: payload.subtitle,
            excerpt: payload.excerpt,
            content: payload.content,
            categoryId: payload.categoryId,
            authorName: payload.authorName,
            coverImageUrl: payload.coverImageUrl,
            seoTitle: payload.seoTitle,
            seoDescription: payload.seoDescription,
            status: payload.status,
            featured: payload.featured,
            readTime: payload.readTime,
            updatedBy: Number(req.user?.id ?? 0) || null,
        });
        return res.status(200).json({ message: 'Artículo actualizado correctamente.', article: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo actualizar el artículo.';
        return res.status(error instanceof Error && error.message === 'El artículo solicitado no existe.' ? 404 : 400).json({ message });
    }
}
async function deleteKnowledgeArticleController(req, res) {
    try {
        const articleId = Number(req.params.id ?? 0);
        const result = await (0, knowledge_service_1.deleteKnowledgeArticleEntry)(articleId);
        return res.status(200).json({ message: 'Artículo eliminado correctamente.', article: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar el artículo.';
        return res.status(error instanceof Error && error.message === 'El artículo solicitado no existe.' ? 404 : 400).json({ message });
    }
}

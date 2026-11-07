"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildKnowledgeSlug = buildKnowledgeSlug;
exports.buildUniqueKnowledgeSlug = buildUniqueKnowledgeSlug;
exports.listPublicKnowledgeArticles = listPublicKnowledgeArticles;
exports.getPublicKnowledgeArticle = getPublicKnowledgeArticle;
exports.listPublicKnowledgeCategories = listPublicKnowledgeCategories;
exports.listPublicKnowledgeEvents = listPublicKnowledgeEvents;
exports.listPublicKnowledgeCalls = listPublicKnowledgeCalls;
exports.listPublicKnowledgeResources = listPublicKnowledgeResources;
exports.listPublicKnowledgeMedia = listPublicKnowledgeMedia;
exports.getKnowledgeAdminDashboard = getKnowledgeAdminDashboard;
exports.createKnowledgeArticleEntry = createKnowledgeArticleEntry;
exports.updateKnowledgeArticleEntry = updateKnowledgeArticleEntry;
exports.deleteKnowledgeArticleEntry = deleteKnowledgeArticleEntry;
exports.createKnowledgeCategoryEntry = createKnowledgeCategoryEntry;
exports.updateKnowledgeCategoryEntry = updateKnowledgeCategoryEntry;
exports.deleteKnowledgeCategoryEntry = deleteKnowledgeCategoryEntry;
exports.createKnowledgeEventEntry = createKnowledgeEventEntry;
exports.updateKnowledgeEventEntry = updateKnowledgeEventEntry;
exports.deleteKnowledgeEventEntry = deleteKnowledgeEventEntry;
exports.createKnowledgeCallEntry = createKnowledgeCallEntry;
exports.updateKnowledgeCallEntry = updateKnowledgeCallEntry;
exports.deleteKnowledgeCallEntry = deleteKnowledgeCallEntry;
exports.createKnowledgeResourceEntry = createKnowledgeResourceEntry;
exports.updateKnowledgeResourceEntry = updateKnowledgeResourceEntry;
exports.deleteKnowledgeResourceEntry = deleteKnowledgeResourceEntry;
exports.createKnowledgeMediaEntry = createKnowledgeMediaEntry;
exports.updateKnowledgeMediaEntry = updateKnowledgeMediaEntry;
exports.deleteKnowledgeMediaEntry = deleteKnowledgeMediaEntry;
exports.insertKnowledgeAuditLog = insertKnowledgeAuditLog;
const database_1 = require("../../config/database");
const knowledge_repository_1 = require("./knowledge.repository");
function buildKnowledgeSlug(title) {
    return title
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 120);
}
function buildUniqueKnowledgeSlug(baseSlug, existingSlugs = []) {
    const normalizedBase = String(baseSlug ?? '').trim();
    if (!normalizedBase) {
        return normalizedBase;
    }
    const existingSet = new Set(existingSlugs.map((slug) => String(slug ?? '').trim()).filter(Boolean));
    if (!existingSet.has(normalizedBase)) {
        return normalizedBase;
    }
    let candidate = normalizedBase;
    let nextSuffix = 2;
    while (existingSet.has(candidate)) {
        candidate = `${normalizedBase}-${nextSuffix}`;
        nextSuffix += 1;
    }
    return candidate;
}
async function listPublicKnowledgeArticles({ limit = 9, offset = 0, categorySlug, } = {}) {
    return (0, knowledge_repository_1.listKnowledgeArticles)({ limit, offset, categorySlug, status: 'published' });
}
async function getPublicKnowledgeArticle(slug) {
    return (0, knowledge_repository_1.getKnowledgeArticleBySlug)(slug);
}
async function listPublicKnowledgeCategories() {
    return (0, knowledge_repository_1.listKnowledgeCategories)();
}
async function listPublicKnowledgeEvents() {
    return (0, knowledge_repository_1.listKnowledgeEvents)();
}
async function listPublicKnowledgeCalls() {
    return (0, knowledge_repository_1.listKnowledgeCalls)();
}
async function listPublicKnowledgeResources() {
    return (0, knowledge_repository_1.listKnowledgeResources)();
}
async function listPublicKnowledgeMedia() {
    return (0, knowledge_repository_1.listKnowledgeMedia)();
}
async function getKnowledgeAdminDashboard() {
    return (0, knowledge_repository_1.getKnowledgeDashboardSummary)();
}
async function createKnowledgeArticleEntry(payload) {
    const title = String(payload.title ?? '').trim();
    if (!title) {
        throw new Error('El título del artículo es obligatorio.');
    }
    const slug = buildKnowledgeSlug(title);
    if (!slug) {
        throw new Error('No se pudo generar un slug válido para el artículo.');
    }
    const { id, slug: uniqueSlug } = await (0, knowledge_repository_1.createKnowledgeArticle)({
        title,
        slug,
        subtitle: payload.subtitle,
        excerpt: payload.excerpt,
        content: payload.content,
        categoryId: payload.categoryId,
        authorId: payload.authorId,
        authorName: payload.authorName,
        coverImageUrl: payload.coverImageUrl,
        seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription,
        status: payload.status ?? 'draft',
        featured: payload.featured ?? false,
        readTime: payload.readTime,
        createdBy: payload.createdBy,
    });
    return { id, slug: uniqueSlug };
}
async function updateKnowledgeArticleEntry(articleId, payload) {
    if (!Number.isFinite(articleId) || Number(articleId) <= 0) {
        throw new Error('El artículo solicitado no existe.');
    }
    const result = await (0, knowledge_repository_1.updateKnowledgeArticle)(Number(articleId), payload);
    return result;
}
async function deleteKnowledgeArticleEntry(articleId) {
    if (!Number.isFinite(articleId) || Number(articleId) <= 0) {
        throw new Error('El artículo solicitado no existe.');
    }
    return (0, knowledge_repository_1.deleteKnowledgeArticle)(Number(articleId));
}
async function createKnowledgeCategoryEntry(payload) {
    const name = String(payload.name ?? '').trim();
    if (!name) {
        throw new Error('El nombre de la categoría es obligatorio.');
    }
    const slug = buildKnowledgeSlug(name);
    const { id, slug: uniqueSlug } = await (0, knowledge_repository_1.createKnowledgeCategory)({
        name,
        slug,
        description: payload.description,
        color: payload.color,
        imageUrl: payload.imageUrl,
        createdBy: payload.createdBy,
    });
    return { id, slug: uniqueSlug };
}
async function updateKnowledgeCategoryEntry(categoryId, payload) {
    if (!Number.isFinite(categoryId) || Number(categoryId) <= 0) {
        throw new Error('La categoría solicitada no existe.');
    }
    return (0, knowledge_repository_1.updateKnowledgeCategory)(Number(categoryId), payload);
}
async function deleteKnowledgeCategoryEntry(categoryId) {
    if (!Number.isFinite(categoryId) || Number(categoryId) <= 0) {
        throw new Error('La categoría solicitada no existe.');
    }
    return (0, knowledge_repository_1.deleteKnowledgeCategory)(Number(categoryId));
}
async function createKnowledgeEventEntry(payload) {
    const title = String(payload.title ?? '').trim();
    if (!title)
        throw new Error('El título del evento es obligatorio.');
    const slug = buildKnowledgeSlug(title);
    const { id, slug: uniqueSlug } = await (0, knowledge_repository_1.createKnowledgeEvent)({
        title,
        slug,
        summary: payload.summary,
        description: payload.description,
        eventDate: payload.eventDate,
        location: payload.location,
        isVirtual: payload.isVirtual,
        status: payload.status,
        coverImageUrl: payload.coverImageUrl,
        createdBy: payload.createdBy,
    });
    return { id, slug: uniqueSlug };
}
async function updateKnowledgeEventEntry(eventId, payload) {
    if (!Number.isFinite(eventId) || Number(eventId) <= 0)
        throw new Error('El evento solicitado no existe.');
    return (0, knowledge_repository_1.updateKnowledgeEvent)(Number(eventId), payload);
}
async function deleteKnowledgeEventEntry(eventId) {
    if (!Number.isFinite(eventId) || Number(eventId) <= 0)
        throw new Error('El evento solicitado no existe.');
    return (0, knowledge_repository_1.deleteKnowledgeEvent)(Number(eventId));
}
async function createKnowledgeCallEntry(payload) {
    const title = String(payload.title ?? '').trim();
    if (!title)
        throw new Error('El título de la convocatoria es obligatorio.');
    const slug = buildKnowledgeSlug(title);
    const { id, slug: uniqueSlug } = await (0, knowledge_repository_1.createKnowledgeCall)({
        title,
        slug,
        summary: payload.summary,
        description: payload.description,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: payload.status,
        organization: payload.organization,
        createdBy: payload.createdBy,
    });
    return { id, slug: uniqueSlug };
}
async function updateKnowledgeCallEntry(callId, payload) {
    if (!Number.isFinite(callId) || Number(callId) <= 0)
        throw new Error('La convocatoria solicitada no existe.');
    return (0, knowledge_repository_1.updateKnowledgeCall)(Number(callId), payload);
}
async function deleteKnowledgeCallEntry(callId) {
    if (!Number.isFinite(callId) || Number(callId) <= 0)
        throw new Error('La convocatoria solicitada no existe.');
    return (0, knowledge_repository_1.deleteKnowledgeCall)(Number(callId));
}
async function createKnowledgeResourceEntry(payload) {
    const title = String(payload.title ?? '').trim();
    if (!title)
        throw new Error('El título del recurso es obligatorio.');
    const slug = buildKnowledgeSlug(title);
    const { id, slug: uniqueSlug } = await (0, knowledge_repository_1.createKnowledgeResource)({
        title,
        slug,
        summary: payload.summary,
        type: payload.type,
        fileUrl: payload.fileUrl,
        externalUrl: payload.externalUrl,
        status: payload.status,
        createdBy: payload.createdBy,
    });
    return { id, slug: uniqueSlug };
}
async function updateKnowledgeResourceEntry(resourceId, payload) {
    if (!Number.isFinite(resourceId) || Number(resourceId) <= 0)
        throw new Error('El recurso solicitado no existe.');
    return (0, knowledge_repository_1.updateKnowledgeResource)(Number(resourceId), payload);
}
async function deleteKnowledgeResourceEntry(resourceId) {
    if (!Number.isFinite(resourceId) || Number(resourceId) <= 0)
        throw new Error('El recurso solicitado no existe.');
    return (0, knowledge_repository_1.deleteKnowledgeResource)(Number(resourceId));
}
async function createKnowledgeMediaEntry(payload) {
    const title = String(payload.title ?? '').trim();
    if (!title)
        throw new Error('El título de la multimedia es obligatorio.');
    const id = await (0, knowledge_repository_1.createKnowledgeMedia)({
        title,
        type: payload.type,
        url: payload.url,
        thumbnail: payload.thumbnail,
        description: payload.description,
        createdBy: payload.createdBy,
    });
    return { id };
}
async function updateKnowledgeMediaEntry(mediaId, payload) {
    if (!Number.isFinite(mediaId) || Number(mediaId) <= 0)
        throw new Error('El archivo multimedia solicitado no existe.');
    return (0, knowledge_repository_1.updateKnowledgeMedia)(Number(mediaId), payload);
}
async function deleteKnowledgeMediaEntry(mediaId) {
    if (!Number.isFinite(mediaId) || Number(mediaId) <= 0)
        throw new Error('El archivo multimedia solicitado no existe.');
    return (0, knowledge_repository_1.deleteKnowledgeMedia)(Number(mediaId));
}
async function insertKnowledgeAuditLog({ entityType, entityId, action, performedBy, details, }) {
    await database_1.pool.query(`
      INSERT INTO knowledge_audit_logs (entity_type, entity_id, action, performed_by, details, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [entityType, String(entityId), action, performedBy ?? null, details ?? null]);
}

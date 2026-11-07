import { pool } from '../../config/database';
import {
  createKnowledgeArticle,
  createKnowledgeCall,
  createKnowledgeCategory,
  createKnowledgeEvent,
  createKnowledgeMedia,
  createKnowledgeResource,
  deleteKnowledgeArticle,
  deleteKnowledgeCall,
  deleteKnowledgeCategory,
  deleteKnowledgeEvent,
  deleteKnowledgeMedia,
  deleteKnowledgeResource,
  getKnowledgeArticleBySlug,
  getKnowledgeDashboardSummary,
  listKnowledgeArticles,
  listKnowledgeCalls,
  listKnowledgeCategories,
  listKnowledgeEvents,
  listKnowledgeMedia,
  listKnowledgeResources,
  updateKnowledgeArticle,
  updateKnowledgeCall,
  updateKnowledgeCategory,
  updateKnowledgeEvent,
  updateKnowledgeMedia,
  updateKnowledgeResource,
} from './knowledge.repository';
import type { KnowledgeArticle, KnowledgeCategory, KnowledgeCall, KnowledgeEvent, KnowledgeMedia, KnowledgeResource } from './knowledge.types';

export function buildKnowledgeSlug(title: string) {
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

export function buildUniqueKnowledgeSlug(baseSlug: string, existingSlugs: string[] = []) {
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

export async function listPublicKnowledgeArticles({
  limit = 9,
  offset = 0,
  categorySlug,
}: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
} = {}): Promise<KnowledgeArticle[]> {
  return listKnowledgeArticles({ limit, offset, categorySlug, status: 'published' });
}

export async function getPublicKnowledgeArticle(slug: string): Promise<KnowledgeArticle | null> {
  return getKnowledgeArticleBySlug(slug);
}

export async function listPublicKnowledgeCategories(): Promise<KnowledgeCategory[]> {
  return listKnowledgeCategories();
}

export async function listPublicKnowledgeEvents(): Promise<KnowledgeEvent[]> {
  return listKnowledgeEvents();
}

export async function listPublicKnowledgeCalls(): Promise<KnowledgeCall[]> {
  return listKnowledgeCalls();
}

export async function listPublicKnowledgeResources(): Promise<KnowledgeResource[]> {
  return listKnowledgeResources();
}

export async function listPublicKnowledgeMedia(): Promise<KnowledgeMedia[]> {
  return listKnowledgeMedia();
}

export async function getKnowledgeAdminDashboard() {
  return getKnowledgeDashboardSummary();
}

export async function createKnowledgeArticleEntry(payload: {
  title: string;
  subtitle?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number | null;
  authorId?: number | null;
  authorName?: string | null;
  coverImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
  featured?: boolean;
  readTime?: number;
  createdBy?: number | null;
}) {
  const title = String(payload.title ?? '').trim();
  if (!title) {
    throw new Error('El título del artículo es obligatorio.');
  }

  const slug = buildKnowledgeSlug(title);
  if (!slug) {
    throw new Error('No se pudo generar un slug válido para el artículo.');
  }

  const { id, slug: uniqueSlug } = await createKnowledgeArticle({
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

export async function updateKnowledgeArticleEntry(articleId: number, payload: {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number | null;
  authorName?: string | null;
  coverImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
  featured?: boolean;
  readTime?: number;
  updatedBy?: number | null;
}) {
  if (!Number.isFinite(articleId) || Number(articleId) <= 0) {
    throw new Error('El artículo solicitado no existe.');
  }

  const result = await updateKnowledgeArticle(Number(articleId), payload);
  return result;
}

export async function deleteKnowledgeArticleEntry(articleId: number) {
  if (!Number.isFinite(articleId) || Number(articleId) <= 0) {
    throw new Error('El artículo solicitado no existe.');
  }

  return deleteKnowledgeArticle(Number(articleId));
}

export async function createKnowledgeCategoryEntry(payload: {
  name: string;
  description?: string;
  color?: string;
  imageUrl?: string;
  createdBy?: number | null;
}) {
  const name = String(payload.name ?? '').trim();
  if (!name) {
    throw new Error('El nombre de la categoría es obligatorio.');
  }

  const slug = buildKnowledgeSlug(name);
  const { id, slug: uniqueSlug } = await createKnowledgeCategory({
    name,
    slug,
    description: payload.description,
    color: payload.color,
    imageUrl: payload.imageUrl,
    createdBy: payload.createdBy,
  });

  return { id, slug: uniqueSlug };
}

export async function updateKnowledgeCategoryEntry(categoryId: number, payload: {
  name?: string;
  description?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  updatedBy?: number | null;
}) {
  if (!Number.isFinite(categoryId) || Number(categoryId) <= 0) {
    throw new Error('La categoría solicitada no existe.');
  }

  return updateKnowledgeCategory(Number(categoryId), payload);
}

export async function deleteKnowledgeCategoryEntry(categoryId: number) {
  if (!Number.isFinite(categoryId) || Number(categoryId) <= 0) {
    throw new Error('La categoría solicitada no existe.');
  }

  return deleteKnowledgeCategory(Number(categoryId));
}

export async function createKnowledgeEventEntry(payload: {
  title: string;
  summary?: string;
  description?: string;
  eventDate?: string | null;
  location?: string | null;
  isVirtual?: boolean;
  status?: string;
  coverImageUrl?: string | null;
  createdBy?: number | null;
}) {
  const title = String(payload.title ?? '').trim();
  if (!title) throw new Error('El título del evento es obligatorio.');

  const slug = buildKnowledgeSlug(title);
  const { id, slug: uniqueSlug } = await createKnowledgeEvent({
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

export async function updateKnowledgeEventEntry(eventId: number, payload: {
  title?: string;
  summary?: string | null;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  isVirtual?: boolean;
  status?: string;
  coverImageUrl?: string | null;
  updatedBy?: number | null;
}) {
  if (!Number.isFinite(eventId) || Number(eventId) <= 0) throw new Error('El evento solicitado no existe.');
  return updateKnowledgeEvent(Number(eventId), payload);
}

export async function deleteKnowledgeEventEntry(eventId: number) {
  if (!Number.isFinite(eventId) || Number(eventId) <= 0) throw new Error('El evento solicitado no existe.');
  return deleteKnowledgeEvent(Number(eventId));
}

export async function createKnowledgeCallEntry(payload: {
  title: string;
  summary?: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  organization?: string | null;
  createdBy?: number | null;
}) {
  const title = String(payload.title ?? '').trim();
  if (!title) throw new Error('El título de la convocatoria es obligatorio.');

  const slug = buildKnowledgeSlug(title);
  const { id, slug: uniqueSlug } = await createKnowledgeCall({
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

export async function updateKnowledgeCallEntry(callId: number, payload: {
  title?: string;
  summary?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  organization?: string | null;
  updatedBy?: number | null;
}) {
  if (!Number.isFinite(callId) || Number(callId) <= 0) throw new Error('La convocatoria solicitada no existe.');
  return updateKnowledgeCall(Number(callId), payload);
}

export async function deleteKnowledgeCallEntry(callId: number) {
  if (!Number.isFinite(callId) || Number(callId) <= 0) throw new Error('La convocatoria solicitada no existe.');
  return deleteKnowledgeCall(Number(callId));
}

export async function createKnowledgeResourceEntry(payload: {
  title: string;
  summary?: string;
  type?: string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  status?: string;
  createdBy?: number | null;
}) {
  const title = String(payload.title ?? '').trim();
  if (!title) throw new Error('El título del recurso es obligatorio.');

  const slug = buildKnowledgeSlug(title);
  const { id, slug: uniqueSlug } = await createKnowledgeResource({
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

export async function updateKnowledgeResourceEntry(resourceId: number, payload: {
  title?: string;
  summary?: string | null;
  type?: string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  status?: string;
  updatedBy?: number | null;
}) {
  if (!Number.isFinite(resourceId) || Number(resourceId) <= 0) throw new Error('El recurso solicitado no existe.');
  return updateKnowledgeResource(Number(resourceId), payload);
}

export async function deleteKnowledgeResourceEntry(resourceId: number) {
  if (!Number.isFinite(resourceId) || Number(resourceId) <= 0) throw new Error('El recurso solicitado no existe.');
  return deleteKnowledgeResource(Number(resourceId));
}

export async function createKnowledgeMediaEntry(payload: {
  title: string;
  type?: string;
  url?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  createdBy?: number | null;
}) {
  const title = String(payload.title ?? '').trim();
  if (!title) throw new Error('El título de la multimedia es obligatorio.');

  const id = await createKnowledgeMedia({
    title,
    type: payload.type,
    url: payload.url,
    thumbnail: payload.thumbnail,
    description: payload.description,
    createdBy: payload.createdBy,
  });

  return { id };
}

export async function updateKnowledgeMediaEntry(mediaId: number, payload: {
  title?: string;
  type?: string;
  url?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  updatedBy?: number | null;
}) {
  if (!Number.isFinite(mediaId) || Number(mediaId) <= 0) throw new Error('El archivo multimedia solicitado no existe.');
  return updateKnowledgeMedia(Number(mediaId), payload);
}

export async function deleteKnowledgeMediaEntry(mediaId: number) {
  if (!Number.isFinite(mediaId) || Number(mediaId) <= 0) throw new Error('El archivo multimedia solicitado no existe.');
  return deleteKnowledgeMedia(Number(mediaId));
}

export async function insertKnowledgeAuditLog({
  entityType,
  entityId,
  action,
  performedBy,
  details,
}: {
  entityType: string;
  entityId: number | string;
  action: string;
  performedBy: number | null;
  details?: string;
}) {
  await pool.query(
    `
      INSERT INTO knowledge_audit_logs (entity_type, entity_id, action, performed_by, details, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `,
    [entityType, String(entityId), action, performedBy ?? null, details ?? null],
  );
}

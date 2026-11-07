import { pool } from '../../config/database';
import type { KnowledgeArticle, KnowledgeCall, KnowledgeCategory, KnowledgeEvent, KnowledgeMedia, KnowledgeResource } from './knowledge.types';

function buildKnowledgeSlug(title: string) {
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

async function getExistingKnowledgeSlugs(tableName: string, excludeId?: number) {
  const whereClauses: string[] = [];
  const params: Array<string | number> = [];

  if (typeof excludeId === 'number' && Number.isFinite(excludeId)) {
    whereClauses.push('id != ?');
    params.push(excludeId);
  }

  const [rows] = (await pool.query(
    `SELECT slug FROM ${tableName}${whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : ''}`,
    params,
  )) as [Array<{ slug: string }>, unknown];

  return rows.map((row) => row.slug).filter(Boolean);
}

async function buildUniqueKnowledgeSlug(tableName: string, baseSlug: string, excludeId?: number) {
  const normalizedBase = String(baseSlug ?? '').trim();
  if (!normalizedBase) {
    return normalizedBase;
  }

  const existingSlugs = await getExistingKnowledgeSlugs(tableName, excludeId);
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

export async function getKnowledgeDashboardSummary() {
  const [articleCounts] = (await pool.query(
    `
      SELECT
        COUNT(*) AS total_articles,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_articles,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_articles,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) AS review_articles
      FROM knowledge_articles
    `,
  )) as [Array<{ total_articles: number; published_articles: number; draft_articles: number; review_articles: number }>, unknown];

  const [eventCounts] = (await pool.query(
    `SELECT COUNT(*) AS total_events FROM knowledge_events WHERE status IN ('upcoming', 'ongoing', 'completed')`,
  )) as [Array<{ total_events: number }>, unknown];

  const [callCounts] = (await pool.query(
    `SELECT COUNT(*) AS total_calls FROM knowledge_calls WHERE status = 'active'`,
  )) as [Array<{ total_calls: number }>, unknown];

  return {
    totalArticles: Number(articleCounts[0]?.total_articles ?? 0),
    publishedArticles: Number(articleCounts[0]?.published_articles ?? 0),
    draftArticles: Number(articleCounts[0]?.draft_articles ?? 0),
    reviewArticles: Number(articleCounts[0]?.review_articles ?? 0),
    totalEvents: Number(eventCounts[0]?.total_events ?? 0),
    totalCalls: Number(callCounts[0]?.total_calls ?? 0),
  };
}

export async function listKnowledgeCategories(): Promise<KnowledgeCategory[]> {
  const [rows] = (await pool.query(
    `
      SELECT id, slug, name, description, color, image_url, created_at
      FROM knowledge_categories
      ORDER BY name ASC
    `,
  )) as [Array<KnowledgeCategory>, unknown];

  return rows;
}

export async function listKnowledgeArticles({
  limit = 9,
  offset = 0,
  categorySlug,
  status = 'published',
}: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  status?: string;
} = {}): Promise<KnowledgeArticle[]> {
  let query = `
    SELECT a.*, c.name AS category_name, c.slug AS category_slug
    FROM knowledge_articles a
    LEFT JOIN knowledge_categories c ON c.id = a.category_id
    WHERE a.status = ?
  `;
  const params: Array<string | number> = [status];

  if (categorySlug) {
    query += ' AND c.slug = ?';
    params.push(categorySlug);
  }

  query += ' ORDER BY a.published_at DESC, a.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = (await pool.query(query, params)) as [Array<any>, unknown];

  return rows.map((row) => ({
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? null,
    excerpt: row.excerpt ?? null,
    content: row.content ?? null,
    status: row.status,
    featured: Number(row.featured ?? 0),
    category_id: row.category_id ?? null,
    category_name: row.category_name ?? null,
    category_slug: row.category_slug ?? null,
    author_id: row.author_id ?? null,
    author_name: row.author_name ?? null,
    cover_image_url: row.cover_image_url ?? null,
    read_time: row.read_time ?? null,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    published_at: row.published_at ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }));
}

export async function getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | null> {
  const [rows] = (await pool.query(
    `
      SELECT a.*, c.name AS category_name, c.slug AS category_slug
      FROM knowledge_articles a
      LEFT JOIN knowledge_categories c ON c.id = a.category_id
      WHERE a.slug = ?
      LIMIT 1
    `,
    [slug],
  )) as [Array<any>, unknown];

  const row = rows[0];
  if (!row) return null;

  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? null,
    excerpt: row.excerpt ?? null,
    content: row.content ?? null,
    status: row.status,
    featured: Number(row.featured ?? 0),
    category_id: row.category_id ?? null,
    category_name: row.category_name ?? null,
    category_slug: row.category_slug ?? null,
    author_id: row.author_id ?? null,
    author_name: row.author_name ?? null,
    cover_image_url: row.cover_image_url ?? null,
    read_time: row.read_time ?? null,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    published_at: row.published_at ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export async function listKnowledgeEvents(): Promise<KnowledgeEvent[]> {
  const [rows] = (await pool.query(
    `SELECT * FROM knowledge_events ORDER BY event_date DESC, created_at DESC LIMIT 6`,
  )) as [Array<KnowledgeEvent>, unknown];

  return rows;
}

export async function listKnowledgeCalls(): Promise<KnowledgeCall[]> {
  const [rows] = (await pool.query(
    `SELECT * FROM knowledge_calls ORDER BY start_date DESC, created_at DESC LIMIT 6`,
  )) as [Array<KnowledgeCall>, unknown];

  return rows;
}

export async function listKnowledgeResources(): Promise<KnowledgeResource[]> {
  const [rows] = (await pool.query(
    `SELECT * FROM knowledge_resources ORDER BY created_at DESC LIMIT 8`,
  )) as [Array<KnowledgeResource>, unknown];

  return rows;
}

export async function listKnowledgeMedia(): Promise<KnowledgeMedia[]> {
  const [rows] = (await pool.query(
    `SELECT * FROM knowledge_media ORDER BY created_at DESC LIMIT 8`,
  )) as [Array<KnowledgeMedia>, unknown];

  return rows;
}

export async function getKnowledgeArticleById(id: number): Promise<KnowledgeArticle | null> {
  const [rows] = (await pool.query(
    `
      SELECT a.*, c.name AS category_name, c.slug AS category_slug
      FROM knowledge_articles a
      LEFT JOIN knowledge_categories c ON c.id = a.category_id
      WHERE a.id = ?
      LIMIT 1
    `,
    [id],
  )) as [Array<any>, unknown];

  const row = rows[0];
  if (!row) return null;

  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? null,
    excerpt: row.excerpt ?? null,
    content: row.content ?? null,
    status: row.status,
    featured: Number(row.featured ?? 0),
    category_id: row.category_id ?? null,
    category_name: row.category_name ?? null,
    category_slug: row.category_slug ?? null,
    author_id: row.author_id ?? null,
    author_name: row.author_name ?? null,
    cover_image_url: row.cover_image_url ?? null,
    read_time: row.read_time ?? null,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    published_at: row.published_at ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export async function createKnowledgeArticle(payload: {
  title: string;
  slug: string;
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
  const uniqueSlug = await buildUniqueKnowledgeSlug('knowledge_articles', payload.slug || buildKnowledgeSlug(payload.title));

  const [result] = (await pool.query(
    `
      INSERT INTO knowledge_articles (
        slug, title, subtitle, excerpt, content, status, featured, category_id, author_id, author_name,
        cover_image_url, read_time, seo_title, seo_description, created_by, updated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [
      uniqueSlug,
      payload.title,
      payload.subtitle ?? null,
      payload.excerpt ?? null,
      payload.content ?? null,
      payload.status ?? 'draft',
      payload.featured ? 1 : 0,
      payload.categoryId ?? null,
      payload.authorId ?? null,
      payload.authorName ?? null,
      payload.coverImageUrl ?? null,
      payload.readTime ?? null,
      payload.seoTitle ?? null,
      payload.seoDescription ?? null,
      payload.createdBy ?? null,
      payload.createdBy ?? null,
    ],
  )) as [{ insertId: number }, unknown];

  return { id: result.insertId, slug: uniqueSlug };
}

export async function updateKnowledgeArticle(id: number, payload: {
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
  const existing = await getKnowledgeArticleById(id);
  if (!existing) {
    throw new Error('El artículo solicitado no existe.');
  }

  const title = payload.title !== undefined ? String(payload.title ?? '').trim() : existing.title;
  if (!title) {
    throw new Error('El título del artículo es obligatorio.');
  }

  const baseSlug = payload.title !== undefined ? buildKnowledgeSlug(title) : existing.slug;
  const slug = await buildUniqueKnowledgeSlug('knowledge_articles', baseSlug, id);
  const status = payload.status ?? existing.status;
  const featured = payload.featured !== undefined ? (payload.featured ? 1 : 0) : Number(existing.featured ?? 0);
  const categoryId = payload.categoryId ?? existing.category_id ?? null;
  const authorName = payload.authorName ?? existing.author_name ?? null;
  const coverImageUrl = payload.coverImageUrl ?? existing.cover_image_url ?? null;
  const readTime = payload.readTime ?? existing.read_time ?? null;
  const seoTitle = payload.seoTitle ?? existing.seo_title ?? null;
  const seoDescription = payload.seoDescription ?? existing.seo_description ?? null;
  const subtitle = payload.subtitle ?? existing.subtitle ?? null;
  const excerpt = payload.excerpt ?? existing.excerpt ?? null;
  const content = payload.content ?? existing.content ?? null;

  await pool.query(
    `
      UPDATE knowledge_articles
      SET slug = ?, title = ?, subtitle = ?, excerpt = ?, content = ?, status = ?, featured = ?, category_id = ?,
          author_name = ?, cover_image_url = ?, read_time = ?, seo_title = ?, seo_description = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `,
    [slug, title, subtitle, excerpt, content, status, featured, categoryId, authorName, coverImageUrl, readTime, seoTitle, seoDescription, payload.updatedBy ?? null, id],
  );

  return { id, slug };
}

export async function deleteKnowledgeArticle(id: number) {
  const existing = await getKnowledgeArticleById(id);
  if (!existing) {
    throw new Error('El artículo solicitado no existe.');
  }

  const [result] = (await pool.query('DELETE FROM knowledge_articles WHERE id = ?', [id])) as [{ affectedRows: number }, unknown];
  return { deleted: result.affectedRows > 0, id };
}

export async function createKnowledgeCategory(payload: {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  imageUrl?: string;
  createdBy?: number | null;
}) {
  const uniqueSlug = await buildUniqueKnowledgeSlug('knowledge_categories', payload.slug || buildKnowledgeSlug(payload.name));

  const [result] = (await pool.query(
    `
      INSERT INTO knowledge_categories (slug, name, description, color, image_url, created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [uniqueSlug, payload.name, payload.description ?? null, payload.color ?? '#3163a2', payload.imageUrl ?? null, payload.createdBy ?? null, payload.createdBy ?? null],
  )) as [{ insertId: number }, unknown];

  return { id: result.insertId, slug: uniqueSlug };
}

export async function getKnowledgeCategoryById(id: number): Promise<KnowledgeCategory | null> {
  const [rows] = (await pool.query(
    `SELECT id, slug, name, description, color, image_url, created_at FROM knowledge_categories WHERE id = ? LIMIT 1`,
    [id],
  )) as [Array<KnowledgeCategory>, unknown];

  return rows[0] ?? null;
}

export async function updateKnowledgeCategory(id: number, payload: {
  name?: string;
  description?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  updatedBy?: number | null;
}) {
  const existing = await getKnowledgeCategoryById(id);
  if (!existing) {
    throw new Error('La categoría solicitada no existe.');
  }

  const name = payload.name !== undefined ? String(payload.name ?? '').trim() : existing.name;
  if (!name) {
    throw new Error('El nombre de la categoría es obligatorio.');
  }

  const baseSlug = payload.name !== undefined ? buildKnowledgeSlug(name) : existing.slug || buildKnowledgeSlug(name);
  const slug = await buildUniqueKnowledgeSlug('knowledge_categories', baseSlug, id);

  await pool.query(
    `
      UPDATE knowledge_categories
      SET slug = ?, name = ?, description = ?, color = ?, image_url = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `,
    [slug, name, payload.description ?? existing.description ?? null, payload.color ?? existing.color ?? '#3163a2', payload.imageUrl ?? existing.image_url ?? null, payload.updatedBy ?? null, id],
  );

  return { id, slug, name };
}

export async function deleteKnowledgeCategory(id: number) {
  const existing = await getKnowledgeCategoryById(id);
  if (!existing) {
    throw new Error('La categoría solicitada no existe.');
  }

  const [result] = (await pool.query('DELETE FROM knowledge_categories WHERE id = ?', [id])) as [{ affectedRows: number }, unknown];
  return { deleted: result.affectedRows > 0, id };
}

export async function createKnowledgeEvent(payload: {
  slug: string;
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
  const uniqueSlug = await buildUniqueKnowledgeSlug('knowledge_events', payload.slug || buildKnowledgeSlug(payload.title));

  const [result] = (await pool.query(
    `
      INSERT INTO knowledge_events (slug, title, summary, description, event_date, location, is_virtual, status, cover_image_url, created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [
      uniqueSlug,
      payload.title,
      payload.summary ?? null,
      payload.description ?? null,
      payload.eventDate ?? null,
      payload.location ?? null,
      payload.isVirtual ? 1 : 0,
      payload.status ?? 'upcoming',
      payload.coverImageUrl ?? null,
      payload.createdBy ?? null,
      payload.createdBy ?? null,
    ],
  )) as [{ insertId: number }, unknown];

  return { id: result.insertId, slug: uniqueSlug };
}

export async function updateKnowledgeEvent(id: number, payload: {
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
  const [rows] = (await pool.query('SELECT * FROM knowledge_events WHERE id = ? LIMIT 1', [id])) as [Array<KnowledgeEvent>, unknown];
  const existing = rows[0];
  if (!existing) throw new Error('El evento solicitado no existe.');

  const title = payload.title !== undefined ? String(payload.title ?? '').trim() : existing.title;
  if (!title) throw new Error('El título del evento es obligatorio.');

  const baseSlug = payload.title !== undefined ? buildKnowledgeSlug(title) : existing.slug || buildKnowledgeSlug(title);
  const slug = await buildUniqueKnowledgeSlug('knowledge_events', baseSlug, id);
  await pool.query(
    `
      UPDATE knowledge_events
      SET slug = ?, title = ?, summary = ?, description = ?, event_date = ?, location = ?, is_virtual = ?, status = ?, cover_image_url = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `,
    [slug, title, payload.summary ?? existing.summary ?? null, payload.description ?? existing.description ?? null, payload.eventDate ?? existing.event_date ?? null, payload.location ?? existing.location ?? null, payload.isVirtual !== undefined ? (payload.isVirtual ? 1 : 0) : Number(existing.is_virtual ?? 0), payload.status ?? existing.status, payload.coverImageUrl ?? existing.cover_image_url ?? null, payload.updatedBy ?? null, id],
  );

  return { id, slug, title };
}

export async function deleteKnowledgeEvent(id: number) {
  const [rows] = (await pool.query('SELECT id FROM knowledge_events WHERE id = ? LIMIT 1', [id])) as [Array<{ id: number }>, unknown];
  if (!rows[0]) throw new Error('El evento solicitado no existe.');

  const [result] = (await pool.query('DELETE FROM knowledge_events WHERE id = ?', [id])) as [{ affectedRows: number }, unknown];
  return { deleted: result.affectedRows > 0, id };
}

export async function createKnowledgeCall(payload: {
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  organization?: string | null;
  createdBy?: number | null;
}) {
  const uniqueSlug = await buildUniqueKnowledgeSlug('knowledge_calls', payload.slug || buildKnowledgeSlug(payload.title));

  const [result] = (await pool.query(
    `
      INSERT INTO knowledge_calls (slug, title, summary, description, start_date, end_date, status, organization, created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [uniqueSlug, payload.title, payload.summary ?? null, payload.description ?? null, payload.startDate ?? null, payload.endDate ?? null, payload.status ?? 'active', payload.organization ?? null, payload.createdBy ?? null, payload.createdBy ?? null],
  )) as [{ insertId: number }, unknown];

  return { id: result.insertId, slug: uniqueSlug };
}

export async function updateKnowledgeCall(id: number, payload: {
  title?: string;
  summary?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  organization?: string | null;
  updatedBy?: number | null;
}) {
  const [rows] = (await pool.query('SELECT * FROM knowledge_calls WHERE id = ? LIMIT 1', [id])) as [Array<KnowledgeCall>, unknown];
  const existing = rows[0];
  if (!existing) throw new Error('La convocatoria solicitada no existe.');

  const title = payload.title !== undefined ? String(payload.title ?? '').trim() : existing.title;
  if (!title) throw new Error('El título de la convocatoria es obligatorio.');

  const baseSlug = payload.title !== undefined ? buildKnowledgeSlug(title) : existing.slug || buildKnowledgeSlug(title);
  const slug = await buildUniqueKnowledgeSlug('knowledge_calls', baseSlug, id);
  await pool.query(
    `
      UPDATE knowledge_calls
      SET slug = ?, title = ?, summary = ?, description = ?, start_date = ?, end_date = ?, status = ?, organization = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `,
    [slug, title, payload.summary ?? existing.summary ?? null, payload.description ?? existing.description ?? null, payload.startDate ?? existing.start_date ?? null, payload.endDate ?? existing.end_date ?? null, payload.status ?? existing.status, payload.organization ?? existing.organization ?? null, payload.updatedBy ?? null, id],
  );

  return { id, slug, title };
}

export async function deleteKnowledgeCall(id: number) {
  const [rows] = (await pool.query('SELECT id FROM knowledge_calls WHERE id = ? LIMIT 1', [id])) as [Array<{ id: number }>, unknown];
  if (!rows[0]) throw new Error('La convocatoria solicitada no existe.');

  const [result] = (await pool.query('DELETE FROM knowledge_calls WHERE id = ?', [id])) as [{ affectedRows: number }, unknown];
  return { deleted: result.affectedRows > 0, id };
}

export async function createKnowledgeResource(payload: {
  slug: string;
  title: string;
  summary?: string;
  type?: string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  status?: string;
  createdBy?: number | null;
}) {
  const uniqueSlug = await buildUniqueKnowledgeSlug('knowledge_resources', payload.slug || buildKnowledgeSlug(payload.title));

  const [result] = (await pool.query(
    `
      INSERT INTO knowledge_resources (slug, title, summary, type, file_url, external_url, status, created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [uniqueSlug, payload.title, payload.summary ?? null, payload.type ?? 'guide', payload.fileUrl ?? null, payload.externalUrl ?? null, payload.status ?? 'active', payload.createdBy ?? null, payload.createdBy ?? null],
  )) as [{ insertId: number }, unknown];

  return { id: result.insertId, slug: uniqueSlug };
}

export async function updateKnowledgeResource(id: number, payload: {
  title?: string;
  summary?: string | null;
  type?: string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  status?: string;
  updatedBy?: number | null;
}) {
  const [rows] = (await pool.query('SELECT * FROM knowledge_resources WHERE id = ? LIMIT 1', [id])) as [Array<KnowledgeResource>, unknown];
  const existing = rows[0];
  if (!existing) throw new Error('El recurso solicitado no existe.');

  const title = payload.title !== undefined ? String(payload.title ?? '').trim() : existing.title;
  if (!title) throw new Error('El título del recurso es obligatorio.');

  const baseSlug = payload.title !== undefined ? buildKnowledgeSlug(title) : existing.slug || buildKnowledgeSlug(title);
  const slug = await buildUniqueKnowledgeSlug('knowledge_resources', baseSlug, id);
  await pool.query(
    `
      UPDATE knowledge_resources
      SET slug = ?, title = ?, summary = ?, type = ?, file_url = ?, external_url = ?, status = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `,
    [slug, title, payload.summary ?? existing.summary ?? null, payload.type ?? existing.type, payload.fileUrl ?? existing.file_url ?? null, payload.externalUrl ?? existing.external_url ?? null, payload.status ?? existing.status, payload.updatedBy ?? null, id],
  );

  return { id, slug, title };
}

export async function deleteKnowledgeResource(id: number) {
  const [rows] = (await pool.query('SELECT id FROM knowledge_resources WHERE id = ? LIMIT 1', [id])) as [Array<{ id: number }>, unknown];
  if (!rows[0]) throw new Error('El recurso solicitado no existe.');

  const [result] = (await pool.query('DELETE FROM knowledge_resources WHERE id = ?', [id])) as [{ affectedRows: number }, unknown];
  return { deleted: result.affectedRows > 0, id };
}

export async function createKnowledgeMedia(payload: {
  title: string;
  type?: string;
  url?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  createdBy?: number | null;
}) {
  const [result] = (await pool.query(
    `
      INSERT INTO knowledge_media (title, type, url, thumbnail, description, created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [payload.title, payload.type ?? 'image', payload.url ?? null, payload.thumbnail ?? null, payload.description ?? null, payload.createdBy ?? null, payload.createdBy ?? null],
  )) as [{ insertId: number }, unknown];

  return result.insertId;
}

export async function updateKnowledgeMedia(id: number, payload: {
  title?: string;
  type?: string;
  url?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  updatedBy?: number | null;
}) {
  const [rows] = (await pool.query('SELECT * FROM knowledge_media WHERE id = ? LIMIT 1', [id])) as [Array<KnowledgeMedia>, unknown];
  const existing = rows[0];
  if (!existing) throw new Error('El archivo multimedia solicitado no existe.');

  const title = payload.title !== undefined ? String(payload.title ?? '').trim() : existing.title;
  if (!title) throw new Error('El título de la multimedia es obligatorio.');

  await pool.query(
    `
      UPDATE knowledge_media
      SET title = ?, type = ?, url = ?, thumbnail = ?, description = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `,
    [title, payload.type ?? existing.type, payload.url ?? existing.url ?? null, payload.thumbnail ?? existing.thumbnail ?? null, payload.description ?? existing.description ?? null, payload.updatedBy ?? null, id],
  );

  return { id, title };
}

export async function deleteKnowledgeMedia(id: number) {
  const [rows] = (await pool.query('SELECT id FROM knowledge_media WHERE id = ? LIMIT 1', [id])) as [Array<{ id: number }>, unknown];
  if (!rows[0]) throw new Error('El archivo multimedia solicitado no existe.');

  const [result] = (await pool.query('DELETE FROM knowledge_media WHERE id = ?', [id])) as [{ affectedRows: number }, unknown];
  return { deleted: result.affectedRows > 0, id };
}

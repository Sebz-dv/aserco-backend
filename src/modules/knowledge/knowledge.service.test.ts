import { describe, expect, it } from 'vitest';
import { buildKnowledgeSlug, buildUniqueKnowledgeSlug, deleteKnowledgeArticleEntry, updateKnowledgeArticleEntry } from './knowledge.service';

describe('knowledge service', () => {
  it('normalizes article titles into a clean slug', () => {
    expect(buildKnowledgeSlug('¿Qué es el capital de trabajo?')).toBe('que-es-el-capital-de-trabajo');
  });

  it('adds a numbered suffix when the slug already exists', () => {
    expect(buildUniqueKnowledgeSlug('capital-de-trabajo', ['capital-de-trabajo', 'capital-de-trabajo-2'])).toBe('capital-de-trabajo-3');
  });

  it('requires a valid article id before updating or deleting content', async () => {
    await expect(updateKnowledgeArticleEntry(0, { title: 'Nuevo título' })).rejects.toThrow('El artículo solicitado no existe.');
    await expect(deleteKnowledgeArticleEntry(0)).rejects.toThrow('El artículo solicitado no existe.');
  });
});

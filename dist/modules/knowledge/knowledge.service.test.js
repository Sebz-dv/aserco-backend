"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const knowledge_service_1 = require("./knowledge.service");
(0, vitest_1.describe)('knowledge service', () => {
    (0, vitest_1.it)('normalizes article titles into a clean slug', () => {
        (0, vitest_1.expect)((0, knowledge_service_1.buildKnowledgeSlug)('¿Qué es el capital de trabajo?')).toBe('que-es-el-capital-de-trabajo');
    });
    (0, vitest_1.it)('adds a numbered suffix when the slug already exists', () => {
        (0, vitest_1.expect)((0, knowledge_service_1.buildUniqueKnowledgeSlug)('capital-de-trabajo', ['capital-de-trabajo', 'capital-de-trabajo-2'])).toBe('capital-de-trabajo-3');
    });
    (0, vitest_1.it)('requires a valid article id before updating or deleting content', async () => {
        await (0, vitest_1.expect)((0, knowledge_service_1.updateKnowledgeArticleEntry)(0, { title: 'Nuevo título' })).rejects.toThrow('El artículo solicitado no existe.');
        await (0, vitest_1.expect)((0, knowledge_service_1.deleteKnowledgeArticleEntry)(0)).rejects.toThrow('El artículo solicitado no existe.');
    });
});

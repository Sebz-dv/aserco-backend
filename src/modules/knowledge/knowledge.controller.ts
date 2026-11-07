import type { Request, Response } from 'express';
import {
  createKnowledgeArticleEntry,
  createKnowledgeCallEntry,
  createKnowledgeCategoryEntry,
  createKnowledgeEventEntry,
  createKnowledgeMediaEntry,
  createKnowledgeResourceEntry,
  deleteKnowledgeArticleEntry,
  deleteKnowledgeCallEntry,
  deleteKnowledgeCategoryEntry,
  deleteKnowledgeEventEntry,
  deleteKnowledgeMediaEntry,
  deleteKnowledgeResourceEntry,
  getKnowledgeAdminDashboard,
  listPublicKnowledgeArticles,
  listPublicKnowledgeCalls,
  listPublicKnowledgeCategories,
  listPublicKnowledgeEvents,
  listPublicKnowledgeMedia,
  listPublicKnowledgeResources,
  getPublicKnowledgeArticle,
  updateKnowledgeArticleEntry,
  updateKnowledgeCallEntry,
  updateKnowledgeCategoryEntry,
  updateKnowledgeEventEntry,
  updateKnowledgeMediaEntry,
  updateKnowledgeResourceEntry,
} from './knowledge.service';

export async function listKnowledgeArticlesController(_req: Request, res: Response) {
  try {
    const articles = await listPublicKnowledgeArticles();
    return res.status(200).json({ articles });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar artículos.' });
  }
}

export async function getKnowledgeArticleController(req: Request, res: Response) {
  try {
    const article = await getPublicKnowledgeArticle(String(req.params.slug ?? ''));
    if (!article) {
      return res.status(404).json({ message: 'Artículo no encontrado.' });
    }

    return res.status(200).json({ article });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al consultar el artículo.' });
  }
}

export async function listKnowledgeCategoriesController(_req: Request, res: Response) {
  try {
    const categories = await listPublicKnowledgeCategories();
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar categorías.' });
  }
}

export async function listKnowledgeEventsController(_req: Request, res: Response) {
  try {
    const events = await listPublicKnowledgeEvents();
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar eventos.' });
  }
}

export async function listKnowledgeCallsController(_req: Request, res: Response) {
  try {
    const calls = await listPublicKnowledgeCalls();
    return res.status(200).json({ calls });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar convocatorias.' });
  }
}

export async function listKnowledgeResourcesController(_req: Request, res: Response) {
  try {
    const resources = await listPublicKnowledgeResources();
    return res.status(200).json({ resources });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar recursos.' });
  }
}

export async function listKnowledgeMediaController(_req: Request, res: Response) {
  try {
    const media = await listPublicKnowledgeMedia();
    return res.status(200).json({ media });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al listar multimedia.' });
  }
}

export async function getKnowledgeDashboardController(_req: Request, res: Response) {
  try {
    const dashboard = await getKnowledgeAdminDashboard();
    return res.status(200).json({ dashboard });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Error al consultar el dashboard.' });
  }
}

export async function createKnowledgeArticleController(req: Request, res: Response) {
  try {
    const payload = req.body as {
      title?: string;
      subtitle?: string;
      excerpt?: string;
      content?: string;
      categoryId?: number | null;
      authorName?: string;
      coverImageUrl?: string;
      seoTitle?: string;
      seoDescription?: string;
      status?: string;
      featured?: boolean;
      readTime?: number;
    };

    const result = await createKnowledgeArticleEntry({
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
      createdBy: Number((req as any).user?.id ?? 0) || null,
    });

    return res.status(201).json({ message: 'Artículo creado correctamente.', article: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el artículo.' });
  }
}

export async function createKnowledgeCategoryController(req: Request, res: Response) {
  try {
    const { name, description, color, imageUrl } = req.body as { name?: string; description?: string; color?: string; imageUrl?: string };

    const result = await createKnowledgeCategoryEntry({
      name: name ?? '',
      description,
      color,
      imageUrl,
      createdBy: Number((req as any).user?.id ?? 0) || null,
    });

    return res.status(201).json({ message: 'Categoría creada correctamente.', category: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear la categoría.' });
  }
}

export async function updateKnowledgeCategoryController(req: Request, res: Response) {
  try {
    const categoryId = Number(req.params.id ?? 0);
    const payload = req.body as { name?: string; description?: string | null; color?: string | null; imageUrl?: string | null };

    const result = await updateKnowledgeCategoryEntry(categoryId, {
      name: payload.name,
      description: payload.description,
      color: payload.color,
      imageUrl: payload.imageUrl,
      updatedBy: Number((req as any).user?.id ?? 0) || null,
    });

    return res.status(200).json({ message: 'Categoría actualizada correctamente.', category: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la categoría.';
    return res.status(error instanceof Error && error.message === 'La categoría solicitada no existe.' ? 404 : 400).json({ message });
  }
}

export async function deleteKnowledgeCategoryController(req: Request, res: Response) {
  try {
    const categoryId = Number(req.params.id ?? 0);
    const result = await deleteKnowledgeCategoryEntry(categoryId);
    return res.status(200).json({ message: 'Categoría eliminada correctamente.', category: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar la categoría.';
    return res.status(error instanceof Error && error.message === 'La categoría solicitada no existe.' ? 404 : 400).json({ message });
  }
}

export async function createKnowledgeEventController(req: Request, res: Response) {
  try {
    const payload = req.body as { title?: string; summary?: string; description?: string; eventDate?: string | null; location?: string | null; isVirtual?: boolean; status?: string; coverImageUrl?: string | null; };
    const result = await createKnowledgeEventEntry({
      title: payload.title ?? '',
      summary: payload.summary,
      description: payload.description,
      eventDate: payload.eventDate,
      location: payload.location,
      isVirtual: payload.isVirtual,
      status: payload.status,
      coverImageUrl: payload.coverImageUrl,
      createdBy: Number((req as any).user?.id ?? 0) || null,
    });
    return res.status(201).json({ message: 'Evento creado correctamente.', event: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el evento.' });
  }
}

export async function updateKnowledgeEventController(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id ?? 0);
    const payload = req.body as { title?: string; summary?: string | null; description?: string | null; eventDate?: string | null; location?: string | null; isVirtual?: boolean; status?: string; coverImageUrl?: string | null; };
    const result = await updateKnowledgeEventEntry(eventId, { ...payload, updatedBy: Number((req as any).user?.id ?? 0) || null });
    return res.status(200).json({ message: 'Evento actualizado correctamente.', event: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el evento.';
    return res.status(error instanceof Error && error.message === 'El evento solicitado no existe.' ? 404 : 400).json({ message });
  }
}

export async function deleteKnowledgeEventController(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.id ?? 0);
    const result = await deleteKnowledgeEventEntry(eventId);
    return res.status(200).json({ message: 'Evento eliminado correctamente.', event: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el evento.';
    return res.status(error instanceof Error && error.message === 'El evento solicitado no existe.' ? 404 : 400).json({ message });
  }
}

export async function createKnowledgeCallController(req: Request, res: Response) {
  try {
    const payload = req.body as { title?: string; summary?: string; description?: string; startDate?: string | null; endDate?: string | null; status?: string; organization?: string | null; };
    const result = await createKnowledgeCallEntry({
      title: payload.title ?? '',
      summary: payload.summary,
      description: payload.description,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status,
      organization: payload.organization,
      createdBy: Number((req as any).user?.id ?? 0) || null,
    });
    return res.status(201).json({ message: 'Convocatoria creada correctamente.', call: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear la convocatoria.' });
  }
}

export async function updateKnowledgeCallController(req: Request, res: Response) {
  try {
    const callId = Number(req.params.id ?? 0);
    const payload = req.body as { title?: string; summary?: string | null; description?: string | null; startDate?: string | null; endDate?: string | null; status?: string; organization?: string | null; };
    const result = await updateKnowledgeCallEntry(callId, { ...payload, updatedBy: Number((req as any).user?.id ?? 0) || null });
    return res.status(200).json({ message: 'Convocatoria actualizada correctamente.', call: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la convocatoria.';
    return res.status(error instanceof Error && error.message === 'La convocatoria solicitada no existe.' ? 404 : 400).json({ message });
  }
}

export async function deleteKnowledgeCallController(req: Request, res: Response) {
  try {
    const callId = Number(req.params.id ?? 0);
    const result = await deleteKnowledgeCallEntry(callId);
    return res.status(200).json({ message: 'Convocatoria eliminada correctamente.', call: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar la convocatoria.';
    return res.status(error instanceof Error && error.message === 'La convocatoria solicitada no existe.' ? 404 : 400).json({ message });
  }
}

export async function createKnowledgeResourceController(req: Request, res: Response) {
  try {
    const payload = req.body as { title?: string; summary?: string; type?: string; fileUrl?: string | null; externalUrl?: string | null; status?: string; };
    const result = await createKnowledgeResourceEntry({
      title: payload.title ?? '',
      summary: payload.summary,
      type: payload.type,
      fileUrl: payload.fileUrl,
      externalUrl: payload.externalUrl,
      status: payload.status,
      createdBy: Number((req as any).user?.id ?? 0) || null,
    });
    return res.status(201).json({ message: 'Recurso creado correctamente.', resource: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear el recurso.' });
  }
}

export async function updateKnowledgeResourceController(req: Request, res: Response) {
  try {
    const resourceId = Number(req.params.id ?? 0);
    const payload = req.body as { title?: string; summary?: string | null; type?: string; fileUrl?: string | null; externalUrl?: string | null; status?: string; };
    const result = await updateKnowledgeResourceEntry(resourceId, { ...payload, updatedBy: Number((req as any).user?.id ?? 0) || null });
    return res.status(200).json({ message: 'Recurso actualizado correctamente.', resource: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el recurso.';
    return res.status(error instanceof Error && error.message === 'El recurso solicitado no existe.' ? 404 : 400).json({ message });
  }
}

export async function deleteKnowledgeResourceController(req: Request, res: Response) {
  try {
    const resourceId = Number(req.params.id ?? 0);
    const result = await deleteKnowledgeResourceEntry(resourceId);
    return res.status(200).json({ message: 'Recurso eliminado correctamente.', resource: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el recurso.';
    return res.status(error instanceof Error && error.message === 'El recurso solicitado no existe.' ? 404 : 400).json({ message });
  }
}

export async function createKnowledgeMediaController(req: Request, res: Response) {
  try {
    const payload = req.body as { title?: string; type?: string; url?: string | null; thumbnail?: string | null; description?: string | null; };
    const result = await createKnowledgeMediaEntry({
      title: payload.title ?? '',
      type: payload.type,
      url: payload.url,
      thumbnail: payload.thumbnail,
      description: payload.description,
      createdBy: Number((req as any).user?.id ?? 0) || null,
    });
    return res.status(201).json({ message: 'Multimedia creada correctamente.', media: result });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo crear la multimedia.' });
  }
}

export async function updateKnowledgeMediaController(req: Request, res: Response) {
  try {
    const mediaId = Number(req.params.id ?? 0);
    const payload = req.body as { title?: string; type?: string; url?: string | null; thumbnail?: string | null; description?: string | null; };
    const result = await updateKnowledgeMediaEntry(mediaId, { ...payload, updatedBy: Number((req as any).user?.id ?? 0) || null });
    return res.status(200).json({ message: 'Multimedia actualizada correctamente.', media: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la multimedia.';
    return res.status(error instanceof Error && error.message === 'El archivo multimedia solicitado no existe.' ? 404 : 400).json({ message });
  }
}

export async function deleteKnowledgeMediaController(req: Request, res: Response) {
  try {
    const mediaId = Number(req.params.id ?? 0);
    const result = await deleteKnowledgeMediaEntry(mediaId);
    return res.status(200).json({ message: 'Multimedia eliminada correctamente.', media: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar la multimedia.';
    return res.status(error instanceof Error && error.message === 'El archivo multimedia solicitado no existe.' ? 404 : 400).json({ message });
  }
}

export async function updateKnowledgeArticleController(req: Request, res: Response) {
  try {
    const articleId = Number(req.params.id ?? 0);
    const payload = req.body as {
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
    };

    const result = await updateKnowledgeArticleEntry(articleId, {
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
      updatedBy: Number((req as any).user?.id ?? 0) || null,
    });

    return res.status(200).json({ message: 'Artículo actualizado correctamente.', article: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el artículo.';
    return res.status(error instanceof Error && error.message === 'El artículo solicitado no existe.' ? 404 : 400).json({ message });
  }
}

export async function deleteKnowledgeArticleController(req: Request, res: Response) {
  try {
    const articleId = Number(req.params.id ?? 0);
    const result = await deleteKnowledgeArticleEntry(articleId);
    return res.status(200).json({ message: 'Artículo eliminado correctamente.', article: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el artículo.';
    return res.status(error instanceof Error && error.message === 'El artículo solicitado no existe.' ? 404 : 400).json({ message });
  }
}

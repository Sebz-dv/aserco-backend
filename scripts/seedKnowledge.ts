import { pool } from '../src/config/database';

async function main() {
  const [[user]] = (await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    ['superadmin@aserco.com.co'],
  )) as [Array<{ id: number }>, unknown];

  if (!user) {
    throw new Error('Super admin no encontrado.');
  }

  const adminId = user.id;

  const categories = [
    {
      slug: 'finanzas-y-cash-flow',
      name: 'Finanzas y cash flow',
      description: 'Gestión del flujo de caja y decisiones de capital.',
      color: '#3163a2',
      image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    },
    {
      slug: 'estrategia-y-ventas',
      name: 'Estrategia y ventas',
      description: 'Modelos, crecimiento y ejecución comercial.',
      color: '#9dbf14',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    },
    {
      slug: 'operacion-y-riesgo',
      name: 'Operación y riesgo',
      description: 'Procesos, control y resiliencia operativa.',
      color: '#32a852',
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      slug: 'tecnologia-y-ia',
      name: 'Tecnología e IA',
      description: 'Automatización, datos y herramientas inteligentes.',
      color: '#7c3aed',
      image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const category of categories) {
    await pool.query(
      `INSERT INTO knowledge_categories
        (slug, name, description, color, image_url, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         color = VALUES(color),
         image_url = VALUES(image_url),
         updated_by = VALUES(updated_by)`,
      [category.slug, category.name, category.description, category.color, category.image_url, adminId, adminId],
    );
  }

  const [[financeCategory]] = (await pool.query(
    'SELECT id FROM knowledge_categories WHERE slug = ? LIMIT 1',
    ['finanzas-y-cash-flow'],
  )) as [Array<{ id: number }>, unknown];

  const [[strategyCategory]] = (await pool.query(
    'SELECT id FROM knowledge_categories WHERE slug = ? LIMIT 1',
    ['estrategia-y-ventas'],
  )) as [Array<{ id: number }>, unknown];

  const [[operationsCategory]] = (await pool.query(
    'SELECT id FROM knowledge_categories WHERE slug = ? LIMIT 1',
    ['operacion-y-riesgo'],
  )) as [Array<{ id: number }>, unknown];

  const [[techCategory]] = (await pool.query(
    'SELECT id FROM knowledge_categories WHERE slug = ? LIMIT 1',
    ['tecnologia-y-ia'],
  )) as [Array<{ id: number }>, unknown];

  const articles = [
    {
      slug: 'flujo-de-caja-que-no-falla',
      title: 'Flujo de caja que no falla',
      subtitle: 'Cómo construir disciplina financiera en pymes',
      excerpt: 'Organiza cobros, pagos y pronósticos para tomar decisiones con más control.',
      content:
        'El flujo de caja es el pulso financiero de la empresa. Cuando los cobros y pagos no se sincronizan, la operación entra en tensión. La clave está en priorizar pagos críticos, automatizar alertas en tiempos de vencimiento y revisar con frecuencia el comportamiento real del efectivo.',
      status: 'published',
      featured: 1,
      category_id: financeCategory.id,
      author_id: adminId,
      author_name: 'Super Admin',
      cover_image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      read_time: 6,
      published_at: '2026-10-15 09:00:00',
    },
    {
      slug: 'ventas-con-historias-y-metrica',
      title: 'Ventas con historias y métricas',
      subtitle: 'Más claridad en la ejecución comercial',
      excerpt: 'La combinación entre narrativa y análisis permite vender con mayor precisión y consistencia.',
      content:
        'Las organizaciones más sólidas no venden solo por intuición; construyen propuestas con claridad, validan necesidades reales y usan métricas para ajustar cada paso del proceso comercial. Esa mezcla crea una ejecución más sostenible y medible.',
      status: 'published',
      featured: 0,
      category_id: strategyCategory.id,
      author_id: adminId,
      author_name: 'Super Admin',
      cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      read_time: 5,
      published_at: '2026-10-20 11:30:00',
    },
    {
      slug: 'control-operativo-para-escala',
      title: 'Control operativo para escalar sin caos',
      subtitle: 'Procesos que sostienen el crecimiento',
      excerpt: 'Cuando la operación crece, la estructura de control debe crecer contigo.',
      content:
        'La operación se vuelve más compleja a medida que crece la demanda. Los procesos, indicadores y responsables deben estar claramente definidos para sostener calidad sin perder velocidad. Eso convierte la operación en un activo estratégico.',
      status: 'draft',
      featured: 0,
      category_id: operationsCategory.id,
      author_id: adminId,
      author_name: 'Super Admin',
      cover_image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      read_time: 7,
      published_at: null,
    },
    {
      slug: 'ia-para-decisiones-empresariales',
      title: 'IA para decisiones empresariales',
      subtitle: 'Automatiza de forma inteligente',
      excerpt: 'La inteligencia artificial puede acelerar la toma de decisiones cuando se usa con estrategia y datos.',
      content:
        'La IA no debe reemplazar el criterio humano, sino apoyarlo. Cuando se combina con datos confiables, procesos bien definidos y decisión humana responsable, acelera análisis, descubre patrones y ayuda a priorizar acciones con mayor precisión.',
      status: 'published',
      featured: 1,
      category_id: techCategory.id,
      author_id: adminId,
      author_name: 'Super Admin',
      cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      read_time: 8,
      published_at: '2026-11-01 15:00:00',
    },
  ];

  for (const article of articles) {
    await pool.query(
      `INSERT INTO knowledge_articles
        (slug, title, subtitle, excerpt, content, status, featured, category_id, author_id, author_name, cover_image_url, read_time, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         subtitle = VALUES(subtitle),
         excerpt = VALUES(excerpt),
         content = VALUES(content),
         status = VALUES(status),
         featured = VALUES(featured),
         category_id = VALUES(category_id),
         author_id = VALUES(author_id),
         author_name = VALUES(author_name),
         cover_image_url = VALUES(cover_image_url),
         read_time = VALUES(read_time),
         seo_title = VALUES(seo_title),
         seo_description = VALUES(seo_description),
         published_at = VALUES(published_at),
         updated_by = VALUES(updated_by)`,
      [
        article.slug,
        article.title,
        article.subtitle,
        article.excerpt,
        article.content,
        article.status,
        article.featured ? 1 : 0,
        article.category_id,
        article.author_id,
        article.author_name,
        article.cover_image_url,
        article.read_time,
        article.title,
        article.excerpt,
        article.published_at,
        adminId,
        adminId,
      ],
    );
  }

  const events = [
    {
      slug: 'foro-finanzas-2026',
      title: 'Foro de Finanzas y Crecimiento 2026',
      summary: 'Espacio para comparar tendencias y prácticas de eficiencia financiera.',
      description: 'Paneles, talleres y análisis de casos reales sobre control financiero, inversión y valor para el negocio.',
      event_date: '2026-12-04 09:00:00',
      location: 'Bogotá, Colombia',
      is_virtual: 0,
      status: 'upcoming',
      cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    },
    {
      slug: 'seminario-ia-y-automatizacion',
      title: 'Seminario de IA y automatización',
      summary: 'Cómo aplicar IA para mejorar operación y productividad.',
      description: 'Presentación de casos de uso en finanzas, atención al cliente y análisis de datos.',
      event_date: '2026-11-18 14:00:00',
      location: 'Virtual',
      is_virtual: 1,
      status: 'ongoing',
      cover_image_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const event of events) {
    await pool.query(
      `INSERT INTO knowledge_events
        (slug, title, summary, description, event_date, location, is_virtual, status, cover_image_url, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         summary = VALUES(summary),
         description = VALUES(description),
         event_date = VALUES(event_date),
         location = VALUES(location),
         is_virtual = VALUES(is_virtual),
         status = VALUES(status),
         cover_image_url = VALUES(cover_image_url),
         updated_by = VALUES(updated_by)`,
      [event.slug, event.title, event.summary, event.description, event.event_date, event.location, event.is_virtual, event.status, event.cover_image_url, adminId, adminId],
    );
  }

  const calls = [
    {
      slug: 'convocatoria-aceleracion-2026',
      title: 'Convocatoria de Aceleración Empresarial 2026',
      summary: 'Programa para empresas con potencial de crecimiento y operación sostenible.',
      description: 'Seleccionamos organizaciones con visión de crecimiento, disciplina financiera y capacidad de implementación.',
      start_date: '2026-11-15 08:00:00',
      end_date: '2026-12-15 18:00:00',
      status: 'active',
      organization: 'Aserco Smart Finance',
    },
    {
      slug: 'subvenciones-innovacion-fintech',
      title: 'Subvenciones para innovación fintech',
      summary: 'Apoyo para proyectos digitales con impacto en finanzas y operación.',
      description: 'Apertura de convocatoria para empresas con propuestas de automatización, analítica y servicios financieros.',
      start_date: '2026-11-05 00:00:00',
      end_date: '2026-12-05 23:59:00',
      status: 'active',
      organization: 'Aserco Advisory',
    },
  ];

  for (const call of calls) {
    await pool.query(
      `INSERT INTO knowledge_calls
        (slug, title, summary, description, start_date, end_date, status, organization, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         summary = VALUES(summary),
         description = VALUES(description),
         start_date = VALUES(start_date),
         end_date = VALUES(end_date),
         status = VALUES(status),
         organization = VALUES(organization),
         updated_by = VALUES(updated_by)`,
      [call.slug, call.title, call.summary, call.description, call.start_date, call.end_date, call.status, call.organization, adminId, adminId],
    );
  }

  const resources = [
    {
      slug: 'guia-analisis-de-cash-flow',
      title: 'Guía de análisis de cash flow',
      summary: 'Checklist para entender la liquidez real del negocio.',
      type: 'guide',
      file_url: 'https://example.com/files/guia-cash-flow.pdf',
      external_url: 'https://example.com/guia-cash-flow',
      status: 'active',
    },
    {
      slug: 'plantilla-matriz-riesgo-operativo',
      title: 'Plantilla de matriz de riesgo operativo',
      summary: 'Herramienta para mapear vulnerabilidades y controles.',
      type: 'template',
      file_url: null,
      external_url: 'https://example.com/matriz-riesgos',
      status: 'active',
    },
  ];

  for (const resource of resources) {
    await pool.query(
      `INSERT INTO knowledge_resources
        (slug, title, summary, type, file_url, external_url, status, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         summary = VALUES(summary),
         type = VALUES(type),
         file_url = VALUES(file_url),
         external_url = VALUES(external_url),
         status = VALUES(status),
         updated_by = VALUES(updated_by)`,
      [resource.slug, resource.title, resource.summary, resource.type, resource.file_url ?? null, resource.external_url ?? null, resource.status, adminId, adminId],
    );
  }

  const media = [
    {
      title: 'Estrategia financiera para crecimiento',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      description: 'Visual de estrategia financiera y cash flow.',
    },
    {
      title: 'Panel de automatización inteligente',
      type: 'video',
      url: 'https://player.vimeo.com/external/44982015.sd.mp4?s=0',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
      description: 'Video de automatización y análisis de procesos.',
    },
  ];

  for (const item of media) {
    await pool.query(
      `INSERT INTO knowledge_media
        (title, type, url, thumbnail, description, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         type = VALUES(type),
         url = VALUES(url),
         thumbnail = VALUES(thumbnail),
         description = VALUES(description),
         updated_by = VALUES(updated_by)`,
      [item.title, item.type, item.url, item.thumbnail, item.description, adminId, adminId],
    );
  }

  const [counts] = (await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM knowledge_categories) AS categories,
      (SELECT COUNT(*) FROM knowledge_articles) AS articles,
      (SELECT COUNT(*) FROM knowledge_events) AS events,
      (SELECT COUNT(*) FROM knowledge_calls) AS calls,
      (SELECT COUNT(*) FROM knowledge_resources) AS resources,
      (SELECT COUNT(*) FROM knowledge_media) AS media`,
  )) as [Array<{ categories: number; articles: number; events: number; calls: number; resources: number; media: number }>, unknown];

  console.log(JSON.stringify(counts[0], null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

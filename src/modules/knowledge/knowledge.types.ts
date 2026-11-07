export type KnowledgeStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';

export type KnowledgeCategory = {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  color?: string | null;
  image_url?: string | null;
  created_at?: string;
};

export type KnowledgeArticle = {
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: string | null;
  status: KnowledgeStatus;
  featured: number;
  category_id?: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  author_id?: number | null;
  author_name?: string | null;
  cover_image_url?: string | null;
  read_time?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type KnowledgeEvent = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  event_date?: string | null;
  location?: string | null;
  is_virtual: number;
  status: string;
  cover_image_url?: string | null;
  created_at?: string;
};

export type KnowledgeCall = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  organization?: string | null;
  created_at?: string;
};

export type KnowledgeResource = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  type: string;
  file_url?: string | null;
  external_url?: string | null;
  status: string;
  created_at?: string;
};

export type KnowledgeMedia = {
  id: number;
  title: string;
  type: string;
  url?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  created_at?: string;
};

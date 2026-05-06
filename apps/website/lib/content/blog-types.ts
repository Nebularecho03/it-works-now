export interface BlogContent {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  publishedAt: string;
  featuredImage?: string;
  tags?: string[];
  author?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  featuredImage?: string;
  author?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface BlogData {
  blogPosts: BlogPostSummary[];
  blogContentBySlug: Record<string, BlogContent>;
  blogCategories: string[];
}

export interface Conference {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  role?: string;
  url?: string;
}

export interface Talk {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'invited' | 'keynote' | 'conference';
  url?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  description?: string;
  category?: string;
  order: number;
}

// Seed data
export const seedBlogPosts: BlogPostSummary[] = [
  {
    id: "1",
    title: "Understanding Cultural Psychology in African Contexts",
    slug: "understanding-cultural-psychology",
    excerpt: "Exploring the intersection of traditional wisdom and modern psychological practice.",
    category: "Cultural Psychology",
    publishedAt: "2024-01-15",
    featuredImage: "/images/blog/cultural-psychology.jpg",
    author: "Dr. Stephen Asatsa",
    status: "published"
  },
  {
    id: "2", 
    title: "Decolonizing Mental Health Practice",
    slug: "decolonizing-mental-health",
    excerpt: "A critical examination of Western-centric approaches to mental health.",
    category: "Mental Health",
    publishedAt: "2024-01-10",
    featuredImage: "/images/blog/decolonizing-health.jpg",
    author: "Dr. Stephen Asatsa",
    status: "published"
  }
];

export const seedBlogContent: Record<string, BlogContent> = {
  "understanding-cultural-psychology": {
    id: "1",
    title: "Understanding Cultural Psychology in African Contexts",
    content: "Full blog post content about cultural psychology in African contexts...",
    excerpt: "Exploring the intersection of traditional wisdom and modern psychological practice.",
    slug: "understanding-cultural-psychology",
    category: "Cultural Psychology",
    publishedAt: "2024-01-15",
    featuredImage: "/images/blog/cultural-psychology.jpg",
    tags: ["cultural psychology", "african psychology", "indigenous knowledge"],
    author: "Dr. Stephen Asatsa",
    status: "published",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  "decolonizing-mental-health": {
    id: "2",
    title: "Decolonizing Mental Health Practice",
    content: "Full blog post content about decolonizing mental health practice...",
    excerpt: "A critical examination of Western-centric approaches to mental health.",
    slug: "decolonizing-mental-health",
    category: "Mental Health",
    publishedAt: "2024-01-10",
    featuredImage: "/images/blog/decolonizing-health.jpg",
    tags: ["decolonization", "mental health", "cultural competence"],
    author: "Dr. Stephen Asatsa",
    status: "published",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10"
  }
};

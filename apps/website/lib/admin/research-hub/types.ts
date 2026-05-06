// Base content interface for all research hub content
export interface BaseContent {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Project interface
export interface Project extends BaseContent {
  shortDescription: string;
  fullDescription: string;
  category: string[];
  countries: string[];
  startDate: string;
  endDate?: string;
  sampleSize?: number;
  funding: {
    body: string;
    amount?: string;
    currency?: string;
  };
  leadResearcher: string;
  collaborators: string[];
  methodology: string;
  keyFindings: string[];
  outputs: string[];
  relatedPublications: string[];
  externalLinks: {
    title: string;
    url: string;
  }[];
  featuredImage?: string;
  gallery: string[];
  displayOrder: number;
}

// Team member interface
export interface TeamMember extends BaseContent {
  name: string;
  role: string;
  institution: string;
  country: string;
  bio: string;
  expertise: string[];
  avatar?: string;
  links: {
    orcid?: string;
    googleScholar?: string;
    researchGate?: string;
    website?: string;
    email?: string;
  };
}

// International collaborator interface
export interface Collaborator extends BaseContent {
  name: string;
  role: string;
  institution: string;
  country: string;
  bio: string;
  expertise: string[];
  links: {
    website?: string;
    orcid?: string;
    googleScholar?: string;
    researchGate?: string;
  };
}

// Activity interface
export interface Activity extends BaseContent {
  type: 'conference' | 'publication' | 'media' | 'workshop' | 'talk';
  date: string;
  endDate?: string;
  location?: string;
  description: string;
  externalUrl?: string;
  mediaType?: 'video' | 'audio' | 'image' | 'document';
  fileUrl?: string;
  presenter?: string;
  institution?: string;
}

// Award interface
export interface Award extends BaseContent {
  issuingBody: string;
  year: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  url?: string;
  category: string;
}

// Grant interface
export interface Grant extends BaseContent {
  issuingBody: string;
  amount: string;
  currency?: string;
  year: string;
  grantStatus: 'active' | 'completed' | 'pending';
  description: string;
  project?: string;
  duration?: string;
}

// Community engagement opportunity interface
export interface CommunityEngagement extends BaseContent {
  type: 'research' | 'collaboration' | 'community';
  title: string;
  description: string;
  requirements: string[];
  duration?: string;
  compensation?: string;
  contactEmail?: string;
  applicationUrl?: string;
}

// Testimonial interface
export interface Testimonial extends BaseContent {
  name: string;
  role: string;
  institution?: string;
  quote: string;
  rating: number;
  context?: string;
  avatar?: string;
}

// Media item interface
export interface MediaItem extends BaseContent {
  type: 'image' | 'video' | 'audio' | 'document';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for video/audio
  alt?: string;
  caption?: string;
  tags: string[];
}

export interface ExternalProfile extends BaseContent {
  platform: string;
  url: string;
  username?: string;
  displayName?: string;
  profileType: 'academic' | 'professional' | 'social' | 'other';
}

// Lab information interface
export interface LabInfo {
  name: string;
  shortName: string;
  tagline: string;
  positioning: string;
  description: string;
  mission: string;
  vision: string;
  values: {
    title: string;
    description: string;
    icon: string;
  }[];
  director: {
    name: string;
    title: string;
    institution: string;
    credentials: string[];
    bio: string;
    expertise: string[];
  };
  focusAreas: {
    title: string;
    description: string;
    icon: string;
    color: string;
  }[];
  internationalPartners: {
    country: string;
    institution: string;
    role: string;
  }[];
}

// Form data types
export interface CreateProjectData {
  title: string;
  slug?: string;
  shortDescription: string;
  fullDescription: string;
  category: string[];
  countries: string[];
  startDate: string;
  endDate?: string;
  sampleSize?: number;
  fundingBody: string;
  fundingAmount?: string;
  fundingCurrency?: string;
  leadResearcher: string;
  collaborators: string[];
  methodology: string;
  keyFindings: string[];
  outputs: string[];
  relatedPublications: string[];
  externalLinks: {
    title: string;
    url: string;
  }[];
  featuredImage?: string;
  gallery: string[];
  status: 'draft' | 'published';
  featured: boolean;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  displayOrder?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

export interface CreateTeamMemberData {
  name: string;
  role: string;
  institution: string;
  country: string;
  bio: string;
  expertise: string[];
  avatar?: string;
  orcid?: string;
  googleScholar?: string;
  researchGate?: string;
  website?: string;
  email?: string;
  status: 'draft' | 'published';
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {
  id: string;
}

// Filter and search types
export interface ProjectFilters {
  status?: string[];
  category?: string[];
  countries?: string[];
  year?: string[];
  fundingBody?: string[];
  featured?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Activity log interface
export interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  entityType: 'project' | 'team' | 'activity' | 'award' | 'grant' | 'media';
  entityId: string;
  entityTitle: string;
  userId: string;
  userName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Dashboard stats
export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalTeamMembers: number;
  totalActivities: number;
  totalAwards: number;
  totalGrants: number;
  totalMedia: number;
  recentActivity: ActivityLog[];
  quickStats: {
    label: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease';
  }[];
}

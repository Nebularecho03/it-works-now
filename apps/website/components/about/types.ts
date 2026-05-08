export interface ResearchInterest {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  published: boolean;
}

export interface Award {
  id: string;
  title: string;
  year: number;
  description: string;
  organization: string;
  url?: string;
  image_url?: string;
  icon: string;
  color: string;
  display_order: number;
  published: boolean;
}

export interface ExternalProfile {
  id: string;
  label: string;
  description: string;
  url: string;
  platform: string;
  icon: string;
  color: string;
  display_order: number;
  published: boolean;
}

export interface AboutContent {
  aboutFull: string[];
  quote: {
    text: string;
    author: string;
  };
}

export interface AboutPageData {
  aboutContent: AboutContent | null;
  researchInterests: ResearchInterest[];
  awards: Award[];
  externalProfiles: ExternalProfile[];
  loading: boolean;
  error: string | null;
}

export interface StatCounter {
  label: string;
  value: number;
  description: string;
}

export interface TimelineItem extends Award {
  type: 'award' | 'leadership';
}

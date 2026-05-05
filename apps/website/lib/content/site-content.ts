import siteContentData from "./site-content.json";

export type SiteContent = typeof siteContentData;
export type Service = SiteContent["services"][number];
export type Publication = SiteContent["publications"][number];
export type ResearchProject = SiteContent["researchProjects"][number];
export type TeamMember = SiteContent["researchProjects"][number]["team"][number];
export type Testimonial = SiteContent["testimonials"][number];
export type Award = SiteContent["awards"][number];
export type ExternalProfile = SiteContent["externalProfiles"][number];
export type MediaItem = SiteContent["media"][number];
export type Collaborator = SiteContent["collaborators"][number];

export const siteContent: SiteContent = siteContentData;

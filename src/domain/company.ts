export interface CompanyCollaboration {
  roles: string[];
  experienceIds: string[];
  projectIds: string[];
}

export interface CompanyProfile {
  slug: string;
  name: string;
  aliases: string[];
  country: string;
  sector: string;
  summary: string;
  website?: string;
  group?: string;
  relatedSlugs?: string[];
  collaboration: CompanyCollaboration;
}

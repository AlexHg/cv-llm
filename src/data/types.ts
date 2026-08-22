export type Locale = 'en' | 'es'

export type ProfileId = 'cloud' | 'fullstack' | 'techlead' | 'genai' | 'devops'

export type LocalizedText = {
  en: string
  es: string
}

export interface CvContact {
  type: 'phone' | 'email' | 'linkedin' | 'country'
  label: string
  value: string
}

export interface CvExperience {
  title: string
  company: string
  period: string
  description: string
}

export interface CvEducation {
  degree: string
  school: string
  period: string
}

export interface CvSkill {
  name: string
  level: number
}

export interface CvSideProject {
  title: string
  meta: string
  description: string
  keywords: string
}

export interface CvLabels {
  about: string
  experience: string
  experienceContinued: string
  education: string
  expertise: string
  techSkills: string
  sideProjects: string
  keywords: string
  downloadPdf: string
  generating: string
  phone: string
  email: string
  linkedin: string
  country: string
}

export interface CvData {
  firstName: string
  lastName: string
  headline: string
  photo: string
  about: string
  contact: CvContact[]
  experiencePage1: CvExperience[]
  experiencePage2: CvExperience[]
  education: CvEducation
  expertise: string[]
  skills: CvSkill[]
  sideProjects: CvSideProject[]
  labels: CvLabels
  profile: ProfileId
  locale: Locale
}

export interface LocalizedExperience {
  id: string
  title: LocalizedText
  company: string
  period: LocalizedText
  description: LocalizedText
}

export interface LocalizedEducation {
  degree: LocalizedText
  school: string
  period: LocalizedText
}

export interface LocalizedSideProject {
  id: string
  title: string
  meta: LocalizedText
  description: LocalizedText
  keywords: string
}

export interface LocalizedCvBase {
  firstName: string
  lastName: string
  headline: LocalizedText
  photo: string
  about: LocalizedText
  contact: {
    type: CvContact['type']
    value: string
  }[]
  experiencePage1: LocalizedExperience[]
  experiencePage2: LocalizedExperience[]
  education: LocalizedEducation
  expertise: LocalizedText[]
  skills: CvSkill[]
  sideProjects: LocalizedSideProject[]
}

export interface ProfileOverride {
  id: ProfileId
  label: LocalizedText
  headline: LocalizedText
  about: LocalizedText
  /** Experience description overrides keyed by experience id */
  experienceOverrides?: Record<string, LocalizedText>
  /** Expertise item keys (English base name) in preferred order */
  expertiseOrder?: string[]
  /** Skill names in preferred order */
  skillsOrder?: string[]
  /** Side project ids in preferred order */
  sideProjectsOrder?: string[]
}

export const PROFILE_IDS: ProfileId[] = [
  'cloud',
  'fullstack',
  'techlead',
  'genai',
  'devops',
]

export const LOCALES: Locale[] = ['en', 'es']

export const DEFAULT_PROFILE: ProfileId = 'cloud'
export const DEFAULT_LOCALE: Locale = 'es'

export function isProfileId(value: unknown): value is ProfileId {
  return typeof value === 'string' && PROFILE_IDS.includes(value as ProfileId)
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.includes(value as Locale)
}

export function t(text: LocalizedText, locale: Locale): string {
  return text[locale]
}

import { cvBase, expertiseKeys, sectionLabels } from './cv'
import { profileOverrides } from './profiles'
import type {
  CvData,
  CvExperience,
  CvSideProject,
  Locale,
  LocalizedExperience,
  LocalizedSideProject,
  LocalizedText,
  ProfileId,
} from './types'
import {
  DEFAULT_LOCALE,
  DEFAULT_PROFILE,
  isLocale,
  isProfileId,
  t,
} from './types'

function reorderByKey<T>(
  items: T[],
  order: string[] | undefined,
  getKey: (item: T) => string,
): T[] {
  if (!order?.length) return items

  const map = new Map(items.map((item) => [getKey(item), item]))
  const result: T[] = []
  const seen = new Set<string>()

  for (const key of order) {
    const item = map.get(key)
    if (item) {
      result.push(item)
      seen.add(key)
    }
  }

  for (const item of items) {
    const key = getKey(item)
    if (!seen.has(key)) result.push(item)
  }

  return result
}

function resolveExperience(
  items: LocalizedExperience[],
  locale: Locale,
  overrides?: Record<string, LocalizedText>,
): CvExperience[] {
  return items.map((job) => ({
    title: t(job.title, locale),
    company: job.company,
    period: t(job.period, locale),
    description: t(overrides?.[job.id] ?? job.description, locale),
  }))
}

function resolveSideProjects(
  items: LocalizedSideProject[],
  locale: Locale,
  order?: string[],
): CvSideProject[] {
  const ordered = reorderByKey(items, order, (p) => p.id)
  return ordered.map((project) => ({
    title: project.title,
    meta: t(project.meta, locale),
    description: t(project.description, locale),
    keywords: project.keywords,
  }))
}

export function parseProfile(value: unknown): ProfileId {
  return isProfileId(value) ? value : DEFAULT_PROFILE
}

export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export function resolveCv(
  profile: ProfileId = DEFAULT_PROFILE,
  locale: Locale = DEFAULT_LOCALE,
): CvData {
  const override = profileOverrides[profile] ?? profileOverrides[DEFAULT_PROFILE]
  const labels = sectionLabels[locale]

  const countryValue =
    locale === 'es' ? 'México' : cvBase.contact.find((c) => c.type === 'country')?.value ?? 'Mexico'

  const contact = cvBase.contact.map((item) => ({
    type: item.type,
    label: labels[item.type],
    value: item.type === 'country' ? countryValue : item.value,
  }))

  const expertiseOrdered = reorderByKey(
    expertiseKeys.map((key, index) => ({ key, text: cvBase.expertise[index] })),
    override.expertiseOrder,
    (item) => item.key,
  ).map((item) => t(item.text, locale))

  const skills = reorderByKey(
    cvBase.skills,
    override.skillsOrder,
    (skill) => skill.name,
  )

  return {
    firstName: cvBase.firstName,
    lastName: cvBase.lastName,
    headline: t(override.headline, locale),
    photo: cvBase.photo,
    about: t(override.about, locale),
    contact,
    experiencePage1: resolveExperience(
      cvBase.experiencePage1,
      locale,
      override.experienceOverrides,
    ),
    experiencePage2: resolveExperience(
      cvBase.experiencePage2,
      locale,
      override.experienceOverrides,
    ),
    education: {
      degree: t(cvBase.education.degree, locale),
      school: cvBase.education.school,
      period: t(cvBase.education.period, locale),
    },
    expertise: expertiseOrdered,
    skills,
    sideProjects: resolveSideProjects(
      cvBase.sideProjects,
      locale,
      override.sideProjectsOrder,
    ),
    labels,
    profile,
    locale,
  }
}

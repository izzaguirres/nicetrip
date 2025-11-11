const normalize = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '')

const normalizeGroupId = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')

export type TransportKey = 'bus' | 'aereo'

export interface AgeGroupOption {
  id: string
  label: string
  min: number | null
  max: number | null
  transport: TransportKey
}

export interface AgeRange {
  min: number | null
  max: number | null
}

const AGE_GROUPS_BY_TRANSPORT: Record<TransportKey, AgeGroupOption[]> = {
  bus: [
    { id: 'bus_adult', label: 'Adultos', min: 18, max: null, transport: 'bus' },
    { id: 'bus_child_0_3', label: 'Niños (0-3 años)', min: 0, max: 3, transport: 'bus' },
    { id: 'bus_child_4_5', label: 'Niños (4-5 años)', min: 4, max: 5, transport: 'bus' },
    { id: 'bus_child_6_plus', label: 'Niños (6+ años)', min: 6, max: 17, transport: 'bus' },
  ],
  aereo: [
    { id: 'aereo_adult', label: 'Adultos', min: 18, max: null, transport: 'aereo' },
    { id: 'aereo_child_0_2', label: 'Niños (0-2 años)', min: 0, max: 2, transport: 'aereo' },
    { id: 'aereo_child_2_5', label: 'Niños (2-5 años)', min: 3, max: 5, transport: 'aereo' },
    { id: 'aereo_child_6_plus', label: 'Niños (6+ años)', min: 6, max: 17, transport: 'aereo' },
  ],
}

const ALL_GROUP_ID = 'all'
const ALL_GROUP_OPTION = { id: ALL_GROUP_ID, label: 'Todas as idades', min: null, max: null } as const

export const CUSTOM_GROUP_ID = 'custom'

const FLAT_GROUPS = Object.values(AGE_GROUPS_BY_TRANSPORT).flat()

export function resolveTransportKey(value?: string | null): TransportKey | null {
  const normalized = normalize(value)
  if (!normalized) return null
  if (normalized.includes('aer')) return 'aereo'
  return 'bus'
}

export function getAgeGroupsForTransport(
  transport?: string | null,
): Array<AgeGroupOption | typeof ALL_GROUP_OPTION> {
  const key = resolveTransportKey(transport)
  if (!key) return [ALL_GROUP_OPTION]
  return [ALL_GROUP_OPTION, ...AGE_GROUPS_BY_TRANSPORT[key]]
}

export function findAgeGroupByRange(min?: number | null, max?: number | null) {
  if (min == null && max == null) return ALL_GROUP_OPTION
  return FLAT_GROUPS.find((group) => group.min === (min ?? null) && group.max === (max ?? null)) || null
}

export function mapAgeGroupToRange(
  ageGroupId: string | null,
  transport?: string | null,
  customRange?: AgeRange | null,
): AgeRange {
  if (!ageGroupId || ageGroupId === ALL_GROUP_ID) {
    return { min: null, max: null }
  }

  if (ageGroupId === CUSTOM_GROUP_ID && customRange) {
    return customRange
  }

  const key = resolveTransportKey(transport)
  const searchScope = key ? AGE_GROUPS_BY_TRANSPORT[key] : FLAT_GROUPS
  const match = searchScope.find((group) => group.id === ageGroupId)
  if (match) {
    return { min: match.min, max: match.max }
  }
  return { min: null, max: null }
}

export function formatAgeRangeLabel(min?: number | null, max?: number | null) {
  const match = findAgeGroupByRange(min ?? null, max ?? null)
  if (match) return match.label
  if (min != null && max != null) return `${min} - ${max} anos`
  if (min != null) return `A partir de ${min} anos`
  if (max != null) return `Até ${max} anos`
  return ALL_GROUP_OPTION.label
}

export function shouldShowCustomAgeOption(min?: number | null, max?: number | null) {
  const match = findAgeGroupByRange(min ?? null, max ?? null)
  return Boolean(match === null && (min != null || max != null))
}

export const ALL_AGE_GROUP_ID = ALL_GROUP_ID

export function getAgeGroupLabel(id: string) {
  if (normalizeGroupId(id) === normalizeGroupId(ALL_GROUP_ID)) {
    return ALL_GROUP_OPTION.label
  }
  const match = FLAT_GROUPS.find((group) => normalizeGroupId(group.id) === normalizeGroupId(id))
  return match?.label ?? id
}

export function getAgeGroupIdForAge(age: number, transport?: string | null) {
  const key = resolveTransportKey(transport)
  if (!key) return null
  const groups = AGE_GROUPS_BY_TRANSPORT[key]
  return (
    groups.find((group) => {
      const minOK = group.min == null || age >= group.min
      const maxOK = group.max == null || age <= group.max
      return minOK && maxOK
    })?.id ?? null
  )
}

export function formatSelectedAgeGroups(
  ageGroups?: string[] | null,
  fallbackMin?: number | null,
  fallbackMax?: number | null,
) {
  if (ageGroups && ageGroups.length > 0) {
    return ageGroups.map((group) => getAgeGroupLabel(group)).join(', ')
  }
  return formatAgeRangeLabel(fallbackMin, fallbackMax)
}

export { normalizeGroupId as normalizeAgeGroupId }

import { defineOptionsMetadata } from '@/components/define'
import { FilterOptions } from './rules'

export const componentName = 'recommendationFilter'

const integerValidator =
  (minimum: number, maximum = Number.MAX_SAFE_INTEGER) =>
  (value: number, oldValue: number) =>
    Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : oldValue

export const options = defineOptionsMetadata<FilterOptions & Record<string, unknown>>({
  keywordGroups: { defaultValue: [], hidden: true },
  windowWidth: { defaultValue: 960, hidden: true, validator: integerValidator(640, 2000) },
  windowHeight: { defaultValue: 760, hidden: true, validator: integerValidator(420, 1400) },
  durationEnabled: { defaultValue: false, hidden: true },
  minimumMinutes: { defaultValue: 0, hidden: true, validator: integerValidator(0) },
  minimumSeconds: { defaultValue: 0, hidden: true, validator: integerValidator(0, 59) },
  viewsEnabled: { defaultValue: false, hidden: true },
  minimumViews: { defaultValue: 0, hidden: true, validator: integerValidator(0) },
  followedExempt: { defaultValue: true, hidden: true },
  ageEnabled: { defaultValue: false, hidden: true },
  maximumAgeDays: { defaultValue: 30, hidden: true, validator: integerValidator(1) },
})

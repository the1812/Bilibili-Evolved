import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'

export const options = defineOptionsMetadata({
  disabledGroupIds: {
    defaultValue: [] as number[],
    displayName: 'Disabled group IDs',
    hidden: true,
  },
})

export type FeedsGroupFilterOptions = OptionsOfMetadata<typeof options>

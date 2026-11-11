import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'

export const options = defineOptionsMetadata({
  filterUpList: {
    defaultValue: false,
    displayName: '同步筛选顶部 UP 主头像',
  },
  disabledGroupIds: {
    defaultValue: [] as number[],
    displayName: 'Disabled group IDs',
    hidden: true,
  },
})

export type FeedsGroupFilterOptions = OptionsOfMetadata<typeof options>

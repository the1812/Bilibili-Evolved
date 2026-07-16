import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'

export const checkInOptions = defineOptionsMetadata({
  autoSeedsToCoins: {
    displayName: '每日自动瓜子换硬币',
    defaultValue: false,
  },
  lastSeedsToCoins: {
    displayName: '最后瓜子换硬币时间',
    defaultValue: 0,
    hidden: true,
  },
})
export type CheckInOptions = OptionsOfMetadata<typeof checkInOptions>

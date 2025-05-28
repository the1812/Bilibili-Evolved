import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { FollowingListID } from './types'

export const UnselectedListID: FollowingListID = -1

export const options = defineOptionsMetadata({
  pinnedListID: {
    defaultValue: UnselectedListID as FollowingListID,
    displayName: '置顶列表 ID',
    hidden: true,
  },
  hiddenListID: {
    defaultValue: UnselectedListID as FollowingListID,
    displayName: '隐藏列表 ID',
    hidden: true,
  },
})

export type ExtendFeedsLiveOptions = OptionsOfMetadata<typeof options>

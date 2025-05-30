export type FollowingListID = number

export interface LiveInfo {
  cover: string
  face: string
  uname: string
  title: string
  roomid: number
  pic: string
  online: number
  uid: number
  link: string
}

export interface FollowingUserInfo {
  mid: number
  attribute: number
  special: number
  contract_info: Record<string, unknown>
  uname: string
  face: string
  sign: string
  face_nft: number
  official_verify: {
    type: number
    desc: string
  }
  vip: {
    vipType: number
    vipDueDate: number
    dueRemark: string
    accessStatus: number
    vipStatus: number
    vipStatusWarn: string
    themeType: number
    label: {
      path: string
      text: string
      label_theme: string
      text_color: string
      bg_style: number
      bg_color: string
      border_color: string
    }
    avatar_subscript: number
    nickname_color: string
    avatar_subscript_url: string
  }
  name_render: Record<string, unknown>
  live: {
    live_status: number
    jump_url: string
  }
  nft_icon: string
  rec_reason: string
  track_id: string
  follow_time: string
}
export interface RawFollowingListItem {
  tagid: number
  name: string
  count: number
  tip: string
}
export interface FollowingListItem {
  id: FollowingListID
  displayName: string
  count: number
}

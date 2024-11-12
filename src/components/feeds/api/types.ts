/**
 * 表示一种动态卡片类型
 */
export interface FeedsCardType {
  id: number
  name: string
  /** 用于新版动态 API 的 type (/x/polymer/web-dynamic/), 各种动态类型对应的 type 还不完善 */
  apiType?: string
}
/**
 * 转发类型的动态卡片
 */
export interface RepostFeedsCardType extends FeedsCardType {
  id: 1
  name: '转发'
}
export const feedsCardTypes = {
  repost: {
    id: 1,
    name: '转发',
  },
  textWithImages: {
    id: 2,
    name: '图文',
  },
  text: {
    id: 4,
    name: '文字',
  },
  video: {
    id: 8,
    name: '视频',
    apiType: 'video',
  },
  miniVideo: {
    id: 16,
    name: '小视频',
  },
  column: {
    id: 64,
    name: '专栏',
    apiType: 'article',
  },
  audio: {
    id: 256,
    name: '音频',
  },
  bangumi: {
    id: 512,
    name: '番剧',
    apiType: 'pgc',
  },
  share: {
    id: 2048,
    name: '分享',
  },
  manga: {
    id: 2049,
    name: '漫画',
  },
  film: {
    id: 4098,
    name: '电影',
  },
  tv: {
    id: 4099,
    name: 'TV剧',
  },
  chinese: {
    id: 4100,
    name: '国创',
  },
  documentary: {
    id: 4101,
    name: '纪录片',
  },
  mediaList: {
    id: 4300,
    name: '收藏夹',
  },
  liveRecord: {
    id: 2047, // FIXME: 暂时随便写个 id 了, 这个东西目前找不到 type
    name: '开播记录',
  },
} satisfies Record<string, FeedsCardType>
/** 是否是转发类型的卡片, 额外能够读取被转发动态的信息 */
export const isRepostType = (card: FeedsCard): card is RepostFeedsCard =>
  card.type === feedsCardTypes.repost
/** 番剧类型列表 (用于API请求) */
export const bangumiTypeList = '512,4097,4098,4099,4100,4101'
/** 顶栏动态类型列表 (用于API请求) */
export const navbarFeedsTypeList = '8,64,512,4097,4098,4099,4100,4101'
/**
 * 表示一个动态卡片
 */
export interface FeedsCard {
  /** 动态 ID */
  id: string
  /** 发送者名称 */
  username: string
  /** 动态内容 */
  text: string
  /** 转发量 */
  reposts: number
  /** 评论量 */
  comments: number
  /** 点赞量 */
  likes: number
  /** 对应的 DOM 元素 */
  element: HTMLElement
  /** 类型 */
  type: FeedsCardType
  /** 是否已填充内容 (非骨架状态) */
  presented: boolean
  /** 获取动态内容, 更新至 `text` 属性中 */
  getText: () => Promise<string>
}
/** 转发类型的动态卡片 */
export interface RepostFeedsCard extends FeedsCard {
  /** 被转发动态的发送者名称 */
  repostUsername: string
  /** 被转发动态的内容 */
  repostText: string
  /** 被转发动态的 ID */
  repostId: string
  type: RepostFeedsCardType
}
/**
 * 对动态卡片增删的监听
 */
export type FeedsCardCallback = {
  added?: (card: FeedsCard) => void
  removed?: (card: FeedsCard) => void
}

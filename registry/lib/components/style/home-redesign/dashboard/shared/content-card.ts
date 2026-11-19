import type { InjectionKey, Ref } from 'vue'
import type { VideoCard } from '@/components/feeds/video-card'

export type ContentCardLayout = 'horizontal' | 'compact' | 'vertical'
export const contentCardLayoutKey: InjectionKey<Readonly<Ref<ContentCardLayout | undefined>>> =
  Symbol('dashboardHomeContentCardLayout')

export type ContentCardKind = 'video' | 'article' | 'bangumi' | 'other'

export type ContentCardData = Pick<VideoCard, 'title'> &
  Partial<
    Pick<
      VideoCard,
      | 'url'
      | 'aid'
      | 'bvid'
      | 'epID'
      | 'coverUrl'
      | 'description'
      | 'durationText'
      | 'pubTime'
      | 'pubTimeText'
      | 'watchlater'
      | 'upID'
      | 'upName'
      | 'upFaceUrl'
      | 'cooperation'
      | 'topics'
      | 'like'
      | 'playCount'
      | 'danmakuCount'
      | 'coins'
      | 'favorites'
    >
  > & {
    kind?: ContentCardKind
    coverSrcset?: string
    upUrl?: string
    detail?: string
    badge?: string
    progress?: number
    readCount?: string
  }

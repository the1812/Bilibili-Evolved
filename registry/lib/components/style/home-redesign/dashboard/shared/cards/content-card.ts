import type { InjectionKey, Ref } from 'vue'
import type { VideoCard } from '@/components/feeds/video-card'
import { LayoutOption } from '../../options'

export type ContentCardLayout = 'horizontal' | 'compact' | 'vertical'
export const contentCardLayoutKey: InjectionKey<Readonly<Ref<ContentCardLayout | undefined>>> =
  Symbol('dashboardHomeContentCardLayout')

export const contentCardLayouts: Record<LayoutOption, ContentCardLayout> = {
  [LayoutOption.Horizontal]: 'horizontal',
  [LayoutOption.Compact]: 'compact',
  [LayoutOption.Vertical]: 'vertical',
}

export type ContentCardKind = 'video' | 'column' | 'bangumi' | 'other'

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

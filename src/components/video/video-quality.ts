import { descendingSort } from '@/core/utils/sort'

export interface VideoQuality {
  name: string
  value: number
  displayName: string
}
export const loginRequiredQualities: VideoQuality[] = [
  {
    name: '720P',
    displayName: '高清 720P',
    value: 64,
  },
  {
    name: '1080P',
    displayName: '高清 1080P',
    value: 80,
  },
]
export const vipRequiredQualities: VideoQuality[] = [
  {
    name: '8K',
    displayName: '超高清 8K',
    value: 127,
  },
  {
    name: 'DolbyVision',
    displayName: '杜比视界',
    value: 126,
  },
  {
    name: 'HDR',
    displayName: '真彩 HDR',
    value: 125,
  },
  {
    name: '4K',
    displayName: '超清 4K',
    value: 120,
  },
  {
    name: '1080P60',
    displayName: '高清 1080P60',
    value: 116,
  },
  {
    name: '1080P+',
    displayName: '高清 1080P+',
    value: 112,
  },
  {
    name: '720P60',
    displayName: '高清 720P60',
    // 有的视频的 720P60 也是用的 value = 64, 很奇怪...
    value: 74,
  },
]
export const allQualities: VideoQuality[] = [
  ...vipRequiredQualities,
  ...loginRequiredQualities,
  {
    name: '480P',
    displayName: '清晰 480P',
    value: 32,
  },
  {
    name: '360P',
    displayName: '流畅 360P',
    value: 16,
  },
].sort(descendingSort(q => q.value))

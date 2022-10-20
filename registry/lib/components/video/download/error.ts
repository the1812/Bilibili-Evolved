import { loginRequiredQualities, vipRequiredQualities } from '@/components/video/video-quality'
import { DownloadVideoInfo, DownloadVideoInputItem } from './types'

export const throwQualityError = (value: number) => {
  // 大会员清晰度: 4K 1080P60 1080P+ 720P60
  if (vipRequiredQualities.find(q => q.value === value)) {
    throw new Error('您选择的清晰度需要大会员, 请更改清晰度后重试.')
  }
  // 登录后可看清晰度: 1080P 720P
  if (loginRequiredQualities.find(q => q.value === value)) {
    throw new Error('您选择的清晰度需要先登录.')
  }
  throw new Error('获取下载链接失败, 请尝试更换清晰度或更换格式.')
}
export const compareQuality = (input: DownloadVideoInputItem, info: DownloadVideoInfo) => {
  if (input.quality && info.currentQuality.value !== input.quality.value) {
    if (input.allowQualityDrop) {
      console.warn(
        `'${input.title}' 不支持选择的清晰度${input.quality.displayName}, 已降级为${info.currentQuality.displayName}`,
      )
    } else {
      throwQualityError(input.quality.value)
    }
  }
}

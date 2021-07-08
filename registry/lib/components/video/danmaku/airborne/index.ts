/* Original author: kdxcxs (https://github.com/kdxcxs) */

import { toggleStyle } from '@/components/styled-component'
import { ComponentMetadata } from '@/components/types'
import { DanmakuRecord, forEachVideoDanmaku } from '@/components/video/video-danmaku'
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  displayName: '启用弹幕空降',
  tags: [componentsTags.video],
  enabledByDefault: true,
  urlInclude: playerUrls,
  ...toggleStyle('danmakuAirborne', () => import('./airborne.scss'), async ({ settings }) => {
    const { enabled } = settings
    const getAirborneTime = (text: string | null) => {
      if (!text) {
        return NaN
      }
      const airborneMatch = text.match(/(\d+)[ ]*[:：时分][ ]*(\d+)([ ]*[:：分][ ]*(\d+))?/)
      if (!airborneMatch) {
        return NaN
      }
      if (airborneMatch[3]) { // 含有小时
        const [, hour, minute, , second] = airborneMatch.map(r => parseInt(r))
        if ([hour, minute, second].some(v => Number.isNaN(v))) {
          return NaN
        }
        if (text.includes('分') && !text.includes('时')) {
          return NaN
        }
        return hour * 3600 + minute * 60 + second
      }
      const [, minute, second] = airborneMatch.map(r => parseInt(r))
      if ([minute, second].some(v => Number.isNaN(v))) {
        return NaN
      }
      return minute * 60 + second
    }
    const airborneHandler = (e: MouseEvent) => {
      if (!enabled) {
        return
      }
      const target = e.target as HTMLElement
      if (!target.classList.contains('b-danmaku')) {
        return
      }
      const time = getAirborneTime(target.textContent)
      if (!Number.isNaN(time)) {
        const video = dq('video') as HTMLVideoElement
        video.currentTime = time
        video.play()
      }
    }
    const addAirborneStyle = (danmaku: DanmakuRecord) => {
      const canAirborne = !Number.isNaN(getAirborneTime(danmaku.text))
      danmaku.element.classList.toggle('airborne', canAirborne)
    }
    forEachVideoDanmaku({ added: addAirborneStyle })
    videoChange(async () => {
      const wrapper = await select('.bilibili-player-video-wrap') as HTMLElement
      if (wrapper.classList.contains('airborne-enabled')) {
        return
      }
      wrapper.classList.add('airborne-enabled')
      wrapper.addEventListener('click', airborneHandler)
    })
  }),
}

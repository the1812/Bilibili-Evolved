import { toggleStyle } from '@/components/styled-component'
import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { DanmakuRecord, forEachVideoDanmaku } from '@/components/video/video-danmaku'
import { videoChange } from '@/core/observer'
import { playerUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  displayName: '启用弹幕空降',
  author: {
    name: 'kdxcxs',
    link: 'https://github.com/kdxcxs',
  },
  description: {
    'zh-CN': '为可能含有时间点的弹幕添加下划线, 点击可以跳到视频对应时间.',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  ...toggleStyle(
    'danmakuAirborne',
    () => import('./airborne.scss'),
    async ({ settings }) => {
      const { enabled } = settings
      const getAirborneTime = (text: string | null) => {
        if (!text) {
          return NaN
        }
        const airborneMatch = text.match(/(\d+)[ ]*[:：时分][ ]*(\d+)([ ]*[:：分][ ]*(\d+))?/)
        if (!airborneMatch) {
          return NaN
        }
        if (airborneMatch[3]) {
          // 含有小时
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
        if (
          !['b-danmaku', 'bili-dm', 'bili-danmaku-x-dm'].some(token =>
            target.classList.contains(token),
          )
        ) {
          return
        }
        const time = getAirborneTime(target.textContent)
        if (!Number.isNaN(time)) {
          unsafeWindow.player.seek(time, false)
        }
      }
      const detectAirborne = (danmaku: DanmakuRecord) => {
        const canAirborne = !Number.isNaN(getAirborneTime(danmaku.text))
        danmaku.element.classList.toggle('airborne', canAirborne)
      }
      forEachVideoDanmaku({ added: detectAirborne })
      videoChange(async () => {
        const wrapper = (await playerAgent.query.video.wrap()) as HTMLElement
        if (wrapper.classList.contains('airborne-enabled')) {
          return
        }
        wrapper.classList.add('airborne-enabled')
        wrapper.addEventListener('click', airborneHandler)
      })
    },
  ),
})

import {
  defineOptionsMetadata,
  OptionsOfMetadata,
  defineComponentMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'

const options = defineOptionsMetadata({
  allowJump: {
    displayName: '允许跨集跳转',
    defaultValue: false,
  },
})

export type Options = OptionsOfMetadata<typeof options>

const entry: ComponentEntry<Options> = async ({ settings }) => {
  const { isEmbeddedPlayer, dq } = await import('@/core/utils')
  if (isEmbeddedPlayer()) {
    return
  }
  const { videoChange } = await import('@/core/observer')
  const { sq } = await import('@/core/spin-query')
  const { logError } = await import('@/core/utils/log')
  videoChange(async () => {
    const toast = await sq(
      () => dq('.bilibili-player-video-toast-item-text') as HTMLElement,
      it => it?.innerText.includes('上次看到') ?? false,
    )
    if (toast) {
      const text = toast.innerText
      const parent = toast.parentElement

      if (/第(\d+)话/.test(text)) {
        if (settings.options.allowJump) {
          const jumpButton = dq(parent, '.bilibili-player-video-toast-item-jump') as HTMLElement
          jumpButton?.click()
        }
        return
      }

      const timeRegex = /((\d)*:)?(\d)*:(\d)*/g
      const match = text.match(timeRegex)
      if (!match) {
        return
      }

      const historyTime = match[0].split(':')
      const time = (() => {
        if (historyTime.length === 3) {
          const [hour, minute, second] = historyTime.map(it => parseInt(it))
          return hour * 60 * 60 + minute * 60 + second
        }
        if (historyTime.length === 2) {
          const [minute, second] = historyTime.map(it => parseInt(it))
          return minute * 60 + second
        }

        logError(`解析历史时间发生错误: historyTime=${JSON.stringify(historyTime)}`)
        return NaN
      })()
      const video = dq('video') as HTMLVideoElement
      const closeButton = dq(parent, '.bilibili-player-video-toast-item-close') as HTMLElement
      if (time < video.duration) {
        video.currentTime = time
        video.play()
        dq(parent, '.bilibili-player-video-toast-item-jump')?.remove()
        const restart = document.createElement('div')
        restart.classList.add('bilibili-player-video-toast-item-jump')
        restart.textContent = '从头开始'
        restart.addEventListener('click', () => {
          video.currentTime = 0
          closeButton?.click()
        })
        parent.insertAdjacentElement('beforeend', restart)
        toast.innerHTML = `<span>已跳转到上次历史记录</span><span>${match[0]}</span>`
      } else {
        closeButton?.click()
      }
    }
  })
}

export const component = defineComponentMetadata({
  name: 'autoContinue',
  displayName: '历史记录点自动播放',
  tags: [componentsTags.video],
  entry,
  urlInclude: playerUrls,
  description: {
    'zh-CN': '播放视频时如果检测到历史记录信息(`上次看到...`消息), 则自动跳转到相应的时间播放.',
  },
  options,
})

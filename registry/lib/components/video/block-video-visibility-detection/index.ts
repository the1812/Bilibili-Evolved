import { defineComponentMetadata } from '@/components/define'
import { createHook } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { videoUrls } from '@/core/utils/urls'

let restore: (() => void) | undefined

const isAudioOnlyTimer = (handler: TimerHandler) => {
  if (document.visibilityState !== 'hidden') {
    return false
  }
  const source = String(handler)
  const isMatch =
    source.includes('isVideoDisabledByBackNormal') &&
    source.includes('switch_to_audio_mode') &&
    source.includes('skip_audio_only_mode')
  if (isMatch) {
    const console = useScopedConsole('禁止视频可见性检测')
    console.log('已拦截视频可见性检测')
  }
  return isMatch
}

const entry = () => {
  if (restore) {
    return
  }

  restore = createHook(
    unsafeWindow,
    'setTimeout',
    (handler: TimerHandler) => !isAudioOnlyTimer(handler),
  )
}

const unload = () => {
  restore?.()
  restore = undefined
}

export const component = defineComponentMetadata({
  name: 'blockVideoVisibilityDetection',
  displayName: '禁止视频可见性检测',
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  tags: [componentsTags.video],
  entry,
  reload: entry,
  unload,
  urlInclude: videoUrls,
})

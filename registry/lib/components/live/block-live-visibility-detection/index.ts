import { defineComponentMetadata } from '@/components/define'
import { createHook } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { liveUrls } from '@/core/utils/urls'

let restore: (() => void) | undefined

const isQualitySwitchListener = (
  type: string,
  listener: EventListenerOrEventListenerObject | null,
) => {
  if (type !== 'visibilitychange' || listener === null) {
    return false
  }
  const source = String(listener)
  const isMatch =
    source.includes('live_room_visibility_quality_change_hidden') &&
    source.includes('beginCountDown') &&
    source.includes('clearCountDown') &&
    source.includes('switchToFrontend')
  if (isMatch) {
    const console = useScopedConsole('禁止直播可见性检测')
    console.log('已拦截直播可见性检测')
  }
  return isMatch
}

const entry = () => {
  if (restore) {
    return
  }

  restore = createHook(
    unsafeWindow.EventTarget.prototype,
    'addEventListener',
    (type, listener) => !isQualitySwitchListener(type, listener),
  )
}

const unload = () => {
  restore?.()
  restore = undefined
}

export const component = defineComponentMetadata({
  name: 'blockLiveVisibilityDetection',
  displayName: '禁止直播可见性检测',
  tags: [componentsTags.live],
  entry,
  reload: entry,
  unload,
  urlInclude: liveUrls,
})

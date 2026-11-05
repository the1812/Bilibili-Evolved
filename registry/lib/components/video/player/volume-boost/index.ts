import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { waitForControlBar } from '@/components/live/live-control-bar'
import { childListSubtree, urlChange, videoChange } from '@/core/observer'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { useScopedConsole } from '@/core/utils/log'
import { allVideoUrls, liveUrls, matchCurrentPage } from '@/core/utils/urls'
import { showPlayerTip } from '../common/player-tip/player-tip'
import { createGainPanel, GainPanel } from './panel'
import { clampGainPercent, minGainPercent, VolumeGain } from './volume-gain'

const name = 'volumeBoost'
const buttonClass = 'be-volume-boost'

const options = defineOptionsMetadata({
  records: {
    defaultValue: {} as Record<string, number>,
    hidden: true,
  },
  showTip: {
    defaultValue: true,
    displayName: '滚轮调节时显示提示',
  },
})
export type Options = OptionsOfMetadata<typeof options>

/** 读取直播间号, 直播页的记忆以直播间为单位 */
const getLiveRoomId = () => document.URL.match(/live\.bilibili\.com\/(?:blanc\/)?(\d+)/)?.[1]

const upLinkSelectors = [
  '.up-info-container a[href*="space.bilibili.com/"]',
  'a.up-name[href*="space.bilibili.com/"]',
  '.up-info a[href*="space.bilibili.com/"]',
  '#v_upinfo a[href*="space.bilibili.com/"]',
]

/**
 * 记忆时使用的键: 视频页按 UP 主, 直播页按直播间, 两者互不影响.
 * UP 主信息取不到时退回当前页面, 至少保证同一个页面内的记忆是有效的.
 */
const resolveRecordKey = async () => {
  if (matchCurrentPage(liveUrls)) {
    const roomId = getLiveRoomId()
    return roomId ? `live/${roomId}` : null
  }
  const upLink = await select(
    () => upLinkSelectors.map(selector => dq(selector)).find(it => it !== null) ?? null,
    { maxRetry: 30, queryInterval: 400 },
  )
  const upId = upLink?.getAttribute('href')?.match(/space\.bilibili\.com\/(\d+)/)?.[1]
  if (upId) {
    return `up/${upId}`
  }
  const { aid } = unsafeWindow
  return aid ? `aid/${aid}` : `page/${location.pathname}`
}

let teardown: () => void = () => undefined

const setup = () => {
  teardown()

  const settings = getComponentSettings<Options>(name)
  const console = useScopedConsole(name)
  const isLivePage = matchCurrentPage(liveUrls)
  const gain = new VolumeGain()
  /** videoChange 和 urlChange 每注册一次就会多一个监听, 关闭组件时需要一并撤销 */
  const abort = new AbortController()
  let enabled = true
  let panel: GainPanel | null = null
  let recordKey: string | null = null
  let stopObserver: (() => void) | null = null
  /** 用户手动改过增益后, 就不再让异步读取到的记忆值覆盖它 */
  let dirty = false
  let restoreToken = 0

  const findVideo = () => {
    const video = dq(
      '.bpx-player-video-wrap video, .bpx-player-video-area video, .live-player-mounter video, .live-player-ctnr video',
    )
    return video instanceof HTMLVideoElement ? video : null
  }

  const syncVideo = () => {
    gain.setVideo(findVideo())
  }

  const remember = (percent: number) => {
    if (!recordKey) {
      return
    }
    const records = { ...settings.options.records }
    if (percent > minGainPercent) {
      records[recordKey] = percent
    } else {
      delete records[recordKey]
    }
    settings.options.records = records
  }

  const changePercent = (percent: number, source: 'drag' | 'wheel') => {
    dirty = true
    gain.setPercent(percent)
    remember(percent)
    // 直播页没有播放器中央的提示层, 只在视频页显示
    if (source === 'wheel' && !isLivePage && settings.options.showTip) {
      showPlayerTip(`${percent}%`, 'mdi-volume-plus').catch(() => undefined)
    }
  }

  /**
   * 读取当前页面的记忆值并应用.
   * 只有在页面上下文变化 (切换视频 / 直播) 时才调用, 因此可以放心地覆盖页面上已有的状态.
   */
  const restore = () => {
    restoreToken += 1
    const token = restoreToken
    dirty = false
    syncVideo()
    resolveRecordKey()
      .then(key => {
        // UP 主信息可能还要等上一小会儿, 期间用户可能已经自己调过了
        if (!enabled || token !== restoreToken || dirty) {
          return
        }
        recordKey = key
        const remembered = key ? settings.options.records[key] : undefined
        const percent = clampGainPercent(remembered ?? minGainPercent)
        gain.setPercent(percent)
        panel?.setPercent(percent)
      })
      .catch(() => undefined)
  }

  const createPanel = (live = false) => {
    panel?.dispose()
    panel = createGainPanel({ percent: gain.getPercent(), onChange: changePercent, live })
    return panel.element
  }

  /** 视频页: 插在原生音量按钮的左边 */
  const insertVideoButton = () => {
    if (!enabled) {
      return
    }
    const volumeButton = dq('.bpx-player-ctrl-volume')
    if (!volumeButton) {
      return
    }
    const parent = volumeButton.parentElement
    if (parent?.querySelector(`.${buttonClass}`)) {
      return
    }
    volumeButton.insertAdjacentElement('beforebegin', createPanel())
    restore()
  }

  /** 直播页: 插在直播控制栏的音量按钮后面 */
  const insertLiveButton = (controlBar: Element) => {
    if (!enabled) {
      return
    }
    if (controlBar.querySelector(`.${buttonClass}`)) {
      return
    }
    const volumeButton = dq(controlBar, '.volume')
    if (!volumeButton) {
      return
    }
    volumeButton.insertAdjacentElement('afterend', createPanel(true))
    restore()
  }

  const watchVideoControlBar = async () => {
    const container = await select(
      () => dq('.bpx-player-container') ?? dq('.bpx-player-control-wrap'),
      { maxRetry: 30, queryInterval: 400 },
    )
    if (!enabled) {
      return
    }
    if (!container) {
      console.warn('没有找到播放器, 音量增益的滑块无法插入')
      return
    }
    const [observer] = childListSubtree(container, () => {
      if (!enabled) {
        return
      }
      insertVideoButton()
      syncVideo()
    })
    stopObserver = () => observer.disconnect()
  }

  if (isLivePage) {
    waitForControlBar({ callback: insertLiveButton })
  } else {
    watchVideoControlBar()
  }

  videoChange(
    () => {
      if (enabled) {
        restore()
      }
    },
    { signal: abort.signal },
  )

  urlChange(
    () => {
      if (enabled) {
        restore()
      }
    },
    { signal: abort.signal },
  )

  teardown = () => {
    enabled = false
    abort.abort()
    stopObserver?.()
    stopObserver = null
    panel?.dispose()
    panel = null
    gain.dispose()
  }
}

export const component = defineComponentMetadata({
  name,
  displayName: '音量增益',
  instantStyles: [{ name, style: () => import('./volume-boost.scss') }],
  tags: [componentsTags.video, componentsTags.live],
  urlInclude: [...allVideoUrls, ...liveUrls],
  options,
  entry: setup,
  reload: setup,
  unload: () => teardown(),
  author: {
    name: 'Swithin157',
    link: 'https://github.com/Swithin157',
  },
})

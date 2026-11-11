import { playerAgent } from '@/components/video/player-agent'
import { sq } from '@/core/spin-query'

export const HISTORY_TOAST_TEXT_PREFIXES = ['已为您定位至', '上次看到', '定位至上次']
export const HISTORY_TOAST_TEXT_SELECTOR = [
  '.bpx-player-toast-row .bpx-player-toast-item .bpx-player-toast-text',
  '.bpx-player-toast-item .bpx-player-toast-text',
  '.bilibili-player-video-toast-item-text',
  '.bpx-player-toast-auto .bpx-player-toast-text',
].join(', ')

/** 单次采样间的最小跳变 (秒), 用于识别官方续播 seek, 避免把正常播放当成历史 */
export const RESUME_JUMP_SECONDS = 4

const timePattern = /(\d{1,2}:)?\d{1,2}:\d{2}/

const log = (...args: unknown[]) => {
  console.info('[restartNearEnd]', ...args)
}

/** 将 mm:ss / hh:mm:ss 解析为秒 */
export const parseClockTime = (text: string) => {
  const match = text.match(timePattern)
  if (!match) {
    return null
  }
  const parts = match[0].split(':').map(part => Number.parseInt(part))
  if (parts.some(part => Number.isNaN(part))) {
    return null
  }
  if (parts.length === 3) {
    const [hour, minute, second] = parts
    return hour * 3600 + minute * 60 + second
  }
  if (parts.length === 2) {
    const [minute, second] = parts
    return minute * 60 + second
  }
  return null
}

const isHistoryToastText = (text: string | null | undefined) => {
  if (!text) {
    return false
  }
  return HISTORY_TOAST_TEXT_PREFIXES.some(prefix => text.includes(prefix))
}

export const findHistoryToastText = () => {
  const nodes = dqa(HISTORY_TOAST_TEXT_SELECTOR) as HTMLElement[]
  return nodes.find(node => isHistoryToastText(node.textContent)) ?? null
}

export type ResumeSource = 'toast' | 'player-jump' | 'player-deep'

export interface HistoryResumeInfo {
  time: number
  source: ResumeSource
}

const readPlayerTime = async () => {
  const nativeTime = playerAgent.nativeApi?.getCurrentTime?.()
  if (typeof nativeTime === 'number' && Number.isFinite(nativeTime)) {
    return nativeTime
  }
  const video = (await playerAgent.query.video.element()) as HTMLVideoElement | null
  if (!video || !Number.isFinite(video.currentTime)) {
    return 0
  }
  return video.currentTime
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

export interface WaitResumeOptions {
  timeoutMs: number
  /** 视频总时长, 用于判断“已经很深的进度”才算历史兜底 */
  duration: number
  /** 进度阈值 0-100, 仅当播放器进度已达该比例时, 才允许无 toast 的深进度兜底 */
  thresholdPercent: number
}

/**
 * 等待历史续播位置.
 *
 * 判定优先级:
 * 1. 官方定位 toast (最可靠)
 * 2. 播放器时间出现不连续大跳变 (官方 seek 特征)
 * 3. 观察窗口内进度已稳定且达到阈值 (组件启动较晚、toast 已消失)
 *
 * 不会把“从 0 正常播到几秒”误判为历史.
 */
export const waitForHistoryResume = async (
  options: WaitResumeOptions,
): Promise<HistoryResumeInfo | null> => {
  const { timeoutMs, duration, thresholdPercent } = options
  const startedAt = Date.now()
  let previous = -1
  let deepStableHits = 0
  const deepThresholdSeconds = Math.max(duration * (thresholdPercent / 100), 1)

  while (Date.now() - startedAt < timeoutMs) {
    const textElement = findHistoryToastText()
    if (textElement?.textContent) {
      const time = parseClockTime(textElement.textContent)
      if (time !== null) {
        log('detected history toast', textElement.textContent, time)
        return {
          time,
          source: 'toast',
        }
      }
    }

    const playerTime = await readPlayerTime()

    // 不连续大跳变: 0 -> 历史点, 或中途被官方 seek
    if (previous >= 0 && playerTime - previous >= RESUME_JUMP_SECONDS) {
      log('detected history by player jump', { from: previous, to: playerTime })
      return {
        time: playerTime,
        source: 'player-jump',
      }
    }

    // 组件启动已晚: 一进来就在阈值进度附近并保持稳定
    if (playerTime >= deepThresholdSeconds) {
      if (previous >= 0 && Math.abs(playerTime - previous) < 0.75) {
        deepStableHits += 1
      } else if (previous < 0) {
        deepStableHits = 1
      } else {
        deepStableHits = 0
      }
      if (deepStableHits >= 3) {
        log('detected history by deep stable progress', playerTime)
        return {
          time: playerTime,
          source: 'player-deep',
        }
      }
    } else {
      deepStableHits = 0
    }

    previous = playerTime
    await sleep(120)
  }

  const textElement = await sq(
    () => findHistoryToastText(),
    it => it !== null,
    { maxRetry: 2, queryInterval: 100 },
  )
  if (textElement?.textContent) {
    const time = parseClockTime(textElement.textContent)
    if (time !== null) {
      log('detected history toast (late)', textElement.textContent, time)
      return {
        time,
        source: 'toast',
      }
    }
  }

  const finalTime = await readPlayerTime()
  if (finalTime >= deepThresholdSeconds) {
    log('detected history by final deep progress', finalTime)
    return {
      time: finalTime,
      source: 'player-deep',
    }
  }

  log('no history resume detected', {
    timeoutMs,
    finalTime,
    deepThresholdSeconds,
  })
  return null
}

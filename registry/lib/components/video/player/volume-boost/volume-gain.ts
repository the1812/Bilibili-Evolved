import { useScopedConsole } from '@/core/utils/log'

/** 增益范围下限, 与原生音量完全一致 */
export const minGainPercent = 100
/** 增益范围上限 */
export const maxGainPercent = 300
/** 滑块上每一档对应的听感变化幅度 (dB) */
export const gainStepDecibel = 0.5
/** 上限增益对应的分贝数, 约为 9.54 dB */
export const maxGainDecibel = 20 * Math.log10(maxGainPercent / minGainPercent)

const console = useScopedConsole('volumeGain')

/** 把任意输入规整为范围内的整数百分比 */
export const clampGainPercent = (percent: number) => {
  if (!Number.isFinite(percent)) {
    return minGainPercent
  }
  return Math.round(lodash.clamp(percent, minGainPercent, maxGainPercent))
}

/** 增益百分比换算成分贝数 */
const decibelOfPercent = (percent: number) => 20 * Math.log10(percent / minGainPercent)

const percentOfRatioRaw = (ratio: number) =>
  clampGainPercent(minGainPercent * 10 ** ((lodash.clamp(ratio, 0, 1) * maxGainDecibel) / 20))

/** 分贝数换算成增益百分比 */
const percentOfDecibel = (decibel: number) => percentOfRatioRaw(decibel / maxGainDecibel)

/**
 * 滑块高度比例 (0 为最底部, 1 为最顶部) 与增益百分比互相换算.
 * 比例到分贝是线性的, 因此每一档的听感变化都相同, 越往上不会变得越不敏感.
 */
export const ratioOfPercent = (percent: number) =>
  lodash.clamp(decibelOfPercent(clampGainPercent(percent)) / maxGainDecibel, 0, 1)
export const percentOfRatio = (ratio: number) => percentOfRatioRaw(ratio)

/** 按一档的幅度调整增益, direction 为正表示增大 */
export const stepGainPercent = (percent: number, direction: number) => {
  const nextDecibel =
    decibelOfPercent(clampGainPercent(percent)) + Math.sign(direction) * gainStepDecibel
  return percentOfDecibel(lodash.clamp(nextDecibel, 0, maxGainDecibel))
}

interface AudioGraph {
  context: AudioContext
  source: MediaElementAudioSourceNode
  gain: GainNode
  /** 目前是否处于 (带压缩限幅的) 增益链路上 */
  chained: boolean
}

/** 媒体元素的音频链路, 同一个元素只能建立一次 */
const audioGraphs = new WeakMap<HTMLVideoElement, AudioGraph>()

/**
 * 软削波曲线: 0.8 以下线性透传, 超出部分用 tanh 平滑地压进 ±1
 * 压缩和限幅仍可能输出超过 1 的样本, 这里做最后一道保险, 保证任何增益下都不会削波
 */
const createSoftClipCurve = () => {
  const size = 4096
  const knee = 0.8
  const curve = new Float32Array(size)
  for (let index = 0; index < size; index += 1) {
    const input = (index / (size - 1)) * 2 - 1
    const magnitude = Math.abs(input)
    curve[index] =
      magnitude <= knee
        ? input
        : Math.sign(input) * (knee + (1 - knee) * Math.tanh((magnitude - knee) / (1 - knee)))
  }
  return curve
}

/** 切换音频链路的走向: 增益为 100% 时直接输出, 其余情况才经过压缩限幅 */
const setChained = (graph: AudioGraph, chained: boolean) => {
  if (graph.chained === chained) {
    return
  }
  graph.source.disconnect()
  if (chained) {
    graph.source.connect(graph.gain)
  } else {
    graph.source.connect(graph.context.destination)
  }
  graph.chained = chained
}

const createAudioGraph = (video: HTMLVideoElement) => {
  const existing = audioGraphs.get(video)
  if (existing) {
    return existing
  }
  try {
    const context = new AudioContext({ latencyHint: 'playback' })
    const source = context.createMediaElementSource(video)
    const gain = context.createGain()

    // 压缩器只在接近满刻度时才介入 (实测这个参数组合几乎不改变整体的响度),
    // 这样滑块每一档的听感变化依然等量, 而峰值又不会被推到削波
    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -2
    compressor.knee.value = 6
    compressor.ratio.value = 6
    compressor.attack.value = 0.003
    compressor.release.value = 0.25

    const softClip = context.createWaveShaper()
    softClip.curve = createSoftClipCurve()
    softClip.oversample = '4x'

    // 增益链路一直在那里, 只是没有输入, 由 `setChained` 决定源节点接不接进来
    gain.connect(compressor)
    compressor.connect(softClip)
    softClip.connect(context.destination)

    const graph: AudioGraph = { context, source, gain, chained: false }
    // 媒体元素的音频一旦交给 Web Audio 就不会再自己输出, 因此必须先接上直通, 避免无声
    source.connect(context.destination)
    audioGraphs.set(video, graph)
    return graph
  } catch (error) {
    console.error('无法为播放器建立用于音量增益的音频链路', error)
    return null
  }
}

/**
 * 浏览器的自动播放策略可能会让新建的 AudioContext 处于挂起状态,
 * 此时媒体元素的声音会被改由音频图输出, 但音频图并没有真正工作, 结果就是完全没有声音.
 * 因此只有在页面已经发生过用户手势之后才建立音频链路.
 */
const hasUserActivation = () =>
  navigator.userActivation ? navigator.userActivation.hasBeenActive : true

/** 播放器的音量增益, 同一时间只作用于一个媒体元素 */
export class VolumeGain {
  private percent = minGainPercent

  private graph: AudioGraph | null = null

  private video: HTMLVideoElement | null = null

  private cancelGestureWait: (() => void) | null = null

  getPercent() {
    return this.percent
  }

  /** 指定要应用增益的媒体元素, 播放器重建后需要重新指定 */
  setVideo(video: HTMLVideoElement | null) {
    if (video === this.video) {
      this.apply()
      return
    }
    // 音频链路会跟着媒体元素一起留在 `audioGraphs` 里, 不要在这里关闭,
    // 因为同一个媒体元素一旦交给 Web Audio 就无法再次建立音频源
    const previous = this.video
    if (previous) {
      const previousGraph = audioGraphs.get(previous)
      if (previousGraph) {
        previousGraph.gain.gain.value = 1
        setChained(previousGraph, false)
      }
    }
    this.video = video
    this.graph = null
    this.cancelGestureWait?.()
    this.cancelGestureWait = null
    this.apply()
  }

  setPercent(percent: number) {
    this.percent = clampGainPercent(percent)
    this.apply()
  }

  /** 组件被关闭时调用: 回到直通状态, 让播放器的声音与原生完全一致 */
  dispose() {
    this.cancelGestureWait?.()
    this.cancelGestureWait = null
    this.percent = minGainPercent
    const graph = this.graph ?? (this.video ? audioGraphs.get(this.video) ?? null : null)
    if (graph) {
      this.releaseChain(graph, true)
    }
    this.graph = null
    this.video = null
  }

  /** 回到直通状态, 顺便做一小段淡出, 避免切换时出现咔嗒声 */
  private releaseChain(graph: AudioGraph, immediate = false) {
    graph.gain.gain.setTargetAtTime(1, graph.context.currentTime, 0.02)
    const finish = () => {
      setChained(graph, false)
      graph.gain.gain.value = 1
    }
    if (immediate) {
      finish()
      return
    }
    window.setTimeout(() => {
      if (this.graph === graph && this.percent <= minGainPercent) {
        finish()
      }
    }, 80)
  }

  private apply() {
    const { video } = this
    if (!video) {
      return
    }
    if (this.percent <= minGainPercent) {
      if (this.graph) {
        this.releaseChain(this.graph)
      }
      return
    }
    const graph = this.graph ?? createAudioGraph(video)
    if (!graph) {
      return
    }
    this.graph = graph
    if (!hasUserActivation()) {
      // 还没有用户手势时 AudioContext 可能会一直挂起, 此时保持直通, 免得没有声音
      this.waitForGesture()
      setChained(graph, false)
      return
    }
    const { context } = graph
    if (context.state !== 'running') {
      // 先恢复音频上下文再接上增益链路, 恢复失败就保持直通
      setChained(graph, false)
      context
        .resume()
        .then(() => {
          if (this.graph === graph) {
            this.apply()
          }
        })
        .catch(() => undefined)
      return
    }
    graph.gain.gain.setTargetAtTime(this.percent / minGainPercent, context.currentTime, 0.02)
    setChained(graph, true)
  }

  /** 等到用户产生手势后再尝试建立音频链路 */
  private waitForGesture() {
    if (this.cancelGestureWait) {
      return
    }
    const retry = () => {
      this.cancelGestureWait?.()
      this.cancelGestureWait = null
      this.apply()
    }
    const config: AddEventListenerOptions = { capture: true, passive: true }
    window.addEventListener('pointerdown', retry, config)
    window.addEventListener('keydown', retry, config)
    const { video } = this
    video?.addEventListener('play', retry, { passive: true })
    this.cancelGestureWait = () => {
      window.removeEventListener('pointerdown', retry, config)
      window.removeEventListener('keydown', retry, config)
      video?.removeEventListener('play', retry)
    }
  }
}

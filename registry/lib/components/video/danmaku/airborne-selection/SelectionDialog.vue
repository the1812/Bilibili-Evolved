<template>
  <div
    class="airborne-selection bili-danmaku-x-vote bili-danmaku-x-show bili-danmaku-x-selected bili-danmaku-x-show-num bili-danmaku-x-end"
    style="--left: 50%; --top: 67.4468085106383%; display: none; width: unset; max-width: 300px"
    :style="{ display: airborneList.length == 0 ? 'none' : 'block', '--scale': scaleForFullscreen }"
  >
    <div class="bili-danmaku-x-vote-question" style="display: flex">
      疑似有 {{ airborneList.length }} 条空降位置
      <span
        class="airborne-ignore-btn"
        style="font-weight: bold; cursor: pointer; margin-left: auto"
        @click.stop="togglePause"
        >忽略此视频</span
      >
    </div>
    <div>
      <!-- 默认项：取消空降，不参与 v-for 渲染 -->
      <div
        class="bili-danmaku-x-vote-an"
        :class="{ 'bili-danmaku-x-select': selectedSecond === cancelSecond }"
        @click="onCancelAirborne"
      >
        <div class="bili-danmaku-x-vote-lottie"></div>
        <div class="bili-danmaku-x-vote-an-bg" style="overflow: hidden">
          <div class="bili-danmaku-x-vote-an-bg-buffer" style="width: 100%"></div>
        </div>
        <div class="bili-danmaku-x-vote-an-text">
          <div class="bili-danmaku-x-vote-an-text-index"></div>
          <div class="bili-danmaku-x-vote-an-text-doc" style="width: unset; padding-right: 40px">
            取消空降（点击或Tab键向下选择）
          </div>
        </div>
      </div>
      <div
        v-for="airborne in airborneList"
        :key="airborne.second"
        class="bili-danmaku-x-vote-an"
        :class="{ 'bili-danmaku-x-select': selectedSecond == airborne.second }"
        @click="onSelectAirborne(airborne)"
      >
        <div class="bili-danmaku-x-vote-lottie"></div>
        <div class="bili-danmaku-x-vote-an-bg" style="overflow: hidden">
          <div
            class="bili-danmaku-x-vote-an-bg-buffer"
            :style="{ width: airborne.percentage + '%' }"
          ></div>
        </div>
        <div class="bili-danmaku-x-vote-an-text">
          <div class="bili-danmaku-x-vote-an-text-index"></div>
          <div class="bili-danmaku-x-vote-an-text-doc" style="width: unset; padding-right: 40px">
            {{ airborne.formatTime }} - {{ airborne.content }}
          </div>
        </div>
        <div class="bili-danmaku-x-vote-an-num">
          <span class="bili-danmaku-x-vote-an-num-2"
            >{{ airborne.offset > 0 ? '+' + airborne.offset : airborne.offset }}s</span
          >
        </div>
      </div>
    </div>
    <!-- 关闭按钮 -->
    <div
      class="bili-danmaku-x-circle"
      style="--width: 16px; --height: 16px; --color: #ffffffb3"
      @click="closeDialog"
    >
      <div class="bili-danmaku-x-circle-left">
        <div
          class="bili-danmaku-x-circle-left-bar"
          :style="{
            '--leftDeg':
              showTimePercentage >= 0.5
                ? -45 - (225 - 45) * (1 - showTimePercentage) * 2 + 'deg'
                : '-225deg',
          }"
        ></div>
      </div>
      <div class="bili-danmaku-x-circle-right">
        <div
          class="bili-danmaku-x-circle-right-bar"
          :style="{
            '--rightDeg':
              showTimePercentage <= 0.5
                ? -45 - (225 - 45) * (0.5 - showTimePercentage) * 2 + 'deg'
                : '-45deg',
          }"
        ></div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" data-pointer="none" viewBox="0 0 16 16">
        <path
          fill="#000"
          fill-opacity=".3"
          fill-rule="evenodd"
          d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8"
          clip-rule="evenodd"
        ></path>
        <path
          fill="#fff"
          fill-rule="evenodd"
          d="M5.168 5.977a.572.572 0 0 1 .809-.81L8 7.192l2.023-2.023a.572.572 0 0 1 .81.809L8.808 8l2.023 2.023a.572.572 0 1 1-.809.81L8 8.808l-2.023 2.023a.572.572 0 1 1-.81-.809L7.192 8z"
          clip-rule="evenodd"
          opacity=".714"
        ></path>
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { playerAgent } from '@/components/video/player-agent'
import { DanmakuRecord, forEachVideoDanmaku } from '@/components/video/video-danmaku'
import { videoChange } from '@/core/observer'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { select } from '@/core/spin-query'
import { formatDuration } from '@/core/utils/formatters'
import { useScopedConsole } from '@/core/utils/log'
import { parseAirborneTime } from './airborne-time'
import { fetchAirborneDanmaku, AirborneDanmakuItem, getPlayerCid } from './airborne-danmaku'

const console = useScopedConsole('快捷空降')

const componentName = 'airborneSelection'

// 与 @/components/video/player-adaptor/events 中 PlayerMode 枚举保持一致
const PlayerMode = {
  Fullscreen: 'full',
  WebFullscreen: 'web',
} as const

///---

// 空降弹窗展示时长（秒），倒计时基于视频实际播放时间计算
const displayDuration = 5

// 当前播放器的 video 元素
let videoElement: HTMLVideoElement | null = null

interface Airborne {
  content: string
  second: number
  formatTime: string
  percentage: number
  offset: number
}

const settings = getComponentSettings(componentName)

const airborneList = ref<Airborne[]>([]) // 有效空降时间列表（仅真实空降项）
const videoDuration = ref(0) // 当前focus 视频的时长
const shownAtTime = ref(0) // 弹窗展示时的视频时间点（秒）
const cancelSecond = ref(0) // 默认"取消空降"项对应的时间点
const isSwitched = ref(false) // 焦点是否已移出默认项
const selectedSecond = ref(0)
const showTimePercentage = ref(1)
const scaleForFullscreen = ref(1)
const isPaused = ref(false) // 当前视频是否暂停空降分析
const strategy = ref<'full' | 'realtime'>(settings.options.analysisStrategy as 'full' | 'realtime') // 弹幕分析策略
const analyzedCid = ref<number | null>(null) // 已取数/正在取数的视频 cid
const analysisToken = ref(0) // 防止视频快速切换时旧请求写回
const danmakuBySecond = ref<Map<number, AirborneDanmakuItem[]>>(new Map()) // 完整分析候选弹幕按出现秒分桶
const lastProcessedSecond = ref(-1) // 已消费到的秒数, 避免同一秒被重复消费

/** 关闭弹窗 */
const closeDialog = () => {
  airborneList.value = []
  selectedSecond.value = 0
  cancelSecond.value = 0
  isSwitched.value = false
  showTimePercentage.value = 1
}

const resetFullDanmaku = () => {
  danmakuBySecond.value = new Map()
  lastProcessedSecond.value = -1
}

/** 忽略当前视频，切换视频后自动恢复 */
const togglePause = () => {
  isPaused.value = true
  closeDialog()
}

const onSelectAirborne = (airborne: Airborne) => {
  selectedSecond.value = airborne.second

  console.debug(isSwitched.value)

  // 焦点移出默认项，默认项文案改为"取消空降"
  isSwitched.value = true

  // 先以跳转目标时间点重新锚定展示窗口，再 seek，避免跳转期间被旧 currentTime 判定超时
  shownAtTime.value = airborne.second
  showTimePercentage.value = 1
  playerAgent.nativeApi.seek(airborne.second, false)
}

/** 选中默认项：取消空降，回到弹窗展示时的时间点 */
const onCancelAirborne = () => {
  selectedSecond.value = cancelSecond.value
  isSwitched.value = false

  // 向后跳转，同样先锚定再 seek，防止回跳完成前的旧 timeupdate 瞬间隐藏组件
  shownAtTime.value = cancelSecond.value
  showTimePercentage.value = 1
  playerAgent.nativeApi.seek(cancelSecond.value, false)
}

/** 切换到下一个空降项（取消项 → 空降项 → … → 取消项循环），弹窗未激活时返回 false */
const selectNextAirborne = (): boolean => {
  if (airborneList.value.length === 0) {
    return false
  }
  const index = airborneList.value.findIndex(ele => ele.second === selectedSecond.value)
  // 当前选中取消项：跳到第一个空降项
  if (index === -1) {
    onSelectAirborne(airborneList.value[0])
    return true
  }
  // 最后一个空降项的下一项是取消项
  if (index === airborneList.value.length - 1) {
    onCancelAirborne()
    return true
  }
  onSelectAirborne(airborneList.value[index + 1])
  return true
}

/**
 * 创建空降时间item
 * @param second 空降时间
 * @param content 空降内容
 */
const createAirborne = (second: number, content: string) => {
  // 卫 如果不在剩余播放时间区间之内
  const playbackTime = playerAgent.nativeApi.getCurrentTime()
  const currentTime = Math.floor(playbackTime)
  if (second <= currentTime || second >= videoDuration.value) {
    return
  }

  // 卫 如果在列表中已经有重复的
  if (airborneList.value.findIndex(ele => ele.second === second) > -1) {
    return
  }

  // 列表为空时初始化默认取消项的时间点（默认项在模板中硬编码）
  if (airborneList.value.length === 0) {
    cancelSecond.value = currentTime
    selectedSecond.value = currentTime
    isSwitched.value = false
  }

  airborneList.value.push({
    content,
    second,
    formatTime: formatDuration(second),
    percentage: Math.ceil((second / videoDuration.value) * 100),
    offset: second - currentTime,
  })

  // 以候选实际加入时的播放时间作为展示锚点，两种策略保持一致
  shownAtTime.value = playbackTime
  showTimePercentage.value = 1
}
/** 将解析出的候选时间加入列表，两种策略共用 */
const addAirborneCandidates = (content: string, seconds: number[]) => {
  if (isPaused.value) {
    return
  }
  for (const second of seconds) {
    createAirborne(second, content)
  }
}

const onDanmakuAdded = (danmaku: DanmakuRecord) => {
  // 完整分析策略不处理实时新增的弹幕
  if (strategy.value !== 'realtime') {
    return
  }
  addAirborneCandidates(danmaku.text, parseAirborneTime(danmaku.text))
}

/** 消费指定秒桶内的全部弹幕（不做去重判断，供初始冲刷与 timeupdate 共用） */
const consumeSecondBucket = (sec: number) => {
  const bucket = danmakuBySecond.value.get(sec)
  if (!bucket || bucket.length === 0) {
    return
  }
  for (const item of bucket) {
    addAirborneCandidates(item.text, item.airborneSeconds)
  }
}

/** timeupdate 驱动：仅当播放秒数变化时消费对应秒桶，空桶不更新 shownAtTime */
const consumeCurrentSecond = (currentTime: number) => {
  const sec = Math.floor(currentTime)
  if (sec === lastProcessedSecond.value) {
    return
  }
  lastProcessedSecond.value = sec
  consumeSecondBucket(sec)
}

const onVideoTimeUpdate = () => {
  if (!videoElement) {
    return
  }
  const { currentTime } = videoElement
  // 完整分析策略下，按当前播放秒消费对应秒桶
  if (strategy.value === 'full') {
    consumeCurrentSecond(currentTime)
  }
  if (airborneList.value.length === 0) {
    return
  }
  // seek 未完成时 currentTime 可能仍是跳转前的旧位置，丢弃这期间的事件，防止误判
  if (videoElement.seeking) {
    return
  }
  // 回放到弹窗展示时间点之前：剩余时间 = shownAtTime + displayDuration - currentTime
  // 会大于 displayDuration，说明用户 seek 回了更早位置，不应再展示该弹窗，直接关闭。
  // 组件自身触发的 seek（选空降/取消）会先把 shownAtTime 设为目标再 seek，
  // seek 完成后 currentTime ≈ shownAtTime，不会落入该分支。
  if (currentTime < shownAtTime.value) {
    closeDialog()
    return
  }
  // 剩余展示时间 = 展示时间点 + 展示时长 - 当前播放时间
  const remaining = shownAtTime.value + displayDuration - currentTime
  showTimePercentage.value = lodash.clamp(remaining / displayDuration, 0, 1)
  if (remaining <= 0) {
    closeDialog()
  }
}

const onPlayerModeChange = (event: Event) => {
  const { mode } = (event as CustomEvent<{ mode: string }>).detail
  scaleForFullscreen.value =
    mode === PlayerMode.Fullscreen || mode === PlayerMode.WebFullscreen ? 1.5 : 1
}

/** 完整弹幕获取失败时回退到实时分析 */
const fallbackToRealtime = () => {
  settings.options.analysisStrategy = 'realtime'
  strategy.value = 'realtime'
  analyzedCid.value = null
  analysisToken.value += 1
  resetFullDanmaku()
  closeDialog()
}

/** 完整分析：预取包含空降时间的弹幕并按出现时间入队，由 timeupdate 逐条消费 */
const runFullAnalysis = async () => {
  const cid = await select(getPlayerCid)
  if (!cid || cid === analyzedCid.value) {
    return
  }
  // 先占位，避免初始 videoChange 与 mounted 重复取数
  analyzedCid.value = cid

  const duration = await select(() => {
    const value = playerAgent.nativeApi?.getDuration?.()
    return value > 0 ? value : null
  })
  if (!duration) {
    // 时长未就绪，允许后续重试
    analyzedCid.value = null
    return
  }
  videoDuration.value = duration

  analysisToken.value += 1
  const token = analysisToken.value
  let items: AirborneDanmakuItem[]
  try {
    items = await fetchAirborneDanmaku(cid)
  } catch (error) {
    if (token !== analysisToken.value) {
      return
    }
    console.warn('完整弹幕获取失败，已自动切换为实时分析策略', error)
    fallbackToRealtime()
    return
  }
  if (token !== analysisToken.value) {
    // 期间已再次切换视频
    return
  }

  const currentTime = playerAgent.nativeApi?.getCurrentTime?.() ?? 0
  const map = new Map<number, AirborneDanmakuItem[]>()
  for (const item of items) {
    const sec = Math.floor(item.time)
    const bucket = map.get(sec)
    if (bucket) {
      bucket.push(item)
    } else {
      map.set(sec, [item])
    }
  }
  danmakuBySecond.value = map
  // 取数期间刚出现的弹幕（当前秒与上一秒）立即冲刷，之后交给 timeupdate 逐秒推进
  const currentSec = Math.floor(currentTime)
  lastProcessedSecond.value = currentSec
  consumeSecondBucket(currentSec - 1)
  consumeSecondBucket(currentSec)
}

/** 策略变更时切换数据来源，弹窗行为保持不变 */
const onStrategyChange = (value: string) => {
  const next = value === 'realtime' ? 'realtime' : 'full'
  if (next === strategy.value) {
    return
  }
  strategy.value = next
  analyzedCid.value = null
  analysisToken.value += 1
  resetFullDanmaku()
  closeDialog()
  if (next === 'full') {
    runFullAnalysis()
  }
}

const strategyListenerPath = `${componentName}.analysisStrategy`
const strategyListener = (newValue: string) => {
  onStrategyChange(newValue)
}

onMounted(async () => {
  // 视频成功加载后触发回调
  playerAgent.addEventListener('play', () => {
    videoDuration.value = playerAgent.nativeApi.getDuration()
  })

  // 监听弹幕添加事件
  forEachVideoDanmaku({ added: onDanmakuAdded })

  // 监听视频播放进度，驱动弹窗倒计时
  videoElement = (await playerAgent.query.video.element()) as HTMLVideoElement
  videoElement?.addEventListener('timeupdate', onVideoTimeUpdate)

  // 监听播放器模式，全屏时放大弹窗
  window.addEventListener('playerModeChange', onPlayerModeChange)

  // 监听分析策略变更
  addComponentListener(strategyListenerPath, strategyListener)

  // 完整分析策略下预取全部弹幕
  if (strategy.value === 'full') {
    runFullAnalysis()
  }

  // 视频切换后自动恢复空降分析，并按当前策略重新分析
  videoChange(({ cid }) => {
    isPaused.value = false
    // videoChange 回调中的 cid 是字符串，统一转成数字再比较
    if (Number(cid) === analyzedCid.value) {
      return
    }
    analyzedCid.value = null
    analysisToken.value += 1
    resetFullDanmaku()
    closeDialog()
    if (strategy.value === 'full') {
      runFullAnalysis()
    }
  })
})

onBeforeUnmount(() => {
  videoElement?.removeEventListener('timeupdate', onVideoTimeUpdate)
  window.removeEventListener('playerModeChange', onPlayerModeChange)
  removeComponentListener(strategyListenerPath, strategyListener)
})

defineExpose({ selectNextAirborne })
</script>

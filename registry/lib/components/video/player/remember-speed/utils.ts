import { playerAgent } from '@/components/video/player-agent'
import { ComponentSettings, getComponentSettings } from '@/core/settings'
import { ascendingSort } from '@/core/utils/sort'

export const minValue = 0.0625
export const maxValue = 16
export const stepValue = 0.5
export const errorMessageDuration = 2000
export const nativeSupportedRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

export const extendedAgent = playerAgent.provideCustomQuery({
  video: {
    speedMenuList: '.bilibili-player-video-btn-speed-menu',
    speedMenuItem: '.bilibili-player-video-btn-speed-menu-list',
    speedNameBtn: '.bilibili-player-video-btn-speed-name',
    speedContainer: '.bilibili-player-video-btn-speed',
    active: '.bilibili-player-active',
    show: '.bilibili-player-speed-show',
  },
  bangumi: {
    speedMenuList: '.squirtle-speed-select-list',
    speedMenuItem: '.squirtle-select-item',
    speedNameBtn: '.squirtle-speed-select-result',
    speedContainer: '.squirtle-speed-wrap',
    active: '.active',
    // bangumi 那边没有这种 class, 随便填一个就行了
    show: '.bilibili-player-speed-show',
  },
})

export const trimLeadingDot = (selector: string) => selector.replace(/^\./, '')
export const calcOrder = (value: number) => ((maxValue - value) * 10000).toString()
export const getAid = (aid = unsafeWindow.aid) => {
  if (!aid) {
    throw new Error('aid is unknown')
  }
  return aid
}

export interface Options {
  speed: string
  extend: boolean
  extendList: number[]
  individualRemember: boolean
  individualRememberList: Record<string, string[]>
}

export const { options, enabled } = getComponentSettings('rememberVideoSpeed') as ComponentSettings<Options>

export const getUniqueAscendingSortList = (values: number[]) => Array.from(new Set(values)).sort(ascendingSort())

export const getExtendedSupportedRates = () => getUniqueAscendingSortList(options.extendList)

export const getSupportedRates = () => (options.extend ? [
  ...nativeSupportedRates,
  ...getExtendedSupportedRates(),
].sort(ascendingSort()) : nativeSupportedRates)

export const formatSpeedText = (speed: number) => {
  if (speed === 1) {
    return '倍速'
  }
  return Math.trunc(speed) === speed ? `${speed}.0x` : `${speed}x`
}

type Listener<E extends Event = Event> = [string, (ev: E) => any]
const listeners: Map<HTMLElement, Listener> = new Map()

export const addListener = (element: HTMLElement, listener: Listener) => {
  element.addEventListener(...listener)
  listeners.set(element, listener)
}

export const removeListeners = () => listeners.forEach((listener, element) => element.removeEventListener(...listener))

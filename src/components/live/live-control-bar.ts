import { mountVueComponent } from '@/core/utils'
import { liveUrls, matchCurrentPage } from '@/core/utils/urls'
import LiveControlBar from './LiveControlBar.vue'

export interface LiveControlBarItem {
  name: string
  displayName: string
  icon: string
  order: number
  action: (event: MouseEvent) => void | Promise<void>
}
export interface LiveControlBarCallbacks {
  init?: (container: HTMLElement) => void
  callback?: (controlBar: HTMLElement) => void | Promise<void>
}
export interface LiveControlBarApi {
  waitForControlBar: (config: LiveControlBarCallbacks) => () => void
  setControlBarLocked: (locked: boolean) => void
  withControlBar: (callback: NonNullable<LiveControlBarCallbacks['callback']>) => Promise<void>
  addControlBarButton: (button: LiveControlBarItem) => void
  removeControlBarButton: (name: string) => void
}

const getControlBar = lodash.once(() =>
  matchCurrentPage(liveUrls) ? mountVueComponent<LiveControlBarApi>(LiveControlBar) : null,
)

export const waitForControlBar: LiveControlBarApi['waitForControlBar'] = config =>
  getControlBar()?.waitForControlBar(config) ?? lodash.noop

export const setControlBarLocked: LiveControlBarApi['setControlBarLocked'] = locked =>
  getControlBar()?.setControlBarLocked(locked)

export const withControlBar: LiveControlBarApi['withControlBar'] = async callback =>
  getControlBar()?.withControlBar(callback)

export const addControlBarButton: LiveControlBarApi['addControlBarButton'] = button =>
  getControlBar()?.addControlBarButton(button)

export const removeControlBarButton: LiveControlBarApi['removeControlBarButton'] = name =>
  getControlBar()?.removeControlBarButton(name)

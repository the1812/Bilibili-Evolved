import { componentsMap } from '@/components/component'
import { getComponentSettings } from '@/core/settings'
import type { ComponentOptions } from './types'

const componentName = 'rememberVideoCollection'

export type RememberVideoCollectionRbvpMode = 'ON' | 'OFF'

type PendingApplyTask = {
  videoKey: string
  apply: () => Promise<void> | void
}

type ModeState = {
  videoKey: string
  mode: RememberVideoCollectionRbvpMode
}

let currentMode: ModeState | null = null
let pendingApplyTask: PendingApplyTask | null = null

export const getRememberVideoCollectionRbvpVideoKey = (
  aid: string | number = unsafeWindow.aid,
  cid: string | number = unsafeWindow.cid,
) => `${aid ?? ''}:${cid ?? ''}`

const getRememberVideoCollectionOptions = () =>
  getComponentSettings<ComponentOptions>(componentName).options

export const isRememberVideoCollectionUsingRbvp = () => {
  const settings = getComponentSettings<ComponentOptions>(componentName)
  return (
    settings.enabled &&
    settings.options.useRbvp &&
    Boolean(componentsMap.rbvp) &&
    getComponentSettings('rbvp').enabled
  )
}

export const setRememberVideoCollectionRbvpMode = (
  mode: RememberVideoCollectionRbvpMode,
  videoKey = getRememberVideoCollectionRbvpVideoKey(),
) => {
  currentMode = { videoKey, mode }
}

export const clearRememberVideoCollectionRbvpMode = (
  videoKey = getRememberVideoCollectionRbvpVideoKey(),
) => {
  if (!currentMode || currentMode.videoKey === videoKey) {
    currentMode = null
  }
}

export const getRememberVideoCollectionRbvpMode = (
  videoKey = getRememberVideoCollectionRbvpVideoKey(),
) => (currentMode?.videoKey === videoKey ? currentMode.mode : null)

export const shouldRememberVideoCollectionApply = (
  videoKey = getRememberVideoCollectionRbvpVideoKey(),
) => !isRememberVideoCollectionUsingRbvp() || getRememberVideoCollectionRbvpMode(videoKey) === 'ON'

export const setRememberVideoCollectionPendingApply = (
  apply: () => Promise<void> | void,
  videoKey = getRememberVideoCollectionRbvpVideoKey(),
) => {
  pendingApplyTask = {
    videoKey,
    apply,
  }
}

export const clearRememberVideoCollectionPendingApply = (
  videoKey = getRememberVideoCollectionRbvpVideoKey(),
) => {
  if (!pendingApplyTask || pendingApplyTask.videoKey === videoKey) {
    pendingApplyTask = null
  }
}

export const runRememberVideoCollectionPendingApply = async (
  videoKey = getRememberVideoCollectionRbvpVideoKey(),
) => {
  if (!pendingApplyTask || pendingApplyTask.videoKey !== videoKey) {
    return false
  }
  await pendingApplyTask.apply()
  return true
}

export const getRememberVideoCollectionRbvpTakeoverState = () =>
  getRememberVideoCollectionOptions().useRbvp

export const setRememberVideoCollectionRbvpTakeoverState = (value: boolean) => {
  getRememberVideoCollectionOptions().useRbvp = value
}

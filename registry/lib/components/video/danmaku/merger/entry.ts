import type { ComponentEntryContext } from '@/components/types'
import { mountVueComponent } from '@/core/utils'
import { addVideoActionButton } from '@/components/video/video-actions'
import { videoChange } from '@/core/observer'
import { initStorageFromContext } from './storage'
import { MERGER_BUTTON_EVENTS, type MergerUiHost } from './ui/contracts'

const wireMergerButton = (buttonVm: Vue, getHost: () => MergerUiHost | null) => {
  buttonVm.$off(MERGER_BUTTON_EVENTS.OPEN)
  buttonVm.$on(MERGER_BUTTON_EVENTS.OPEN, () => {
    getHost()?.openSearchModal()
  })
}

const wireMergerButtonWhenReady = (
  buttonVm: Vue,
  getHost: () => MergerUiHost | null,
  attempt = 0,
) => {
  if (getHost()) {
    wireMergerButton(buttonVm, getHost)
    return
  }
  if (attempt < 60) {
    window.setTimeout(() => wireMergerButtonWhenReady(buttonVm, getHost, attempt + 1), 50)
  }
}

export const createMergerContext = async (context: ComponentEntryContext): Promise<() => void> => {
  initStorageFromContext(context)

  const MergerButton = await import('./ui/MergerButton.vue')
  const buttonVm = mountVueComponent(MergerButton)
  await addVideoActionButton(() => buttonVm.$el)

  const runtime = await import('./runtime')
  const cleanup = runtime.initDanmakuMerger()
  wireMergerButtonWhenReady(buttonVm, runtime.getMergerUiHost)

  videoChange(ids => {
    runtime.handleMergerVideoChange(ids)
  })

  return () => {
    buttonVm.$destroy()
    cleanup()
  }
}

import type { ComponentEntryContext } from '@/components/types'
import { mountVueComponent } from '@/core/utils'
import { addVideoActionButton } from '@/components/video/video-actions'
import { videoChange } from '@/core/observer'
import { initStorage } from './storage'
import { MERGER_BUTTON_EVENTS, type MergerUiHost } from './ui/contracts'

type BeMonkeyApis = {
  GM_getValue?: <T>(name: string, defaultValue?: T) => T
  GM_setValue?: (name: string, value: unknown) => void
  GM_deleteValue?: (name: string) => void
}

const getMonkeyApis = (): BeMonkeyApis | undefined => {
  const host = unsafeWindow as typeof unsafeWindow & {
    bilibiliEvolved?: { monkeyApis?: BeMonkeyApis }
  }
  return host.bilibiliEvolved?.monkeyApis
}

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

export const createMergerContext = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: ComponentEntryContext,
): Promise<() => void> => {
  const monkey = getMonkeyApis()
  if (monkey?.GM_getValue && monkey?.GM_setValue && monkey?.GM_deleteValue) {
    initStorage({
      GM_getValue: monkey.GM_getValue,
      GM_setValue: monkey.GM_setValue,
      GM_deleteValue: monkey.GM_deleteValue,
    })
  }

  const MergerButton = await import('./ui/MergerButton.vue')
  const buttonVm = mountVueComponent(MergerButton)
  await addVideoActionButton(() => buttonVm.$el)

  const runtime = await import('./runtime')
  const cleanup = runtime.initDanmakuMerger()
  wireMergerButtonWhenReady(buttonVm, runtime.getMergerUiHost)

  videoChange(() => {
    runtime.handleMergerVideoChange()
  })

  return () => {
    buttonVm.$destroy()
    cleanup()
  }
}

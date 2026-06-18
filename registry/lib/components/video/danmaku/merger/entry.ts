import type { ComponentEntryContext } from '@/components/types'
import { initStorage } from './storage'

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

export const createMergerContext = async (
  _context: ComponentEntryContext,
): Promise<() => void> => {
  const monkey = getMonkeyApis()
  if (
    monkey?.GM_getValue &&
    monkey?.GM_setValue &&
    monkey?.GM_deleteValue
  ) {
    initStorage({
      GM_getValue: monkey.GM_getValue,
      GM_setValue: monkey.GM_setValue,
      GM_deleteValue: monkey.GM_deleteValue,
    })
  }

  const { initDanmakuMerger } = await import('./merger-runtime')
  return initDanmakuMerger()
}
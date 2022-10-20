import { addComponentListener } from '@/core/settings'
import { select } from '@/core/spin-query'

export const setupSkinSimplify = async () => {
  addComponentListener(
    'simplifyLiveroom.switch-skin',
    async (disable: boolean) => {
      const skinCss = (await select('#skin-css')) as HTMLStyleElement
      if (!skinCss) {
        return
      }
      skinCss.media = disable ? 'none' : 'all'
    },
    true,
  )
}

import { addComponentListener } from '@/core/settings'
import { select } from '@/core/spin-query'

export const setupSkinSimplify = async () => {
  const skinCss = await select('#skin-css') as HTMLStyleElement
  if (!skinCss) {
    return
  }
  console.log(skinCss)
  addComponentListener('simplifyLiveroom.switch-skin', (disable: boolean) => {
    skinCss.media = disable ? 'none' : 'all'
  }, true)
}

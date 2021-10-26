import { getComponentSettings, addComponentListener } from '@/core/settings'
import { select } from '@/core/spin-query'
import { attributes } from '@/core/observer'

class SkinManager {
  skinDisabled = getComponentSettings('simplifyLiveroom').options.skin
  constructor(
    public skinSelectors: string[],
    public skinClass: string,
  ) {
    skinSelectors.forEach(selector => {
      select(selector).then(skin => {
        if (!skin) {
          return
        }
        attributes(selector, records => {
          records.forEach(record => {
            if (record.attributeName === 'class') {
              if (this.skinDisabled && skin.classList.contains(skinClass)) {
                skin.classList.remove(skinClass)
              } else if (!this.skinDisabled && !skin.classList.contains(skinClass)) {
                skin.classList.add(skinClass)
              }
            }
          })
        })
      })
    })
  }
  setSkin(enable: boolean) {
    this.skinDisabled = !enable
    this.skinSelectors.forEach(selector => {
      select(selector).then(
        skin => skin.classList[enable ? 'add' : 'remove'](this.skinClass),
      )
    })
  }
}
const skins = [
  new SkinManager([
    '#head-info-vm',
    '#gift-control-vm',
    '#rank-list-vm',
    '#rank-list-ctnr-box',
    '.gift-panel.base-panel',
    '.gift-panel.extend-panel',
    '.seeds-wrap>div:first-child',
    '.gift-section>div:last-child',
    '.z-gift-package>div>div',
    '.right-action',
    '.control-panel-ctnr',
  ], 'live-skin-coloration-area'),
  new SkinManager([
    '.rank-list-ctnr .tabs',
  ], 'isHundred'),
  new SkinManager([
    '.rank-list-ctnr .tab-content > div',
  ], 'hundred'),
]
export const setupSkinSimplify = () => {
  addComponentListener('simplifyLiveroom.skin', (value: boolean) => {
    skins.forEach(it => it.setSkin(value))
  }, true)
}

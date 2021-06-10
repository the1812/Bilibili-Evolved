import { attributes } from '@/core/observer'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { sq } from '@/core/spin-query'

/**
 * 检查是否应用透明填充(有横幅时)
 */
export const checkTransparentFill = async (vm: {
  toggleStyle: (value: boolean, style: string) => void
}) => {
  sq(
    () => dq('#banner_link,.international-header .bili-banner'),
    banner => (banner === null ? false : Boolean((banner as HTMLElement).style.backgroundImage)),
  ).then((banner: HTMLElement) => {
    if (!banner) {
      return
    }
    attributes(banner, () => {
      addComponentListener('customNavbar.transparent', value => {
        if (!getComponentSettings('hideBanner').enabled) {
          vm.toggleStyle(value, 'transparent')
        }
      }, true)
      addComponentListener('hideBanner', value => {
        if (getComponentSettings('customNavbar').options.transparent) {
          vm.toggleStyle(!value, 'transparent')
        }
      })
    })
  })
}

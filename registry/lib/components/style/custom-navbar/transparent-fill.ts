import { addComponentListener, getComponentSettings } from '@/core/settings'
import { sq } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { mainSiteUrls, matchCurrentPage } from '@/core/utils/urls'

const setupTransparentFill = (vm: { toggleStyle: (value: boolean, style: string) => void }) => {
  addComponentListener(
    'customNavbar.transparent',
    value => {
      if (!getComponentSettings('hideBanner').enabled) {
        vm.toggleStyle(value, 'transparent')
      }
    },
    true,
  )
  addComponentListener('hideBanner', value => {
    if (getComponentSettings('customNavbar').options.transparent) {
      vm.toggleStyle(!value, 'transparent')
    }
  })
}

const transparentFillUrls = ['//music.bilibili.com/', '//space.bilibili.com/']

/**
 * 检查是否应用透明填充(有横幅时)
 */
export const checkTransparentFill = async (vm: {
  toggleStyle: (value: boolean, style: string) => void
}) => {
  if (transparentFillUrls.some(url => matchUrlPattern(url))) {
    setupTransparentFill(vm)
    return
  }
  if (!matchCurrentPage(mainSiteUrls)) {
    return
  }
  sq(
    () =>
      dqa(
        '.animated-banner video, .banner-img img, #banner_link, .international-header .bili-banner, .bili-header__banner',
      ),
    banners => {
      if (banners.length === 0) {
        return false
      }
      const hasBannerImage = (banner: HTMLElement) => {
        if (banner.style.backgroundImage) {
          return true
        }
        if ((banner as HTMLVideoElement | HTMLImageElement).src) {
          return true
        }
        if (banner.querySelector('.animated-banner')) {
          return true
        }
        return false
      }
      if (banners.some(hasBannerImage)) {
        return true
      }
      return false
    },
  ).then(banner => {
    if (banner.length === 0) {
      return
    }
    setupTransparentFill(vm)
  })
}

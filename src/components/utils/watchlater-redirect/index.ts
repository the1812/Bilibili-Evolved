import { ComponentMetadata, componentsTags } from '@/components/component'
import { ComponentSettings } from '@/core/settings'

const entry = async (settings: ComponentSettings) => {
  const { select, selectAll, sq } = await import('@/core/spin-query')
  const { childListSubtree } = await import('@/core/observer')
  const getRedirectLink = (text: string) => {
    const match = text.match(/(BV[\w]+)\/p([\d]+)/i) || text.match(/(av[\d]+)\/p([\d]+)/i)
    if (match) {
      return `https://www.bilibili.com/video/${match[1]}/?p=${match[2]}`
    }
    return 'javascript:;'
  }
  const redirectLinks = (items: HTMLElement[]) => {
    const watchlaterList = items
      .map(it => {
        const href = it.getAttribute('href')
        if (!href) {
          return 'javascript:;'
        }
        if (href.match(/.*watchlater.*|javascript:;/g)) {
          return getRedirectLink(href)
        }
        if (href.match(/video\/av|video\/BV/i)) {
          return href
        }
        return href
      })
    items.forEach((it, index) => {
      it.setAttribute('href', watchlaterList[index])
      it.setAttribute('target', '_blank')
    })
  }
  const redirectSelectors = (...selectors: string[]) => {
    for (const selector of selectors) {
      selectAll(selector).then((it: HTMLElement[]) => redirectLinks(it))
    }
  }
  if (settings.options.page
    && document.URL.startsWith('https://www.bilibili.com/watchlater/#/list')
  ) {
    // 稍后再看列表
    select('.app-wrap').then(app => {
      if (app === null) {
        return
      }
      childListSubtree(app, () => {
        sq(
          () => document.URL.match(/(av[\d]+)\/p([\d]+)/i)
            || document.URL.match(/(BV[\w]+)\/p([\d]+)/i),
          it => it !== null && document.URL.indexOf('watchlater') !== -1,
        ).then(() => {
          const url = getRedirectLink(document.URL)
          if (url !== null) {
            window.location.assign(url)
          }
        })
        // select(".app-wrap .s-btn[href='#/']").then(it => it?.remove())
        redirectSelectors('.av-pic', '.av-about>a')
      })
    })
  }
  // 原版顶栏现在也是转向单独播放页面了, 无需再做处理
  // if (settings.options.navbar) {
  //   // 旧原版顶栏
  //   // select('li.nav-item[report-id*=watchlater]').then(() => {
  //   //   Observer.childListSubtree('li.nav-item[report-id*=watchlater]', () => {
  //   //     redirectSelectors('.av-item>a', '.av-about>a', 'div.watch-later-m>ul>div>li>a')
  //   //     select('.read-more.mr').then(it => it?.remove())
  //   //     select('.read-more-grp>.read-more').then((it: HTMLElement) => {
  //   //       it.style.width = 'auto'
  //   //       it.style.float = 'none'
  //   //     })
  //   //   })
  //   // })
  //   // 原版顶栏
  //   const bodyObserver = Observer.childList(document.body, () => {
  //     const favoritePopup = document.querySelector('.van-popper-favorite')
  //     if (!favoritePopup) {
  //       return
  //     }
  //     bodyObserver.stop()
  //     const observers = Observer.childListSubtree(favoritePopup, () => {
  //       const playAll = favoritePopup.querySelector('.play-all')
  //       if (playAll) {
  //         const url = '//www.bilibili.com/watchlater/#/list'
  //         Observer.attributes(playAll, () => {
  //           if (playAll.firstElementChild === null || playAll.lastChild === null) {
  //             return
  //           }
  //           if (playAll.getAttribute('href') === '//www.bilibili.com/watchlater/') {
  //             playAll.setAttribute('href', url)
  //             // playAll.firstElementChild.classList.remove('bili-icon_dingdao_bofang')
  //             // playAll.firstElementChild.classList.add('bili-icon_xinxi_yuedushu')
  //             playAll.lastChild.nodeValue = '查看全部'
  //           } else if (playAll.getAttribute('href') !== url) {
  //             playAll.firstElementChild.classList.add('bili-icon_dingdao_bofang')
  //             playAll.firstElementChild.classList.remove('bili-icon_xinxi_yuedushu')
  //             playAll.lastChild.nodeValue = '播放全部'
  //           }
  //         })
  //         observers.stop()
  //       }
  //     })
  //   })
  // }
}
export const component: ComponentMetadata = {
  name: 'watchlaterRedirect',
  displayName: '稍后再看重定向',
  description: {
    'zh-CN': '将稍后再看的链接重定向为普通播放网址, 以使用新版播放页面.',
  },
  entry,
  options: {
    page: {
      displayName: '重定向页面',
      defaultValue: true,
    },
    navbar: {
      displayName: '重定向顶栏',
      defaultValue: true,
    },
  },
  tags: [
    componentsTags.utils,
    componentsTags.video,
  ],
  enabledByDefault: true,
}

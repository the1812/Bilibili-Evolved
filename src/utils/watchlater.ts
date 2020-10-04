const getRedirectLink = (text: string) => {
  const match = text.match(/(BV[\w]+)\/p([\d]+)/i) || text.match(/(av[\d]+)\/p([\d]+)/i)
  if (match) {
    return `https://www.bilibili.com/video/${match[1]}/?p=${match[2]}`
  } else {
    return 'javascript:;'
  }
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
    SpinQuery.select(
      () => document.querySelectorAll(selector),
      it => redirectLinks([...it] as HTMLElement[])
    )
  }
}
if (settings.watchLaterRedirectPage) {
  // 稍后再看列表
  // SpinQuery.select('.watch-later-list').then(() => {
  //   // Observer.childListSubtree('#viewlater-app', () => {
  //   //   SpinQuery.condition(
  //   //     () => document.URL.match(/(av[\d]+)\/p([\d]+)/i) || document.URL.match(/(BV[\w]+)\/p([\d]+)/i),
  //   //     it => it !== null && document.URL.indexOf('watchlater') !== -1,
  //   //     () => {
  //   //       const url = getRedirectLink(document.URL)
  //   //       if (url !== null) {
  //   //         window.location.assign(url)
  //   //       }
  //   //     }
  //   //   )
  //   //   SpinQuery.select("#viewlater-app .s-btn[href='#/']", it => it.remove())
  //   redirectSelectors('.av-pic', '.av-about>a')
  //   // })
  // })
  if (document.URL === 'https://www.bilibili.com/watchlater/#/list') {
    (async () => {
      const { getWatchlaterList } = await import('../video/watchlater-api')
      const list = await getWatchlaterList(true)
      const listBox = await SpinQuery.select('.watch-later-list .list-box')
      if (!listBox) {
        return
      }
      const avItems = listBox.querySelectorAll('.av-item')
      avItems.forEach((item, index) => {
        const watchlaterItem = list[index]
        const aid = watchlaterItem.aid
        const cid = watchlaterItem.cid
        const pages = watchlaterItem.pages
        const page = cid === 0 ? 1 : pages.find(p => p.cid === cid)!.page
        const url = page > 1 ? `https://www.bilibili.com/video/av${aid}?p=${page}` : `https://www.bilibili.com/video/av${aid}`
        const pic = item.querySelector('.av-pic') as HTMLAnchorElement
        pic.target = '_blank'
        pic.href = url
        const title = item.querySelector('.av-about .t') as HTMLAnchorElement
        title.target = '_blank'
        title.href = url
      })
    })()
  }
}
if (settings.watchLaterRedirectNavbar) {
  // 旧原版顶栏
  // SpinQuery.select('li.nav-item[report-id*=watchlater]').then(() => {
  //   Observer.childListSubtree('li.nav-item[report-id*=watchlater]', () => {
  //     redirectSelectors('.av-item>a', '.av-about>a', 'div.watch-later-m>ul>div>li>a')
  //     SpinQuery.select('.read-more.mr', it => it.remove())
  //     SpinQuery.select('.read-more-grp>.read-more', it => {
  //       it.style.width = 'auto'
  //       it.style.float = 'none'
  //     })
  //   })
  // })
  // 原版顶栏
  SpinQuery.select('.van-popper-favorite').then(async favoritePopup => {
    if (!favoritePopup) {
      return
    }
    const observers = Observer.childListSubtree(favoritePopup, () => {
      const playAll = favoritePopup.querySelector('.play-all')
      if (playAll) {
        const url = '//www.bilibili.com/watchlater/#/list'
        Observer.attributes(playAll, () => {
          if (playAll.firstElementChild === null || playAll.lastChild === null) {
            return
          }
          if (playAll.getAttribute('href') === '//www.bilibili.com/watchlater/') {
            playAll.setAttribute('href', url)
            playAll.firstElementChild.classList.remove('bili-icon_dingdao_bofang')
            playAll.firstElementChild.classList.add('bili-icon_xinxi_yuedushu')
            playAll.lastChild.nodeValue = '查看全部'
          } else if (playAll.getAttribute('href') !== url) {
            playAll.firstElementChild.classList.add('bili-icon_dingdao_bofang')
            playAll.firstElementChild.classList.remove('bili-icon_xinxi_yuedushu')
            playAll.lastChild.nodeValue = '播放全部'
          }
        })
        observers.forEach(it => it.stop())
      }
    })
  })
}

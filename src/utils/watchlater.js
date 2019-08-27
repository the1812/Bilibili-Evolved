const getRedirectLink = text => {
  const match = text.match(/(av[\d]+)\/p([\d]+)/)
  if (match) {
    return `https://www.bilibili.com/video/${match[1]}/?p=${match[2]}`
  } else {
    return 'javascript:;'
  }
}
const redirectLinks = items => {
  const watchlaterList = items
    .map(it => {
      const href = it.getAttribute('href')
      if (!href) {
        return 'javascript:;'
      }
      if (href.match(/.*watchlater.*|javascript:;/g)) {
        return getRedirectLink(href)
      }
      if (href.indexOf('video/av') !== -1) {
        return href
      }
    })
  items.forEach((it, index) => {
    it.setAttribute('href', watchlaterList[index])
    it.setAttribute('target', '_blank')
  })
}
const redirectSelectors = (...selectors) => {
  for (const selector of selectors) {
    SpinQuery.select(
      () => document.querySelectorAll(selector),
      it => redirectLinks([...it])
    )
  }
}
SpinQuery.select('.watch-later-list').then(() => {
  Observer.childListSubtree('#viewlater-app', () => {
    SpinQuery.condition(
      () => document.URL.match(/(av[\d]+)\/p([\d]+)/),
      it => it && document.URL.indexOf('watchlater') !== -1,
      () => {
        const url = getRedirectLink(document.URL)
        if (url !== null) {
          window.location.replace(url)
        }
      }
    )
    SpinQuery.select("#viewlater-app .s-btn[href='#/']", it => it.remove())
    redirectSelectors('.av-pic', '.av-about>a')
  })
})
SpinQuery.select('li.nav-item[report-id*=watchlater]').then(() => {
  Observer.childListSubtree('li.nav-item[report-id*=watchlater]', () => {
    redirectSelectors('.av-item>a', '.av-about>a', 'div.watch-later-m>ul>div>li>a')
    SpinQuery.select('.read-more.mr', it => it.remove())
    SpinQuery.select('.read-more-grp>.read-more', it => {
      it.style.width = 'auto'
      it.style.float = 'none'
    })
  })
})
SpinQuery.select('.van-popper-favorite').then(async favoritePopup => {
  if (!favoritePopup) {
    return
  }
  const observers = Observer.childListSubtree(favoritePopup, () => {
    const playAll = favoritePopup.querySelector('.play-all')
    if (playAll) {
      const url = '//www.bilibili.com/watchlater/#/list'
      Observer.attributes(playAll, () => {
        if (playAll.getAttribute('href') === '//www.bilibili.com/watchlater/') {
          playAll.setAttribute('href', url)
          playAll.firstChild.classList.remove('bili-icon_dingdao_bofang')
          playAll.firstChild.classList.add('bili-icon_xinxi_yuedushu')
          playAll.lastChild.nodeValue = '查看全部'
        } else if (playAll.getAttribute('href') !== url) {
          playAll.firstChild.classList.add('bili-icon_dingdao_bofang')
          playAll.firstChild.classList.remove('bili-icon_xinxi_yuedushu')
          playAll.lastChild.nodeValue = '播放全部'
        }
      })
      observers.forEach(it => it.stop())
    }
  })
})

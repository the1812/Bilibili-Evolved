const isVideoPage = [
  'https://www.bilibili.com/video/',
  'https://www.bilibili.com/bangumi/',
].some(it => document.URL.startsWith(it))

// 已取消网址 av 号转换的开关
// https://github.com/the1812/Bilibili-Evolved/issues/1243
if (settings.preferAvUrl && document.URL.startsWith('https://www.bilibili.com/video/')) {
  SpinQuery.select(() => unsafeWindow.aid).then(aid => {
    if (!aid) {
      return
    }
    if (document.URL.includes('videocard_series')) {
      // 系列视频不能转换, 否则会无限刷新
      console.log('skip video series')
      return
    }
    const newUrl = document.URL.replace(/\/(video|bangumi)\/(BV[\w]+)/i, (_, type) => {
      return `/${type}/av${aid}`
    })
    if (document.URL !== newUrl) {
      history.replaceState({}, document.title, newUrl)
    }
  })
}
export default {
  widget: {
    content: /*html*/`<div class="bvid-convert"></div>`,
    condition: async () => {
      if (isVideoPage) {
        return Boolean(await SpinQuery.select(() => unsafeWindow.aid || unsafeWindow.bvid))
      } else {
        return false
      }
    },
    success: () => {
      resources.applyStyle('bvidConvertStyle')
      const render = (aid: string | undefined, bvid: string | undefined) => {
        if (!aid || !bvid) {
          return ''
        }
        return /*html*/`
          <div class="bvid-convert-item">av${aid}<i class="mdi mdi-link aid"></i></div>
          <div class="bvid-convert-item">${bvid}<i class="mdi mdi-link bvid"></i></div>
        `
      }
      const container = dq('.bvid-convert') as HTMLDivElement
      container.addEventListener('click', e => {
        const target = e.target as HTMLElement
        const list = target.classList
        if (list.contains('mdi')) {
          if (list.contains('mdi-check')) {
            return
          }
          const link = target.previousSibling as Node
          if (link) {
            const params = window.location.search ? `?${window.location.search}` : ''
            GM.setClipboard(`https://www.bilibili.com/video/${link.textContent}${params}`, 'text')
            list.remove('mdi-link')
            list.add('mdi-check')
            setTimeout(() => {
              list.remove('mdi-check')
              list.add('mdi-link')
            }, 1000)
          }
        }
      })
      const updateID = async () => {
        const label = dq('.bvid-convert') as HTMLDivElement
        label.innerHTML = render(unsafeWindow.aid, unsafeWindow.bvid)
        const link = await SpinQuery.select('.av-link,.bv-link,.bvid-link') as HTMLElement
        if (link) {
          label.innerHTML = render(unsafeWindow.aid, link.innerHTML)
        }
      }
      Observer.videoChange(updateID)
    }
  }
}
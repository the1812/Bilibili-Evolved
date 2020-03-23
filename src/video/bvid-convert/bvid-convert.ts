export default {
  widget: {
    content: /*html*/`<div class="bvid-convert"></div>`,
    condition: async () => {
      if ([
        'https://www.bilibili.com/video/',
        'https://www.bilibili.com/bangumi/',
      ].some(it => document.URL.startsWith(it))) {
        return Boolean(await SpinQuery.select(() => unsafeWindow.aid || unsafeWindow.bvid))
      } else {
        return false
      }
    },
    success: () => {
      resources.applyStyle('bvidConvertStyle')
      const label = dq('.bvid-convert') as HTMLDivElement
      const bvid = (() => {
        if (unsafeWindow.bvid) {
          return unsafeWindow.bvid
        }
        const link = dq('.av-link,.bv-link,.bvid-link') as HTMLElement
        return link.innerHTML || '未找到BV号'
      })()
      label.innerHTML = /*html*/`
        <div class="bvid-convert-item">av${unsafeWindow.aid}</div>
        <div class="bvid-convert-item">${bvid}</div>
      `
    }
  }
}
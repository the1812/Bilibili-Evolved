if (!isEmbeddedPlayer()) {
  const isMediaList = document.URL.includes('//www.bilibili.com/medialist/play/')
  Observer.videoChange(async () => {
    if (isMediaList && settings.expandDanmakuListIgnoreMediaList) {
      return
    }
    const danmakuBox = await SpinQuery.select('.bui-collapse-wrap')
    if (danmakuBox && danmakuBox.classList.contains('bui-collapse-wrap-folded')) {
      const button = await SpinQuery.select('.bui-collapse-header') as HTMLElement
      button?.click()
    }
  })
}

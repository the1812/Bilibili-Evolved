(async () => {
  if (!/^https:\/\/live\.bilibili\.com\/[\d]+/.test(document.URL)) {
    return
  }
  const popupContainer = await SpinQuery.select('.chat-popups-section')
  if (!popupContainer) {
    console.warn('[自动领奖] 未能找到弹窗容器')
    return
  }
  Observer.childList(popupContainer, () => {
    let draw: HTMLSpanElement | null
    while (true) {
      draw = dq('.chat-popups-section .draw>span:nth-child(3)') as HTMLSpanElement | null
      if (draw === null) {
        break
      }
      draw.click()
    }
  })
})()
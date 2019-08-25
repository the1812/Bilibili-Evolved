(async () => {
  if (!/^https:\/\/live\.bilibili\.com\/[\d]+/.test(document.URL)) {
    return
  }
  const popupContainer = await SpinQuery.select('.chat-popups-section')
  console.log(popupContainer)
  if (!popupContainer) {
    console.warn('[自动领奖] 未能找到弹窗容器')
    return
  }
  Observer.childListSubtree(popupContainer, () => {
    let draw: HTMLSpanElement | null
    while (true) {
      console.log('draw button = ', dq('.chat-popups-section .draw>span:nth-child(3)'))
      draw = dq('.chat-popups-section .draw>span:nth-child(3)') as HTMLSpanElement | null
      if (draw === null) {
        break
      }
      draw.click()
    }
  })
})()
(async () => {
  if (!/^https:\/\/live\.bilibili\.com\/[\d]+/.test(document.URL)) {
    return
  }
  const popupContainer = await SpinQuery.condition(
    () => dq('.chat-popups-section'),
    (it: HTMLElement) => it.querySelector('chat-draw-area') === null
  )
  if (!popupContainer) {
    console.warn('[自动领奖] 未能找到弹窗容器')
    return
  }
  Observer.childListSubtree(popupContainer, () => {
    let draw: HTMLSpanElement | null
    const tryDraw = () => {
      console.log('draw button = ', dq('.chat-popups-section .draw>span:nth-child(3)'))
      console.log(popupContainer)
      draw = dq('.chat-popups-section .draw>span:nth-child(3)') as HTMLSpanElement | null
      if (draw === null && dq('.chat-popups-section chat-draw-area') === null) {
        return
      }
      if (draw !== null) {
        draw.click()
      }
    }
    tryDraw()
  })
})()
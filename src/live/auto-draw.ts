(async () => {
  if (!/^https:\/\/live\.bilibili\.com\/(blanc\/)?[\d]+/.test(document.URL)) {
    return
  }
  const popupContainer = await SpinQuery.condition(
    () => dq('.chat-popups-section'),
    (it: HTMLElement) => it !== null && it.querySelector('chat-draw-area') === null
  )
  if (!popupContainer) {
    console.warn('[自动领奖] 未能找到弹窗容器')
    return
  }
  Observer.childListSubtree(popupContainer, () => {
    let draw: HTMLSpanElement | null
    console.log('draw button = ', dq('.chat-popups-section .draw>span:nth-child(3)'))
    draw = dq('.chat-popups-section .draw>span:nth-child(3)') as HTMLSpanElement | null
    if (draw === null) {
      const drawWaiting = dq('.chat-popups-section .function-bar>span:nth-child(3)') as HTMLSpanElement | null
      if (drawWaiting !== null) {
        const observers = Observer.attributes(drawWaiting, () => {
          if (drawWaiting.style.display !== 'none') {
            observers.forEach(it => it.stop())
            drawWaiting.click()
          }
        })
      }
    }
    if (draw !== null) {
      draw.click()
    }
  })
})()
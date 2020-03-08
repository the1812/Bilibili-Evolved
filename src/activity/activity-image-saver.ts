(async () => {
  if (!document.URL.startsWith('https://t.bilibili.com') &&
    !document.URL.startsWith('space.bilibili.com')) {
    return
  }
  const unlock = (container: Element) => {
    const image = container.querySelector('.image-viewer') as HTMLImageElement
    if (image === null) {
      console.log(container)
    } else {
      image.addEventListener('contextmenu', () => {
        setTimeout(() => {
          const popupMessage = dq('.pop-message .toast-text')
          if (popupMessage && popupMessage.innerHTML.includes('作者设置了禁止保存')) {
            Toast.success(/*html*/`<img src="${image.src}" width="200">`, '解除动态存图限制')
          }
        }, 200)
      })
    }
  }
  [...document.body.children].filter(it => it.classList.contains('photo-imager-container'))
    .forEach(unlock)
  Observer.childList(document.body, records => {
    records.forEach(record => {
      const photoContainers = [...record.addedNodes].filter(it => it instanceof Element && it.classList.contains('photo-imager-container')) as Element[]
      photoContainers.forEach(unlock)
    })
  })
})()

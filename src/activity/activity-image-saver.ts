(async () => {
  if (document.domain !== 't.bilibili.com') {
    return
  }
  const unlock = (container: Element) => {
    const image = container.querySelector('.image-viewer') as HTMLImageElement
    if (image === null) {
      console.log(container)
    } else {
      image.addEventListener('contextmenu', () => {
        Toast.success(/*html*/`<img src="${image.src}" width="200">`, '解除动态存图限制')
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

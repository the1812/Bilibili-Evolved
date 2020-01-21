const target = document.URL.includes('bangumi') ? '#bofqi' : '.video-info .video-title .tit'
// SpinQuery.count('.nav-con,#bofqi', 3).then(() => {
//   const element = document.querySelector(target)
//   if (element === null) {
//     return
//   }
//   element.scrollIntoView()
//   if (settings.playerFocusOffset !== 0) {
//     window.scrollBy(0, settings.playerFocusOffset)
//   }
// })
SpinQuery.select(target).then(async element => {
  await SpinQuery.condition(() => dq('.video-toolbar .ops .collect,.tool-bar .coin-info'), it => {
    return it !== null && it.innerText !== '--'
  })
  console.log(element)
  if (element === null) {
    return
  }
  element.scrollIntoView()
  if (settings.playerFocusOffset !== 0) {
    window.scrollBy(0, settings.playerFocusOffset)
  }
  console.log(element.offsetTop, settings.playerFocusOffset, window.scrollY)
})
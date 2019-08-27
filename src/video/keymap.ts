// const player = await SpinQuery.select('#bofqi') as HTMLDivElement
const keymap = {
  w: '.bilibili-player-video-web-fullscreen', // 网页全屏
  t: '.bilibili-player-video-btn-widescreen', // 宽屏
  r: '.bilibili-player-video-btn-repeat', // 切换循环模式
  m: '.bilibili-player-video-btn-volume .bilibili-player-iconfont-volume', // 切换静音
} as { [key: string]: string }
document.body.addEventListener('keydown', e => {
  if (document.activeElement && ["input", "textarea"].includes(document.activeElement.nodeName.toLowerCase())) {
    return
  }
  const key = e.key.toLowerCase()
  if (key in keymap) {
    e.stopPropagation()
    e.preventDefault();
    (dq(keymap[key]) as HTMLElement).click()
  } else if (key === 'd') { // 切换弹幕开关
    const checkbox = dq('.bilibili-player-video-danmaku-switch input') as HTMLInputElement
    checkbox.checked = !checkbox.checked
    raiseEvent(checkbox, 'change')
  }
})

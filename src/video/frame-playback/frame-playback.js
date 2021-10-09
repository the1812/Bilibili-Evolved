import html from 'framePlaybackHtml'

resources.applyStyle('framePlaybackStyle')
const main = async () => {
  const { playerAgent } = await import('../player-agent')
  if (settings.videoScreenshot) {
    const screenshotButton = await SpinQuery.select('.video-take-screenshot')
    if (screenshotButton === null || document.querySelector('.frame-playback')) {
      return
    }
    screenshotButton.insertAdjacentHTML('afterend', html)
  } else {
    const time = await playerAgent.query.control.buttons.time()
    if (time === null || document.querySelector('.frame-playback')) {
      return
    }
    time.insertAdjacentHTML('afterend', html)
  }

  let frameTime = 0
  const seek = (forward) => () => {
    playerAgent.changeTime((forward ? 1 : -1) * frameTime)
  }
  const prevFrame = seek(false)
  const nextFrame = seek(true)
  Observer.attributesSubtree(`${playerAgent.query.control.buttons.quality.selector} ul`, () => {
    const selectedQuality = document.querySelector(`${playerAgent.query.control.buttons.quality.selector} .bui-select-item-active, ${playerAgent.query.control.buttons.quality.selector} .active`)
    const quality = selectedQuality ? parseInt(selectedQuality.getAttribute('data-value')) : 0
    const fps = (() => {
      switch (quality) {
        // 60fps
        case 116:
        case 74:
          return 60000 / 1001
        // 30fps
        default:
          return 30000 / 1001
      }
    })()
    frameTime = 1 / fps
    // console.log(frameTime);
  })
  document.querySelector('.prev-frame').addEventListener('click', prevFrame)
  document.querySelector('.next-frame').addEventListener('click', nextFrame)
  if (settings.touchVideoPlayer) {
    document.querySelectorAll('.frame-playback').forEach(it => it.classList.add('touch'))
  }
}
Observer.videoChange(main)
export default {
  reload: () => document.querySelectorAll('.frame-playback').forEach(it => it.setAttribute('style', 'display: flex !important')),
  unload: () => document.querySelectorAll('.frame-playback').forEach(it => it.setAttribute('style', 'display: none !important'))
}

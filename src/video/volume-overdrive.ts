
const gainMap = new Map<HTMLVideoElement, AudioParam>()
export const getGain = (video: HTMLVideoElement) => {
  console.log('create new context')
  const context = new AudioContext()
  const source = context.createMediaElementSource(video)
  const gainNode = context.createGain()
  source.connect(gainNode)
  gainNode.connect(context.destination)
  gainMap.set(video, gainNode.gain)
  return gainNode.gain
}
export const resetGain = (video: HTMLVideoElement) => {
  if (gainMap.has(video)) {
    const gain = gainMap.get(video)!
    gain.value = 1
  }
}
export const setVolume = (video: HTMLVideoElement, volumeChange: number): number => {
  if (gainMap.has(video)) {
    const gain = gainMap.get(video)!
    let volume = gain.value + volumeChange
    if (volume < 0) {
      volume = 0
    }
    gain.value = volume
    return volume
  } else {
    const gain = getGain(video)
    const volume = gain.value + volumeChange
    gain.value = volume
    return volume
  }
}
const entry = async () => {
  const supportedUrls = [
    'https://www.bilibili.com/bangumi/',
    'https://www.bilibili.com/video/',
    'https://www.bilibili.com/watchlater/',
    'https://www.bilibili.com/medialist/play/',
  ]
  if (supportedUrls.every(url => !document.URL.startsWith(url))) {
    return
  }
  /** 音量增幅提示框用的`setTimeout`句柄 */
  let showVolumeTipOldTimeout: number
  /**
   * 显示音量增幅提示框
   * @param volume 音量
   */
  const showVolumeTip = (volume: number) => {
    let tip = dq('.volume-overdrive-tip') as HTMLDivElement
    if (!tip) {
      const player = dq('.bilibili-player-video-wrap')
      if (!player) {
        return
      }
      player.insertAdjacentHTML('afterbegin', /*html*/`
        <div class="volume-overdrive-tip-container">
          <i class="mdi mdi-volume-high"></i>
          <div class="volume-overdrive-tip"></div>
        </div>
      `)
      resources.applyStyleFromText(`
        .volume-overdrive-tip-container {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          padding: 8px 16px;
          background-color: #000A;
          color: white;
          pointer-events: none;
          opacity: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          font-size: 14pt;
          border-radius: 4px;
          transition: .2s ease-out;
        }
        .volume-overdrive-tip-container.show {
          opacity: 1;
        }
        .volume-overdrive-tip-container i {
          line-height: 1;
          margin-right: 8px;
          font-size: 18pt;
        }
      `, 'volumeOverdriveStyle')
      tip = dq('.volume-overdrive-tip') as HTMLDivElement
    }
    const video = dq('video') as HTMLVideoElement
    tip.innerHTML = `音量${Math.round(video.volume * 100)}% x 增幅${Math.round(volume * 100)}% = ${Math.round(video.volume * volume * 100)}%`
    if (showVolumeTipOldTimeout) {
      clearTimeout(showVolumeTipOldTimeout)
    }
    (dq('.volume-overdrive-tip-container') as HTMLDivElement).classList.add('show')
    showVolumeTipOldTimeout = setTimeout(() => {
      (dq('.volume-overdrive-tip-container') as HTMLDivElement).classList.remove('show')
    }, 2000)
  }
  Observer.videoChange(async () => {
    gainMap.clear()
    document.body.addEventListener('keydown', e => {
      const ctrlKey = !e.shiftKey && e.ctrlKey && !e.altKey && !e.metaKey
      if (ctrlKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        const video = dq('video') as HTMLVideoElement
        if (!video) {
          return
        }
        const volumeChange = e.key === 'ArrowDown' ? -0.1 : 0.1
        const volume = setVolume(video, volumeChange)
        showVolumeTip(volume)
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }, { capture: true })
  })
}
entry()

export default {
  export: {
    setVolume,
  }
}

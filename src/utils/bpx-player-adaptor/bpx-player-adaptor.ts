
const playerModePolyfill = async () => {
  const bpxContainer = await SpinQuery.select('.bpx-player-container') as HTMLElement
  if (!bpxContainer) {
    console.warn('[bpx player polyfill] bpxContainer not found')
    return
  }
  Observer.attributes(bpxContainer, () => {
    const dataScreen = bpxContainer.getAttribute('data-screen')
    document.body.classList.toggle('player-mode-webfullscreen', dataScreen === 'full' || dataScreen === 'web')
    document.body.classList.toggle('player-mode-widescreen', dataScreen === 'wide')
  })
}
const idPolyfill = async () => {
  const ep = await SpinQuery.select(() => unsafeWindow.ep)
  if (!ep) {
    console.warn('[bpx player polyfill] ep not found')
    return
  }
  Object.assign(unsafeWindow, {
    aid: ep.aid.toString(),
    cid: ep.cid.toString(),
    bvid: ep.bvid,
  })
}
export const bpxPlayerPolyfill = async () => {
  if (!document.URL.startsWith('https://www.bilibili.com/bangumi/play/')) {
    return
  }
  playerModePolyfill()
  idPolyfill()
}
export default {
  export: {
    bpxPlayerPolyfill,
  }
}

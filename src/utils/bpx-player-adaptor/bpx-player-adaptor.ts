
const playerModePolyfill = async () => {
  const bpxContainer = await SpinQuery.select('.bpx-player-container') as HTMLElement
  if (!bpxContainer) {
    console.warn('[bpx player polyfill] bpxContainer not found')
    return
  }
  Observer.attributes(bpxContainer, () => {
    const dataScreen = bpxContainer.getAttribute('data-screen')
    document.body.classList.toggle('player-mode-webfullscreen', dataScreen === 'full' || dataScreen === 'web')
    dataScreen === 'wide' ? document.body.classList.add('player-mode-widescreen') : ''
  })
}
const idPolyfill = async () => {
  const pbp = await SpinQuery.select(() => unsafeWindow.$pbp)
  if (!pbp) {
    console.warn('[bpx player polyfill] pbp not found')
    return
  }
  const idData = {
    aid: pbp.options.aid.toString(),
    cid: pbp.options.cid.toString(),
    bvid: pbp.options.bvid,
  }
  if (Object.values(idData).some(it => it === '' || parseInt(it) <= 0)) {
    console.warn('[bpx player polyfill] invalid pbp data')
  }
  Object.assign(unsafeWindow, idData)
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

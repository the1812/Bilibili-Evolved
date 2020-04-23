const qualities = [
  {
    name: '4K',
    value: 120,
  },
  {
    name: '1080P60',
    value: 116,
  },
  {
    name: '1080P+',
    value: 112,
  },
  {
    name: '1080P',
    value: 80,
  },
  {
    name: '720P60',
    value: 74,
  },
  {
    name: '720P',
    value: 64,
  },
  {
    name: '480P',
    value: 32,
  },
  {
    name: '360P',
    value: 15,
  },
  {
    name: '自动',
    value: 0,
  },
]
async function applyQuality() {
  const selector = '.bilibili-player-video-quality-menu .bui-select-list>li.bui-select-item'
  await SpinQuery.select(selector)
  const qualityItems = dqa(selector) as HTMLElement[]
  if (!qualityItems) {
    return
  }
  const [highestQualities] = qualityItems
    .map(it => parseInt(it.getAttribute('data-value')!))
    .sort(descendingSort(i => i))
  const [targetQuality] = qualities
    .filter(it => it.name === settings.defaultVideoQuality)
    .map(it => it.value)
    .sort(descendingSort(i => i))
  const [finalQuality] = qualities
    .map(it => it.value)
    .filter(it => it <= Math.min(targetQuality, highestQualities))
    .sort(descendingSort(i => i))
  const video = await SpinQuery.select('video') as HTMLVideoElement
  function onplay() {
    qualityItems.forEach(it => {
      if (parseInt(it.getAttribute('data-value')!) === finalQuality) {
        it.click()
      }
    })
    this.removeEventListener('play', onplay)
  }
  video.addEventListener('play', onplay)
}
Observer.videoChange(applyQuality)

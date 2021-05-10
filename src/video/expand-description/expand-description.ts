const id = 'expandDescriptionStyle'
const load = () => {
  resources.applyStyle(id)
  Observer.videoChange(async () => {
    const desc = await SpinQuery.select('.video-desc')
    if (!desc) {
      return
    }
    // const subtitle = dq(desc, '.subtitle') as HTMLElement
    // if (!subtitle) {
    //   return
    // }
    const expandButton = await SpinQuery.select('.video-desc .btn[report-id="abstract_spread"], .video-desc .toggle-btn') as HTMLElement
    expandButton?.click()
  })
}
load()
export default {
  reload: load,
  unload: () => resources.removeStyle(id),
}

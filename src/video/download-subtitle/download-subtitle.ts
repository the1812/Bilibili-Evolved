let lastUrl: string
const download = (text: string, filename: string) => {
  const a = document.createElement('a')
  const url = URL.createObjectURL(new Blob([text]))
  if (lastUrl) {
    URL.revokeObjectURL(lastUrl)
  }
  lastUrl = url
  a.setAttribute('href', url)
  a.setAttribute('download', escapeFilename(filename))
  document.body.appendChild(a)
  a.click()
  a.remove()
}
export default {
  widget: {
    content: /*html*/`
      <button class="gui-settings-flat-button" id="download-subtitle">
        <i class="icon-cc-subtitles"></i>
        <span>下载字幕</span>
      </button>`,
    condition: videoCondition,
    success: () => {
      const button = dq('#download-subtitle') as HTMLButtonElement
      button.addEventListener('click', async e => {
        try {
          button.disabled = true
          const { aid, cid } = unsafeWindow
          if (!aid || !cid) {
            logError('未找到视频AID和CID')
            return
          }
          const { VideoInfo } = await import('../video-info')
          const { getFriendlyTitle } = await import('../title')
          const info = new VideoInfo(aid)
          info.cid = parseInt(cid)
          await info.fetchInfo()
          const subtitles = info.subtitles
          if (subtitles.length === 0) {
            Toast.info('当前视频没有字幕.', '下载字幕', 3000)
            return
          }
          const settingsPanel = await loadSubtitleSettingsPanel()
          if (!settingsPanel) {
            logError('未找到字幕设置')
            return
          }
          const language = (settingsPanel.querySelector('.bilibili-player-video-subtitle-setting-lan .bui-select-result') as HTMLElement).innerHTML
          const subtitle = subtitles.find(s => s.language === language) || subtitles[0]
          // if (!subtitle) {
          //   logError(`未找到对应<span>${language}</span>的字幕.`)
          //   return
          // }
          const json = await Ajax.getJson(subtitle.url)
          const rawData = json.body
          if (e.shiftKey) {
            // TODO:
          } else {
            download(JSON.stringify(rawData), getFriendlyTitle(true) + '.json')
          }
        } catch (error) {
          logError(error)
        } finally {
          button.disabled = false
        }
      })
    },
  },
}

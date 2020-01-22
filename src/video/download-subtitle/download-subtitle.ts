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
          const json = await Ajax.getJson(subtitle.url)
          const rawData = json.body
          const title = getFriendlyTitle(true)
          if (e.shiftKey) {
            const { SubtitleConverter, SubtitleSize, SubtitleLocation } = await import('./subtitle-converter')

            const fontSizeThumb = settingsPanel.querySelector('.bilibili-player-video-subtitle-setting-fontsize .bui-thumb') as HTMLElement
            const translateX = parseFloat(fontSizeThumb.style.transform!.replace(/translateX\(([\d\.]+)/, '$1'))
            const fontSizeMapping: { [key: number]: number } = {
              214: SubtitleSize.VeryLarge,
              '163.5': SubtitleSize.Large,
              107: SubtitleSize.Medium,
              '50.5': SubtitleSize.Small,
              0: SubtitleSize.VerySmall,
            }
            const size = fontSizeMapping[translateX]

            const colorSpan = settingsPanel.querySelector('.bilibili-player-video-subtitle-setting-color .bui-select-result span:first-child') as HTMLElement
            const color = colorSpan.getAttribute('style')!.match(/background:[ ]*(.+);/)![1]

            const opacityDiv = settingsPanel.querySelector('.bilibili-player-video-subtitle-setting-opacity .bui-bar') as HTMLElement
            const opacity = parseFloat(opacityDiv.style.transform!.replace(/scaleX\(([\d\.]+)/, '$1'))

            const positionDiv = dq('.subtitle-position') as HTMLElement
            const positions = {
              bc: SubtitleLocation.BottomCenter,
              bl: SubtitleLocation.BottomLeft,
              br: SubtitleLocation.BottomRight,
              tc: SubtitleLocation.TopCenter,
              tl: SubtitleLocation.TopLeft,
              tr: SubtitleLocation.TopRight,
            }
            const location = Object.entries(positions).filter(([name]) => {
              return positionDiv.classList.contains(`subtitle-position-${name}`)
            }).map(([, location]) => location).shift()!

            const video = dq('video') as HTMLVideoElement
            const config = {
              title,
              height: video.videoHeight,
              width: video.videoWidth,
              color,
              location,
              opacity,
              size,
            }
            const converter = new SubtitleConverter(config)
            const ass = await converter.convertToAss(rawData)
            download(ass, title + '.ass')
          } else {
            download(JSON.stringify(rawData), title + '.json')
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

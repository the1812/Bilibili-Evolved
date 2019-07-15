import { getFriendlyTitle } from './title'
import { DanmakuInfo } from './video-info'
import { DanmakuConverter } from './danmaku-converter/danmaku-converter'

export async function convertToAss(xml: string) {
  const title = getFriendlyTitle()
  let config: any = { title }
  try {
    await loadLazyPanel('.bilibili-player-video-danmaku-setting')
    const getSliderIndex = (selector: string) => {
      const transform = parseFloat((dq(selector) as HTMLElement).style.transform!.replace(/translateX\(([\d\.]+)/, '$1')) as 0 | 44 | 94 | 144 | 188
      const index = {
        0: 0,
        44: 1,
        94: 2,
        144: 3,
        188: 4
      }[transform]
      return index
    }
    config.font = (dq('.bilibili-player-video-danmaku-setting-right-font .bui-select-result') as HTMLElement).innerText
    config.alpha = parseFloat((dq('.bilibili-player-setting-opacity .bui-bar') as HTMLElement).style.transform!.replace(/scaleX\(([\d\.]+)\)/, '$1'))
    config.duration = (() => {
      const scrollDuration = [10, 8, 6, 4, 2][getSliderIndex('.bilibili-player-setting-speedplus .bui-thumb')]
      return (danmaku: { type: number }) => {
        switch (danmaku.type) {
          case 4:
          case 5:
            return 4 // stickyDuration
          default:
            return scrollDuration
        }
      }
    })()
    config.blockTypes = (() => {
      let result: (number | string)[] = []
      const blockValues = {
        '.bilibili-player-block-filter-type[ftype=scroll]': [1, 2, 3],
        '.bilibili-player-block-filter-type[ftype=top]': [5],
        '.bilibili-player-block-filter-type[ftype=bottom]': [4],
        '.bilibili-player-block-filter-type[ftype=color]': ['color']
        // ".bilibili-player-block-filter-type[ftype=special]": [7, 8],
      }

      for (const [type, value] of Object.entries(blockValues)) {
        if ((dq(type) as HTMLElement).classList.contains('disabled')) {
          result = result.concat(value)
        }
      }
      return result.concat(7, 8)
    })()
    const resolutionFactor = [1.4, 1.2, 1, 0.8, 0.6][getSliderIndex('.bilibili-player-setting-fontsize .bui-thumb')] // 改变分辨率来调整字体大小
    config.resolution = {
      x: 1920 * resolutionFactor,
      y: 1080 * resolutionFactor
    }
    config.bottomMarginPercent = [0.75, 0.5, 0.25, 0, 0][getSliderIndex('.bilibili-player-setting-area .bui-thumb')]
    if (config.bottomMarginPercent === 0 && (dq('.bilibili-player-video-danmaku-setting-left-preventshade input') as HTMLInputElement).checked) // 无显示区域限制时要检查是否开启防挡字幕
    {
      config.bottomMarginPercent = 0.15
    }
    config.bold = (dq('.bilibili-player-video-danmaku-setting-right-font-bold input') as HTMLInputElement).checked
  } catch (error) {
    // The default config
    config = {
      font: '微软雅黑',
      alpha: 0.6,
      duration: (danmaku: { type: number }) => {
        switch (danmaku.type) {
          case 4:
          case 5:
            return 4
          default:
            return 6
        }
      },
      blockTypes: [7, 8],
      resolution: {
        x: 1920,
        y: 1080
      },
      bottomMarginPercent: 0.15,
      bold: false
    }
  }
  const converter = new DanmakuConverter(config)
  const assDocument = converter.convertToAssDocument(xml)
  return assDocument.generateAss()
}
export async function downloadDanmaku(ass: boolean, timeout: number | undefined) {
  const title = getFriendlyTitle()
  const danmaku = new DanmakuInfo(parseInt((unsafeWindow || window).cid!))
  await danmaku.fetchInfo()
  const blob = await (async () => {
    if (ass === true) {
      return new Blob([await convertToAss(danmaku.rawXML)], {
        type: 'text/plain'
      })
    } else {
      return new Blob([danmaku.rawXML], {
        type: 'text/plain'
      })
    }
  })()
  const url = URL.createObjectURL(blob)
  const link = dq('#danmaku-link') as HTMLAnchorElement
  const oldUrl = link.getAttribute('href')
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl)
  }
  clearTimeout(timeout);
  (dq('#download-danmaku>span') as HTMLElement).innerHTML = '下载弹幕'
  link.setAttribute('download', `${title}.${(ass ? 'ass' : 'xml')}`)
  link.setAttribute('href', url)
  link.click()
}
export default {
  export: {
    downloadDanmaku,
    convertToAss,
  },
  widget: {
    content: /* html */`
      <button
        class="gui-settings-flat-button"
        id="download-danmaku">
        <i class="icon-danmaku"></i>
        <span>下载弹幕</span>
        <a id="danmaku-link" style="display:none"></a>
      </button>`,
    condition: async () => {
      let cid = await SpinQuery.select(() => (unsafeWindow || window).cid)
      return Boolean(cid)
    },
    success: () => {
      const link = document.querySelector('#danmaku-link')
      dq('#download-danmaku')!.addEventListener('click', (e: MouseEvent) => {
        if (e.target !== link) {
          const timeout = setTimeout(
            () => (dq('#download-danmaku>span') as HTMLElement).innerHTML = '请稍侯...',
            200)
          downloadDanmaku(e.shiftKey, timeout)
        }
      })
    }
  }
}

import { getFriendlyTitle } from './title'
import { DanmakuInfo } from './video-info'
import { DanmakuConverter, DanmakuConverterConfig, DanmakuType } from './danmaku-converter/danmaku-converter'

export async function convertToAss(xml: string) {
  const title = getFriendlyTitle()
  const defaultConfig: Omit<DanmakuConverterConfig, 'title'> = {
    font: '微软雅黑',
    alpha: 0.4,
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
  let config = { ...defaultConfig, title } as DanmakuConverterConfig
  try {
    await loadDanmakuSettingsPanel()
    const getSliderFactor = (selector: string) => {
      const transform = parseFloat((dq(selector) as HTMLElement).style.transform!.replace(/translateX\(([\d\.]+)/, '$1'))
      return transform * 4 / 188
    }
    const getSliderIndex = (selector: string) => {
      const transform = parseFloat((dq(selector) as HTMLElement).style.transform!.replace(/translateX\(([\d\.]+)/, '$1')) as 0 | 47 | 94 | 141 | 188
      const index = {
        0: 0,
        47: 1,
        94: 2,
        141: 3,
        188: 4
      }[transform]
      return index
    }
    config.font = (dq('.bilibili-player-video-danmaku-setting-right-font .bui-select-result') as HTMLElement).innerText
    config.alpha = (100 - parseFloat((dq('.bilibili-player-setting-opacity .bui-thumb-tooltip') as HTMLElement).innerText)) / 100
    config.duration = (() => {
      const scrollDuration = 18 - 3 * getSliderFactor('.bilibili-player-setting-speedplus .bui-thumb')
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
      let result: (DanmakuType | 'color')[] = []
      const blockValues = {
        '.bilibili-player-block-filter-type[ftype=scroll]': [1, 2, 3],
        '.bilibili-player-block-filter-type[ftype=top]': [5],
        '.bilibili-player-block-filter-type[ftype=bottom]': [4],
        '.bilibili-player-block-filter-type[ftype=color]': ['color']
        // ".bilibili-player-block-filter-type[ftype=special]": [7, 8],
      }

      for (const [type, value] of Object.entries(blockValues)) {
        if ((dq(type) as HTMLElement).classList.contains('disabled')) {
          result = result.concat(value as (DanmakuType | 'color')[])
        }
      }
      return result.concat(7, 8)
    })()
    const resolutionFactor = 1.4 - 0.2 * getSliderFactor('.bilibili-player-setting-fontsize .bui-thumb') // 改变分辨率来调整字体大小
    config.resolution = {
      x: Math.round(1920 * resolutionFactor),
      y: Math.round(1080 * resolutionFactor),
    }
    config.bottomMarginPercent = [0.75, 0.5, 0.25, 0, 0][getSliderIndex('.bilibili-player-setting-area .bui-thumb')]
    if (config.bottomMarginPercent === 0 && (dq('.bilibili-player-video-danmaku-setting-left-preventshade input') as HTMLInputElement).checked) // 无显示区域限制时要检查是否开启防挡字幕
    {
      config.bottomMarginPercent = 0.15
    }
    config.bold = (dq('.bilibili-player-video-danmaku-setting-right-font-bold input') as HTMLInputElement).checked
    // 用户屏蔽词
    const playerSettingsJson = localStorage.getItem('bilibili_player_settings')
    if (playerSettingsJson) {
      const playerSettings = JSON.parse(playerSettingsJson)
      const blockSettings = _.get(playerSettings, 'block.list', []) as {
        /** 类型 */
        t: 'keyword' | 'regexp' | 'user',
        /** 内容 */
        v: string
        /** 是否开启 */
        s: boolean
        id: number
      }[]
      config.blockFilter = (danmaku) => {
        for (const b of blockSettings) {
          if (!b.s) {
            continue
          }
          switch (b.t) {
            case 'keyword': {
              if (danmaku.content.includes(b.v)) {
                return false
              }
              break
            }
            case 'regexp': {
              if (new RegExp(b.v).test(danmaku.content)) {
                return false
              }
              break
            }
            case 'user': {
              if (danmaku.userHash === b.v) {
                return false
              }
              break
            }
          }
        }
        return true
      }
    }
  } catch (error) {
    // The default config
    config = {
      ...config,
      ...defaultConfig,
    }
  }
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null) {
      console.warn('danmaku config invalid for key', key, ', value =', value)
      config[key] = defaultConfig[value]
    }
  }
  console.log(config)
  const converter = new DanmakuConverter(config)
  const assDocument = converter.convertToAssDocument(xml)
  return assDocument.generateAss()
}
export async function downloadDanmaku(ass: boolean) {
  const title = getFriendlyTitle()
  const danmaku = new DanmakuInfo((unsafeWindow || window).cid!)
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
  // clearTimeout(timeout);
  // (dq('#download-danmaku>span') as HTMLElement).innerHTML = '下载弹幕'
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
      <a id="danmaku-link" style="display:none"></a>
      <button
        class="gui-settings-flat-button"
        id="download-danmaku-xml">
        <i class="icon-danmaku"></i>
        <span>下载弹幕<span>(XML)</span></span>
      </button>
      <button
        class="gui-settings-flat-button"
        id="download-danmaku-ass">
        <i class="icon-danmaku"></i>
        <span>下载弹幕<span>(ASS)</span></span>
      </button>
    `,
    condition: async () => {
      let cid = await SpinQuery.select(() => (unsafeWindow || window).cid)
      return Boolean(cid)
    },
    success: () => {
      const buttonXml = dq('#download-danmaku-xml') as HTMLButtonElement
      const buttonAss = dq('#download-danmaku-ass') as HTMLButtonElement
      const allButtons = [buttonXml, buttonAss]
      const addListener = (button: HTMLButtonElement, ass: boolean) => {
        button.addEventListener('click', async () => {
          try {
            allButtons.forEach(b => b.disabled = true)
            await downloadDanmaku(ass)
          } catch (error) {
            logError(error)
          } finally {
            allButtons.forEach(b => b.disabled = false)
          }
        })
      }
      addListener(buttonXml, false)
      addListener(buttonAss, true)
    }
  }
}

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
    const playerSettingsJson = localStorage.getItem('bilibili_player_settings')

    if (playerSettingsJson) {
      const playerSettings = JSON.parse(playerSettingsJson)
      const getConfig = <T>(prop: string, defaultValue?: T): T =>
        _.get(playerSettings, `setting_config.${prop}`, defaultValue)

      // 屏蔽类型
      config.blockTypes = (() => {
        const result: (DanmakuType | 'color')[] = []
        const blockValues = {
          scroll: [1, 2, 3],
          top: [5],
          bottom: [4],
          color: ['color']
        }

        for (const [type, value] of Object.entries(blockValues)) {
          if (_.get(playerSettings, `block.type_${type}`, true) === false) {
            result.push(...value as (DanmakuType | 'color')[])
          }
        }
        return result.concat(7, 8) // 高级弹幕不做转换
      })()

      // 加粗
      config.bold = getConfig('bold', false)

      // 透明度
      config.alpha = _.clamp(1 - parseFloat(getConfig('opacity', '0.4')), 0, 1)

      // 分辨率
      const resolutionFactor = 1.4 - 0.4 * getConfig('fontsize', 1)
      config.resolution = {
        x: Math.round(1920 * resolutionFactor),
        y: Math.round(1080 * resolutionFactor),
      }

      // 弹幕持续时长
      config.duration = (() => {
        const scrollDuration = 18 - 3 * getConfig('speedplus', 0)
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

      // 底部间距
      const bottomMargin = getConfig('danmakuArea', 0)
      config.bottomMarginPercent = bottomMargin >= 100 ? 0 : bottomMargin / 100
      // 无显示区域限制时要检查是否开启防挡字幕
      if (config.bottomMarginPercent === 0 && getConfig('preventshade', false)) {
        config.bottomMarginPercent = 0.15
      }

      // 用户屏蔽词
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
    } else {
      console.warn('[弹幕转换] 未找到播放器设置')
      config = {
        ...config,
        ...defaultConfig
      }
    }

    // 字体直接从 HTML 里取了, localStorage 里是 font-family 解析更麻烦些
    config.font = (dq('.bilibili-player-video-danmaku-setting-right-font .bui-select-result') as HTMLElement).innerText

  } catch (error) {
    // The default config
    logError(error)
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

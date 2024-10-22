import { loadDanmakuSettingsPanel } from '@/core/utils/lazy-panel'
import { logError } from '@/core/utils/log'
import { ascendingSort } from '@/core/utils/sort'
import { getFriendlyTitle } from '@/core/utils/title'
import { DanmakuConverterConfig, DanmakuConverter } from '../converter/danmaku-converter'
import { DanmakuType } from '../converter/danmaku-type'
import { XmlDanmaku } from '../converter/xml-danmaku'
import { playerAgent } from '@/components/video/player-agent'
import { getComponentSettings } from '@/core/settings'
import { DownloadDanmakuOptions } from './options'

export class JsonDanmaku {
  // static SegmentSize = 6 * 60
  public jsonDanmakus: {
    id: number
    idStr: string
    progress: number
    mode: number
    fontsize: number
    color: number
    midHash: string
    content: string
    ctime: number
    weight: number
    action: string
    pool: number
    attr: number
  }[] = []
  constructor(public aid: number | string, public cid: number | string) {}
  // get segmentCount() {
  //   return Math.ceil(this.duration / JsonDanmaku.SegmentSize)
  // }
  get xmlDanmakus() {
    return this.jsonDanmakus.map(json => ({
      content: json.content,
      time: json.progress ? (json.progress / 1000).toString() : '0',
      type: json.mode?.toString() ?? '1',
      fontSize: json.fontsize?.toString() ?? '25',
      color: json.color?.toString() ?? '16777215',
      timeStamp: json.ctime?.toString() ?? '0',
      pool: json.pool?.toString() ?? '0',
      userHash: json.midHash ?? '0',
      rowId: json.idStr ?? '0',
    }))
  }
  async fetchInfo() {
    const { getDanmakuSegment, getDanmakuView } = await import('../converter/danmaku-segment')
    const view = await getDanmakuView(this.aid, this.cid)
    const { total } = view.dmSge
    if (total === undefined) {
      throw new Error(`获取弹幕分页数失败: ${JSON.stringify(lodash.omit(view, 'flag'))}`)
    }
    console.log('segment count =', total)
    const segments = await Promise.all(
      new Array(total).fill(0).map(async (_, index) => {
        try {
          const result = await getDanmakuSegment(this.aid, this.cid, index)
          const elements: any[] = result.elems ?? []
          console.log(
            `received blob for segment ${index + 1}, count = ${elements.length}, result =`,
            result,
          )
          return elements
        } catch (error) {
          logError(error)
          throw error
        }
      }),
    )
    this.jsonDanmakus = segments.flat().sort(ascendingSort(it => it.progress ?? 0))
    return this
  }
}
export type DanmakuDownloadType = 'json' | 'xml' | 'ass'
export const getUserDanmakuConfig = async () => {
  const downloadDanmakuOptions =
    getComponentSettings<DownloadDanmakuOptions>('downloadDanmaku').options
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
      y: 1080,
    },
    bottomMarginPercent: 0.15,
    bold: false,
  }
  let config = { ...defaultConfig, title } as DanmakuConverterConfig
  try {
    await loadDanmakuSettingsPanel()
    const playerSettingsJson = localStorage.getItem('bilibili_player_settings')

    if (playerSettingsJson) {
      // 屏蔽类型
      config.blockTypes = (() => {
        const result: (DanmakuType | 'color')[] = []
        const blockValues = {
          scroll: [1, 2, 3],
          top: [5],
          bottom: [4],
          color: ['color'],
        }

        for (const [type, value] of Object.entries(blockValues)) {
          if (playerAgent.getPlayerConfig<boolean>(`block.type_${type}`, true) === false) {
            result.push(...(value as (DanmakuType | 'color')[]))
          }
        }
        return result.concat(7, 8) // 高级弹幕不做转换
      })()

      // 加粗
      config.bold = playerAgent.getPlayerConfig('dmSetting.bold', false)

      // 透明度
      config.alpha = lodash.clamp(
        1 - parseFloat(playerAgent.getPlayerConfig('dmSetting.opacity', '0.4')),
        0,
        1,
      )

      // 分辨率
      const resolutionFactor = 1.4 - 0.4 * playerAgent.getPlayerConfig('dmSetting.fontsize', 1)
      config.resolution = {
        x: Math.round(1920 * resolutionFactor),
        y: Math.round(1080 * resolutionFactor),
      }

      // 弹幕持续时长
      config.duration = (() => {
        const speed =
          downloadDanmakuOptions.speed === 'auto'
            ? playerAgent.getPlayerConfig('dmSetting.speedplus', 0)
            : downloadDanmakuOptions.speed
        const scrollDuration = 18 - 3 * speed
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
      const bottomMargin = playerAgent.getPlayerConfig('dmSetting.danmakuArea', 0)
      config.bottomMarginPercent = bottomMargin >= 100 ? 0 : bottomMargin / 100
      // 无显示区域限制时要检查是否开启防挡字幕
      if (
        config.bottomMarginPercent === 0 &&
        playerAgent.getPlayerConfig('dmSetting.preventshade', false)
      ) {
        config.bottomMarginPercent = 0.15
      }

      // 用户屏蔽词
      const blockSettings = playerAgent.getPlayerConfig<
        {
          /** 类型 */
          t: 'keyword' | 'regexp' | 'user'
          /** 内容 */
          v: string
          /** 是否开启 */
          s: boolean
          id: number
        }[]
      >('block.list', [])
      config.blockFilter = danmaku => {
        for (const b of blockSettings) {
          if (!b.s) {
            continue
          }
          switch (b.t) {
            default:
              return true
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
        ...defaultConfig,
      }
    }

    // 字体直接从 HTML 里取了, localStorage 里是 font-family 解析更麻烦些
    config.font = (
      dq(
        ':is(.bilibili-player-video-danmaku-setting-right-font, .bpx-player-dm-setting-right-font-content-fontfamily) .bui-select-result',
      ) as HTMLElement
    ).innerText
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
  return config
}
export const convertToAss = async (xml: string) => {
  const converter = new DanmakuConverter(await getUserDanmakuConfig())
  const assDocument = converter.xmlStringToAssDocument(xml)
  return assDocument.generateAss()
}
export const convertToAssFromJson = async (danmaku: JsonDanmaku) => {
  const converter = new DanmakuConverter(await getUserDanmakuConfig())
  const assDocument = converter.xmlDanmakuToAssDocument(
    danmaku.xmlDanmakus.map(x => new XmlDanmaku(x)),
  )
  return assDocument.generateAss()
}
export const convertToXmlFromJson = (danmaku: JsonDanmaku) => {
  const xmlText = `
<?xml version="1.0" encoding="UTF-8"?><i><chatserver>chat.bilibili.com</chatserver><chatid>${
    danmaku.cid
  }</chatid><mission>0</mission><maxlimit>${
    danmaku.xmlDanmakus.length
  }</maxlimit><state>0</state><real_name>0</real_name><source>k-v</source>
${danmaku.xmlDanmakus.map(x => `  ${new XmlDanmaku(x).text()}`).join('\n')}
</i>
  `.trim()
  return xmlText
}

export const getBlobByType = async (
  type: DanmakuDownloadType,
  input: {
    aid: string
    cid: string
  } = unsafeWindow,
) => {
  const { aid, cid } = input
  const danmaku = await new JsonDanmaku(aid, cid).fetchInfo()
  switch (type) {
    case 'xml': {
      return new Blob([convertToXmlFromJson(danmaku)], {
        type: 'text/xml',
      })
    }
    default:
    case 'json': {
      return new Blob([JSON.stringify(danmaku.jsonDanmakus, undefined, 2)], {
        type: 'text/json',
      })
    }
    case 'ass': {
      return new Blob([await convertToAssFromJson(danmaku)], {
        type: 'text/ass',
      })
    }
  }
}

import { postTextWithCredentials } from '@/core/ajax'
import { formData, getCsrf } from '@/core/utils'
import { logError } from '@/core/utils/log'

export abstract class Badge {
  constructor(public isActive: boolean = false, public id: number = 0) { }
  static parseJson<T>(text: string, actions: {
    successAction: (json: any) => T,
    errorMessage: string,
    errorAction: (json: any) => T
  }) {
    const json = JSON.parse(text)
    if (json.code !== 0) {
      logError(`${actions.errorMessage} 错误码:${json.code} ${json.message || ''}`)
      return actions.errorAction(json)
    }
    return actions.successAction(json)
  }
  abstract activate(): Promise<boolean>
  abstract deactivate(): Promise<boolean>
}
export class Medal extends Badge {
  level: number
  name: string
  upName: string
  roomID: number
  isLighted: boolean
  constructor(json: any) {
    const {
      medal_id, status, level, medalName, uname, roomid, is_lighted,
    } = json
    super(status === 1, medal_id)
    this.level = level
    this.name = medalName
    this.upName = uname
    this.roomID = roomid
    this.isLighted = is_lighted
  }
  async activate() {
    return Badge.parseJson(
      await postTextWithCredentials('https://api.live.bilibili.com/xlive/web-room/v1/fansMedal/wear', formData({
        medal_id: this.id,
        csrf_token: getCsrf(),
        csrf: getCsrf(),
      })),
      {
        successAction: () => {
          this.isActive = true
          return true
        },
        errorAction: () => false,
        errorMessage: '佩戴勋章失败.',
      },
    )
  }
  async deactivate() {
    return Badge.parseJson(
      await postTextWithCredentials('https://api.live.bilibili.com/xlive/web-room/v1/fansMedal/take_off', formData({
        csrf_token: getCsrf(),
        csrf: getCsrf(),
      })),
      {
        successAction: () => {
          this.isActive = false
          return true
        },
        errorAction: () => false,
        errorMessage: '卸下勋章失败.',
      },
    )
  }
}
export const getMedalList = async () => {
  const { getTextWithCredentials } = await import('@/core/ajax')
  return Badge.parseJson(
    await getTextWithCredentials('https://api.live.bilibili.com/i/api/medal?page=1&pageSize=256'),
    {
      successAction: json => lodash.get(json, 'data.fansMedalList', []).map((it: any) => new Medal(it)) as Medal[],
      errorAction: () => [] as Medal[],
      errorMessage: '无法获取勋章列表.',
    },
  )
}
export class Title extends Badge {
  static imageMap: { [id: string]: string }
  tid: number
  cid: number
  name: string
  source: string
  imageUrl: string
  constructor(json: any) {
    const {
      id, cid, wear, css, name, source,
    } = json
    super(wear, css)
    this.tid = id
    this.cid = cid
    this.name = name
    this.source = source
    Title.getImageMap().then(it => {
      this.imageUrl = it[this.id]
    })
  }
  static async getImageMap() {
    if (Title.imageMap === undefined) {
      const { getTextWithCredentials } = await import('@/core/ajax')
      return Badge.parseJson(
        await getTextWithCredentials('https://api.live.bilibili.com/rc/v1/Title/webTitles'),
        {
          successAction(json) {
            Title.imageMap = {}
            json.data.forEach((it: any) => {
              Title.imageMap[it.identification] = it.web_pic_url
            })
            return Title.imageMap
          },
          errorAction: () => ({}),
          errorMessage: '获取头衔图片失败.',
        },
      )
    }

    return Title.imageMap
  }
  async activate() {
    return Badge.parseJson(
      await postTextWithCredentials('https://api.live.bilibili.com/i/ajaxWearTitle', `id=${this.tid}&cid=${this.cid}&csrf=${getCsrf()}&csrf_token=${getCsrf()}`),
      {
        successAction: () => {
          this.isActive = true
          return true
        },
        errorAction: () => false,
        errorMessage: '佩戴头衔失败.',
      },
    )
  }
  async deactivate() {
    return Badge.parseJson(
      await postTextWithCredentials('https://api.live.bilibili.com/i/ajaxCancelWearTitle',
        `csrf=${getCsrf()}&csrf_token=${getCsrf()}`),
      {
        successAction: () => {
          this.isActive = false
          return true
        },
        errorAction: () => false,
        errorMessage: '卸下头衔失败.',
      },
    )
  }
}
export const getTitleList = async () => {
  const { getTextWithCredentials } = await import('@/core/ajax')
  return Badge.parseJson(
    await getTextWithCredentials('https://api.live.bilibili.com/i/api/ajaxTitleInfo?page=1&pageSize=256&had=1'),
    {
      successAction: json => lodash.get(json, 'data.list', []).map((it: any) => new Title(it)) as Title[],
      errorAction: () => [] as Title[],
      errorMessage: '无法获取头衔列表.',
    },
  )
}

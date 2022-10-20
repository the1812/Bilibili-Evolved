import {
  getJsonWithCredentials,
  getPages,
  getTextWithCredentials,
  postTextWithCredentials,
} from '@/core/ajax'
import { formData, getCsrf } from '@/core/utils'
import { logError } from '@/core/utils/log'

const validateJson = (json: any, errorMessage: string) => {
  if (json.code !== 0) {
    const message = `${errorMessage} 错误码:${json.code} ${json.message || ''}`
    logError(message)
    return false
  }
  return true
}

export abstract class Badge {
  constructor(public isActive: boolean = false, public id: number = 0) {}
  /** @deprecated */
  static parseJson<T>(
    text: string,
    actions: {
      successAction: (json: any) => T
      errorMessage: string
      errorAction: (json: any) => T
    },
  ) {
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
      medal: { medal_id, level, medal_name, wearing_status, is_lighted },
      anchor_info: { nick_name },
      room_info: { room_id },
    } = json
    super(wearing_status === 1, medal_id)
    this.level = level
    this.name = medal_name
    this.upName = nick_name
    this.roomID = room_id
    this.isLighted = is_lighted
  }
  async activate() {
    const text = await postTextWithCredentials(
      'https://api.live.bilibili.com/xlive/web-room/v1/fansMedal/wear',
      formData({
        medal_id: this.id,
        csrf_token: getCsrf(),
        csrf: getCsrf(),
      }),
    )
    const result = validateJson(JSON.parse(text), '佩戴勋章失败.')
    this.isActive = true
    return result
  }
  async deactivate() {
    const text = await postTextWithCredentials(
      'https://api.live.bilibili.com/xlive/web-room/v1/fansMedal/take_off',
      formData({
        csrf_token: getCsrf(),
        csrf: getCsrf(),
      }),
    )
    const result = validateJson(JSON.parse(text), '卸下勋章失败.')
    this.isActive = false
    return result
  }
}
export const getMedalList = async () => {
  const pages = await getPages({
    api: page =>
      getJsonWithCredentials(
        `https://api.live.bilibili.com/xlive/app-ucenter/v1/fansMedal/panel?page=${page}&page_size=50`,
      ),
    getList: json => {
      validateJson(json, '无法获取勋章列表.')
      return [...lodash.get(json, 'data.list', []), ...lodash.get(json, 'data.special_list', [])]
    },
    getTotal: json => lodash.get(json, 'data.total_number', 0),
  })
  return pages.map(it => new Medal(it))
}
export class Title extends Badge {
  static imageMap: { [id: string]: string }
  tid: number
  cid: number
  name: string
  source: string
  imageUrl: string
  constructor(json: any) {
    const { id, cid, wear, css, name, source } = json
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
      await postTextWithCredentials(
        'https://api.live.bilibili.com/i/ajaxWearTitle',
        `id=${this.tid}&cid=${this.cid}&csrf=${getCsrf()}&csrf_token=${getCsrf()}`,
      ),
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
      await postTextWithCredentials(
        'https://api.live.bilibili.com/i/ajaxCancelWearTitle',
        `csrf=${getCsrf()}&csrf_token=${getCsrf()}`,
      ),
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
export const getTitleList = async () =>
  Badge.parseJson(
    await getTextWithCredentials(
      'https://api.live.bilibili.com/i/api/ajaxTitleInfo?page=1&pageSize=256&had=1',
    ),
    {
      successAction: json =>
        lodash.get(json, 'data.list', []).map((it: any) => new Title(it)) as Title[],
      errorAction: () => [] as Title[],
      errorMessage: '无法获取头衔列表.',
    },
  )

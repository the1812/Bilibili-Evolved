import {
  getJsonWithCredentials,
  getPages,
  getTextWithCredentials,
  postTextWithCredentials,
} from '@/core/ajax'
import { getCsrf } from '@/core/utils'
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
      new URLSearchParams({
        medal_id: this.id.toString(),
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
      new URLSearchParams({
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
    const { identification, wear, tid, cid, name, source } = json
    super(wear, identification)
    this.tid = tid
    this.cid = cid
    this.name = name
    this.source = source
    Title.getImageMap().then(it => {
      this.imageUrl = it[this.id]
    })
  }
  static async getImageMap() {
    if (Title.imageMap === undefined) {
      const json = JSON.parse(
        await getTextWithCredentials('https://api.live.bilibili.com/rc/v1/Title/webTitles'),
      )
      if (validateJson(json, '获取头衔图片失败.')) {
        Title.imageMap = {}
        json.data.forEach((it: any) => {
          Title.imageMap[it.identification] = it.web_pic_url
        })
        return Title.imageMap
      }
      return {}
    }

    return Title.imageMap
  }
  async activate() {
    const json = JSON.parse(
      await postTextWithCredentials(
        'https://api.live.bilibili.com/i/ajaxWearTitle',
        `id=${this.tid}&cid=${this.cid}&csrf=${getCsrf()}&csrf_token=${getCsrf()}`,
      ),
    )
    if (validateJson(json, '佩戴头衔失败.')) {
      this.isActive = true
      return true
    }
    return false
  }
  async deactivate() {
    const json = JSON.parse(
      await postTextWithCredentials(
        'https://api.live.bilibili.com/i/ajaxCancelWearTitle',
        `csrf=${getCsrf()}&csrf_token=${getCsrf()}`,
      ),
    )
    if (validateJson(json, '卸下头衔失败.')) {
      this.isActive = false
      return true
    }
    return false
  }
}
export const getTitleList = async (): Promise<Title[]> => {
  const json = JSON.parse(
    await getTextWithCredentials(
      'https://api.live.bilibili.com/xlive/web-ucenter/v1/user_title/TitleList?normal=0&special=0&had=1&page=1&page_size=256',
    ),
  )
  if (validateJson(json, '无法获取头衔列表.')) {
    return lodash.get(json, 'data.list', []).map((it: any) => new Title(it))
  }
  return []
}

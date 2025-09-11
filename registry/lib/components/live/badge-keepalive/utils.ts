import { postTextWithCredentials, getJsonWithCredentials } from '@/core/ajax'
import { getCsrf, getUID } from '@/core/utils'

// 获取当前直播间号
export function getLiveRoomId(): string {
  let matched = location.href.match(/live.bilibili.com\/(\d+)/)
  if (matched) {
    return matched[1]
  }
  matched = location.href.match(/live.bilibili.com\/blanc\/(\d+)/)
  return matched ? matched[1] : ''
}

export function validateRoomId(value: string): boolean {
  return /^\d+$/.test(value)
}

function validateJSON(data) {
  if (data.code !== 0) {
    throw new Error(data.message)
  }

  return data.data
}

export async function getLiveRoomUserInfo(room_id: string) {
  const data = await getJsonWithCredentials(
    `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByUser?room_id=${room_id}`,
  )

  return validateJSON(data)
}

export async function keepAliveRequest(room_id: string, click_time = '300') {
  // 需要先获取直播间房主的 UID
  const data = await getLiveRoomUserInfo(room_id)

  const { curr_weared } = data.medal
  if (!curr_weared) {
    throw new Error(`暂未获得直播间 ${room_id} 的粉丝勋章`)
  }

  const anchor_id = curr_weared.target_id

  const params = {
    click_time,
    room_id,
    anchor_id,
    uid: getUID(),
    csrf: getCsrf(),
  }

  const baseURL =
    'https://api.live.bilibili.com/xlive/app-ucenter/v1/like_info_v3/like/likeReportV3'

  return validateJSON(
    JSON.parse(await postTextWithCredentials(baseURL, new URLSearchParams(params))),
  )
}

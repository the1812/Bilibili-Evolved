import { postTextWithCredentials, getJsonWithCredentials } from '@/core/ajax'
import { getCsrf, getUID } from '@/core/utils'
import { getComponentSettings } from '@/core/settings'
import { Options } from './index'

const { options } = getComponentSettings<Options>('badgeKeepalive')

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

// 获取当前佩戴勋章所属的直播间号
export async function getWornMedalRoomId(): Promise<string> {
  const { medal } = await getLiveRoomUserInfo(getLiveRoomId())

  const targetRoomId = medal?.curr_weared?.target_roomid
  if (targetRoomId) {
    return String(targetRoomId)
  }

  // curr_weared 缺失时, 尝试用佩戴勋章的 ruid 查询其直播间号
  const ruid = medal?.curr_weared_v2?.ruid
  if (ruid) {
    const json = await getJsonWithCredentials(
      `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${ruid}`,
    )
    const { roomid } = validateJSON(json)
    if (roomid) {
      return String(roomid)
    }
  }

  throw new Error('未获取到当前佩戴勋章的直播间')
}

export async function keepAliveRequest(
  room_id: string,
  click_time: typeof options.defaultClickTimes,
) {
  // 需要先获取直播间房主的 UID
  const data = await getLiveRoomUserInfo(room_id)

  // 当前佩戴的勋章可能属于其他直播间, 点赞必须归属当前直播间的主播,
  // 因此从本直播间的勋章信息中取房主 uid, 而不能用佩戴中勋章 (curr_weared) 的 target_id
  const { medal, anchor_info, room_info } = data
  const anchor_id =
    medal?.up_medal?.uid ?? medal?.lookup_v2?.ruid ?? anchor_info?.uid ?? room_info?.uid

  // lookup / lookup_v2 为用户在本直播间的粉丝勋章信息, 未获得勋章时为 null (旧接口为 medal.target_id)
  const hasMedal = Boolean(medal?.lookup_v2 ?? medal?.lookup ?? medal?.target_id)
  if (!anchor_id || !hasMedal) {
    throw new Error(`暂未获得直播间 ${room_id} 的粉丝勋章`)
  }

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

import { getWatchlaterList } from '@/components/video/watchlater'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formatDate } from '@/core/utils/formatters'
import { getHistoryItems } from '../../../../custom-navbar/history/types'

export interface AccountProfile {
  isLogin: boolean
  mid: number
  uname: string
  face?: string
  pendant?: { image?: string }
  level_info?: { current_level: number; current_exp: number }
  is_senior_member?: boolean
  vipType?: number
  vipStatus?: number
  vip_label?: { text?: string }
  money?: number
  wallet?: { bcoin_balance?: number }
}

export interface AccountRow {
  label: string
  value?: number | string
  url?: string
  image?: string
  detail?: string
}

const getAccountData = <T>(url: string, error: string) =>
  bilibiliApi<T>(getJsonWithCredentials(url), error, false)

export const getAccountCounts = async (mid: number): Promise<AccountRow[]> => {
  const params = new URLSearchParams({ mid: String(mid) })
  const [account, creator] = await Promise.all([
    getAccountData<{ following?: number; follower?: number; dynamic_count?: number }>(
      'https://api.bilibili.com/x/web-interface/nav/stat',
      '获取账号数据失败',
    ),
    getAccountData<{ likes?: number; archive?: { view?: number }; article?: { view?: number } }>(
      `https://api.bilibili.com/x/space/upstat?${params}`,
      '获取创作数据失败',
    ).catch(() => undefined),
  ])
  const space = `https://space.bilibili.com/${mid}`
  return [
    { label: '关注', value: account.following, url: `${space}/fans/follow` },
    { label: '粉丝', value: account.follower, url: `${space}/fans/fans` },
    { label: '动态', value: account.dynamic_count, url: `${space}/dynamic` },
    { label: '获赞数', value: creator?.likes },
    { label: '播放数', value: creator?.archive?.view, url: `${space}/video` },
    { label: '阅读数', value: creator?.article?.view },
  ].filter(item => typeof item.value === 'number')
}

export const getAccountPrivileges = async (): Promise<AccountRow[]> => {
  const { list } = await getAccountData<{
    list?: { type: number; state?: number; expire_time?: number }[]
  }>('https://api.bilibili.com/x/vip/privilege/my', '获取大会员权益失败')
  return [
    { type: 1, label: 'B币券' },
    { type: 2, label: '优惠券' },
  ].flatMap(({ type, label }) => {
    const privilege = list?.find(item => item.type === type)
    if (privilege?.state !== 0 && privilege?.state !== 1) {
      return []
    }
    const received = privilege.state === 1
    return [
      {
        label,
        value: received ? '已领取' : '未领取',
        detail:
          received && privilege.expire_time > 0
            ? `有效期至 ${formatDate(new Date(privilege.expire_time * 1000))}`
            : undefined,
      },
    ]
  })
}

const activitySize = 5

export const getAccountHistory = async (): Promise<AccountRow[]> => {
  const entries = await getHistoryItems()
  return entries.slice(0, activitySize).map(entry => ({
    label: entry.title,
    url: entry.url,
    image: entry.cover,
    detail: [entry.upName, formatDate(entry.time)].filter(Boolean).join(' · '),
  }))
}

export const getAccountWatchlater = async (): Promise<AccountRow[]> => {
  const entries = await getWatchlaterList(true)
  return entries.slice(0, activitySize).map(entry => ({
    label: entry.title,
    url: entry.bvid
      ? `https://www.bilibili.com/list/watchlater?bvid=${entry.bvid}`
      : `https://www.bilibili.com/video/av${entry.aid}`,
    image: entry.bangumi?.cover ?? entry.pic,
    detail: entry.owner?.name,
  }))
}

import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formatDate } from '@/core/utils/formatters'

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
  detail?: string
}

const getAccountData = <T>(url: string, error: string) =>
  bilibiliApi<T>(getJsonWithCredentials(url), error, false)

export const getAccountProfile = async (): Promise<AccountProfile | undefined> => {
  const response = getJsonWithCredentials('https://api.bilibili.com/x/web-interface/nav')
  if ((await response)?.code === -101) {
    return undefined
  }
  const profile = await bilibiliApi<AccountProfile>(response, '获取账号信息失败', false)
  if (profile.isLogin === false) {
    return undefined
  }
  if (
    profile.isLogin !== true ||
    !Number.isSafeInteger(profile.mid) ||
    profile.mid <= 0 ||
    typeof profile.uname !== 'string'
  ) {
    throw new Error('账号信息响应无效')
  }
  return profile
}

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

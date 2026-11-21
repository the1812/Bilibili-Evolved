import { bilibiliApi, getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'
import {
  getWebUrl,
  inboxCategories,
  messageCenter,
  type InboxCategory,
  type InteractionCategory,
} from '../../shared/urls'

const api = 'https://api.bilibili.com'
const messageApi = 'https://api.vc.bilibili.com'
const sessionsApi = `${messageApi}/session_svr/v1/session_svr`
const webParams = { build: '0', mobi_app: 'web' }

export type UnreadCounts = Partial<Record<InboxCategory, number>>

interface InboxEntry {
  id: string
  title: string
  text?: string
  context?: string
  timestamp?: number
  url?: string
  unread?: number
  acknowledgement?: { talker: string; sequence: string }
}

export interface InboxPage {
  entries: InboxEntry[]
  noticeCursor?: string
}

const get = <T>(url: string, params?: Record<string, string>, error = '获取消息失败') =>
  bilibiliApi<T>(
    getJsonWithCredentials(`${url}?${new URLSearchParams({ ...webParams, ...params })}`),
    error,
    false,
  )

export const getInboxUnread = async (): Promise<UnreadCounts> => {
  const [notifications, conversations] = await Promise.allSettled([
    get<{ reply?: number; at?: number; like?: number; sys_msg?: number }>(
      `${messageApi}/x/im/web/msgfeed/unread`,
    ),
    get<{ follow_unread?: number; unfollow_unread?: number }>(`${sessionsApi}/single_unread`),
  ])
  if (notifications.status === 'rejected' && conversations.status === 'rejected') {
    throw notifications.reason
  }
  const alerts = notifications.status === 'fulfilled' ? notifications.value : {}
  const messages = conversations.status === 'fulfilled' ? conversations.value : {}
  const { follow_unread: followed, unfollow_unread: unfollowed } = messages
  return {
    reply: alerts.reply,
    at: alerts.at,
    like: alerts.like,
    system: alerts.sys_msg,
    private:
      followed === undefined && unfollowed === undefined
        ? undefined
        : (followed ?? 0) + (unfollowed ?? 0),
  }
}

const replyPrefix = /^[ \t]*回复[ \t]*@[^:：\r\n]+[:：][ \t]*/
const decimalId = (value: string | number | undefined) => {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    return undefined
  }
  const text = String(value ?? '')
  return /^\d+$/.test(text) ? text : undefined
}

interface Interaction {
  id?: string | number
  user?: { nickname?: string }
  users?: { nickname?: string }[]
  counts?: number
  reply_time?: number
  at_time?: number
  like_time?: number
  item?: {
    source_content?: string
    target_reply_content?: string
    source_id?: string | number
    item_id?: string | number
    title?: string
    uri?: string
  }
}

const getInteractions = async (category: InteractionCategory): Promise<InboxPage> => {
  const data = await get<{
    items?: Interaction[]
    latest?: { items?: Interaction[] }
    total?: { items?: Interaction[] }
  }>(`${api}/x/msgfeed/${category}`, { platform: 'web' })
  const items = data.items ?? [...(data.latest?.items ?? []), ...(data.total?.items ?? [])]
  const entries = items.map((entry, index): InboxEntry => {
    const people = entry.users?.map(user => user.nickname).filter(Boolean) ?? []
    const names = entry.user?.nickname ?? people.join('、')
    const title =
      names && entry.counts > people.length && category === 'like'
        ? `${names}等 ${entry.counts} 人`
        : names || 'B站用户'
    const date = entry.reply_time ?? entry.at_time ?? entry.like_time
    const uri = getWebUrl(entry.item?.uri)
    const sourceId = decimalId(category === 'like' ? entry.item?.item_id : entry.item?.source_id)
    return {
      id: decimalId(entry.id) ?? `interaction-${index}`,
      title,
      text: entry.item?.source_content?.replace(replyPrefix, ''),
      context: entry.item?.target_reply_content || entry.item?.title,
      timestamp: date > 0 ? date * 1000 : undefined,
      url:
        uri && sourceId && !uri.includes('#') && !uri.includes('dmid=')
          ? `${uri}#reply${sourceId}`
          : uri,
    }
  })
  return { entries: lodash.uniqBy(entries, entry => entry.id) }
}

interface SystemNotice {
  id?: string | number
  cursor?: string | number
  title?: string
  content?: string
  time_at?: string
}

const getSystemNotices = async (): Promise<InboxPage> => {
  type NoticeList = { system_notify_list?: SystemNotice[] }
  const [unified, user] = await Promise.all([
    get<NoticeList>(`${messageCenter}/x/sys-msg/query_unified_notify`, { page_size: '10' }),
    get<NoticeList>(`${messageCenter}/x/sys-msg/query_user_notify`, { page_size: '20' }),
  ])
  const notices = [...(unified.system_notify_list ?? []), ...(user.system_notify_list ?? [])]
  let noticeCursor: string | undefined
  const entries = notices.map((notice, index): InboxEntry => {
    const cursor = decimalId(notice.cursor)
    if (cursor && (!noticeCursor || BigInt(cursor) > BigInt(noticeCursor))) {
      noticeCursor = cursor
    }
    let text = notice.content ?? ''
    try {
      const content = JSON.parse(text)
      if (typeof content?.web === 'string') {
        text = content.web
      }
    } catch {
      // 系统通知也会直接返回纯文本。
    }
    const link = /#{([^}]+)}\{"?([^}"]+)"?}/
    const timestamp = Date.parse(notice.time_at ?? '')
    return {
      id: decimalId(notice.id) ?? cursor ?? `notice-${index}`,
      title: notice.title || inboxCategories.system.label,
      text: text.replace(/#{([^}]+)}\{"?([^}"]+)"?}/g, '$1'),
      timestamp: Number.isFinite(timestamp) ? timestamp : undefined,
      url: getWebUrl(text.match(link)?.[2]),
    }
  })
  entries.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
  return { entries: lodash.uniqBy(entries, entry => entry.id), noticeCursor }
}

interface Session {
  talker_id?: string | number
  session_type?: number
  system_msg_type?: number
  max_seqno?: string | number
  session_ts?: string | number
  unread_count?: number
  account_info?: { name?: string }
  group_name?: string
  last_msg?: { content?: string }
}

const messagePreview = (message?: Session['last_msg']) => {
  if (!message?.content) {
    return undefined
  }
  try {
    const content = JSON.parse(message.content)
    return typeof content?.content === 'string' ? content.content : '在消息中心查看消息'
  } catch {
    return message.content
  }
}

const getPrivateSessions = async (): Promise<InboxPage> => {
  const { session_list } = await get<{ session_list?: Session[] | null }>(
    `${sessionsApi}/get_sessions`,
    { session_type: '1', group_fold: '1', unfollow_fold: '0', sort_rule: '2', size: '20' },
  )
  const sessions = session_list ?? []
  const users = lodash.uniq(
    sessions
      .filter(session => session.session_type === 1 && !session.system_msg_type)
      .map(session => decimalId(session.talker_id))
      .filter(Boolean),
  )
  const profiles = users.length
    ? await get<Record<string, { name?: string }>>(`${api}/x/polymer/pc-electron/v1/user/cards`, {
        uids: users.join(','),
      }).catch(() => ({}))
    : {}
  const entries = sessions.map((session, index): InboxEntry => {
    const talker = decimalId(session.talker_id)
    const sequence = decimalId(session.max_seqno)
    const userConversation = session.session_type === 1 && !session.system_msg_type
    const timestamp = Number(session.session_ts) / 1000
    return {
      id: talker ? `${session.session_type}-${talker}` : `session-${index}`,
      title:
        (userConversation && profiles[talker]?.name) ||
        session.account_info?.name ||
        session.group_name ||
        (userConversation && talker ? `UID ${talker}` : '会话'),
      text: messagePreview(session.last_msg),
      timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : undefined,
      url: userConversation && talker ? `${inboxCategories.private.url}/mid${talker}` : undefined,
      unread: session.unread_count,
      acknowledgement:
        userConversation && talker && sequence && session.unread_count > 0
          ? { talker, sequence }
          : undefined,
    }
  })
  return { entries }
}

export const getInboxPage = (category: InboxCategory) => {
  if (category === 'system') {
    return getSystemNotices()
  }
  if (category === 'private') {
    return getPrivateSessions()
  }
  return getInteractions(category)
}

export const markSystemNoticesRead = (cursor: string) =>
  get(
    `${messageCenter}/x/sys-msg/update_cursor`,
    { cursor, has_up: '0' },
    '更新系统通知已读状态失败',
  )

export const markPrivateSessionRead = (
  acknowledgement: NonNullable<InboxEntry['acknowledgement']>,
) => {
  const csrf = getCsrf()
  if (!csrf) {
    throw new Error('请先登录')
  }
  const params = new URLSearchParams({
    ...webParams,
    csrf,
    csrf_token: csrf,
    talker_id: acknowledgement.talker,
    session_type: '1',
    ack_seqno: acknowledgement.sequence,
  })
  return bilibiliApi(
    postTextWithCredentials(`${sessionsApi}/update_ack`, params).then(JSON.parse),
    '更新私信已读状态失败',
    false,
  )
}

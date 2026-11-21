import { dashboardUrls } from '../../shared/urls'

export const inboxCategories = {
  reply: {
    label: '回复我的',
    url: dashboardUrls.inbox.reply,
    icon: 'mdi-message-reply-text',
  },
  at: { label: '@我的', url: dashboardUrls.inbox.at, icon: 'mdi-at' },
  like: { label: '收到的赞', url: dashboardUrls.inbox.like, icon: 'mdi-thumb-up-outline' },
  system: { label: '系统通知', url: dashboardUrls.inbox.system, icon: 'mdi-bell-outline' },
  private: { label: '私信', url: dashboardUrls.inbox.private, icon: 'mdi-chat-outline' },
}

export type InboxCategory = keyof typeof inboxCategories
export type InteractionCategory = Exclude<InboxCategory, 'system' | 'private'>

export const isInteractionCategory = (category: InboxCategory): category is InteractionCategory =>
  category !== 'system' && category !== 'private'

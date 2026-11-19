export const messageCenterUrl = 'https://message.bilibili.com'

export const inboxCategories = {
  reply: {
    label: '回复我的',
    url: `${messageCenterUrl}/#/reply`,
    icon: 'mdi-message-reply-text',
  },
  at: { label: '@我的', url: `${messageCenterUrl}/#/at`, icon: 'mdi-at' },
  like: { label: '收到的赞', url: `${messageCenterUrl}/#/love`, icon: 'mdi-thumb-up-outline' },
  system: { label: '系统通知', url: `${messageCenterUrl}/#/system`, icon: 'mdi-bell-outline' },
  private: { label: '私信', url: `${messageCenterUrl}/#/whisper`, icon: 'mdi-chat-outline' },
}

export type InboxCategory = keyof typeof inboxCategories
export type InteractionCategory = Exclude<InboxCategory, 'system' | 'private'>

export const isInteractionCategory = (category: InboxCategory): category is InteractionCategory =>
  category !== 'system' && category !== 'private'

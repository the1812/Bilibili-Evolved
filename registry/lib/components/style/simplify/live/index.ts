import { wrapSwitchOptions } from '@/components/switch-options'
import { liveUrls } from '@/core/utils/urls'

export const component = wrapSwitchOptions({
  name: 'simplifyOptions',
  switches: {
    vip: {
      defaultValue: true,
      displayName: '老爷图标',
    },
    enterPrompt: {
      defaultValue: true,
      displayName: '入场通知',
    },
    wealthMedal: {
      defaultValue: true,
      displayName: '荣耀等级勋章',
    },
    fansMedal: {
      defaultValue: true,
      displayName: '粉丝勋章',
    },
    title: {
      defaultValue: true,
      displayName: '活动头衔',
    },
    guard: {
      defaultValue: true,
      displayName: '舰长图标',
    },
    systemMessage: {
      defaultValue: true,
      displayName: '全区广播',
    },
    welcomeMessage: {
      defaultValue: true,
      displayName: '欢迎信息',
    },
    giftMessage: {
      defaultValue: true,
      displayName: '礼物弹幕',
    },
    emoticons: {
      defaultValue: true,
      displayName: '表情特效',
    },
    guardPurchase: {
      defaultValue: true,
      displayName: '上舰提示',
    },
    giftPanel: {
      defaultValue: true,
      displayName: '付费礼物',
    },
    headerPanel: {
      defaultValue: false,
      displayName: '标题栏活动',
    },
    userEffect: {
      defaultValue: true,
      displayName: '入场特效',
    },
    kanban: {
      defaultValue: true,
      displayName: '看板娘',
    },
    eventsBanner: {
      defaultValue: false,
      displayName: '活动横幅',
    },
    rankList: {
      defaultValue: false,
      displayName: '排行榜',
    },
    popup: {
      defaultValue: false,
      displayName: '抽奖提示',
    },
    pk: {
      defaultValue: false,
      displayName: 'PK浮窗',
    },
    topRank: {
      defaultValue: false,
      displayName: '高能榜提示',
    },
    recommendedRooms: {
      defaultValue: false,
      displayName: '推荐直播间',
    },
    skin: {
      defaultValue: false,
      displayName: '房间皮肤',
    },
  },
})({
  name: 'simplifyLiveroom',
  displayName: '简化直播间',
  entry: async () => {
    const { setupSkinSimplify } = await import('./skin')
    setupSkinSimplify()
  },
  instantStyles: [
    {
      name: 'simplify-liveroom',
      style: () => import('./live.scss'),
      important: true,
    },
  ],
  description: {
    'zh-CN': '隐藏直播间中各种不需要的内容.',
  },
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: liveUrls,
})

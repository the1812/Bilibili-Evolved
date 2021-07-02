import { createSwitchOptions } from '@/components/switch-options'
import { styledComponentEntry } from '@/components/styled-component'
import { liveUrls } from '@/core/utils/urls'

export const component = createSwitchOptions({
  name: 'simplifyOptions',
  dimAt: 'checked',
  switchProps: {
    checkedIcon: 'mdi-eye-off-outline',
    notCheckedIcon: 'mdi-eye-outline',
  },
  switches: {
    vip: {
      defaultValue: true,
      displayName: '老爷图标',
    },
    enterPrompt: {
      defaultValue: true,
      displayName: '入场通知',
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
    guardPurchase: {
      defaultValue: true,
      displayName: '上舰提示',
    },
    giftPanel: {
      defaultValue: true,
      displayName: '付费礼物',
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
    skin: {
      defaultValue: false,
      displayName: '房间皮肤',
    },
  },
})(
  {
    name: 'simplifyLiveroom',
    displayName: '简化直播间',
    entry: styledComponentEntry(() => import('./live.scss'), async () => {
      const { setupSkinSimplify } = await import('./skin')
      setupSkinSimplify()
    }),
    description: {
      'zh-CN': `
- 隐藏老爷图标
- 隐藏粉丝勋章
- 隐藏活动头衔
- 隐藏用户等级
- 隐藏舰长图标
- 隐藏全区广播
- 隐藏欢迎信息 (xxx老爷进入直播间)
- 隐藏礼物弹幕 (仅弹幕列表, 特殊效果如节奏风暴不受影响)
- 隐藏上舰提示 (弹幕列表里的 xxx开通了舰长)
- 隐藏付费礼物 (播放器下面的各种金瓜子礼物, 以及许愿瓶, 上舰等)
- 隐藏入场特效
- 隐藏看板娘
- 隐藏活动横幅
- 隐藏抽奖提示 (开通舰长, 小飞船抽奖等)
- 禁用直播间皮肤

> 每一项都可以在<span>功能</span>中单独选择是否隐藏.`.trim(),
    },
    tags: [
      componentsTags.live,
      componentsTags.style,
    ],
    urlInclude: liveUrls,
    enabledByDefault: true,
  },
)

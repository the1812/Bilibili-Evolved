import { ComponentMetadata, componentsTags } from '@/components/component'

export const component: ComponentMetadata = {
  name: 'noLiveHomeAutoPlay',
  displayName: '禁止直播首页自动播放',
  enabledByDefault: true,
  tags: [
    componentsTags.live,
  ],
  description: {
    'zh-CN': '禁止直播首页的推荐直播间自动开始播放.',
  },
  entry: async () => {
    const { addComponentListener } = await import('@/core/settings')
    const { addStyle } = await import('@/core/style')
    const styleID = 'hide-home-live'
    addComponentListener('noLiveHomeAutoPlay.hide', (value: boolean) => {
      if (value) {
        addStyle('.player-area-ctnr,#player-header { display: none !important }', styleID)
      } else {
        document.getElementById(styleID)?.remove()
      }
    }, true)
  },
  options: {
    hide: {
      displayName: '隐藏首页直播板块',
      defaultValue: false,
    },
  },
  urlInclude: [
    /^https:\/\/live\.bilibili\.com\/$/,
    /^https:\/\/live\.bilibili\.com\/index\.html$/,
  ],
  plugin: {
    async setup() {
      const { createHook } = await import('@/core/utils')
      const { select } = await import('@/core/spin-query')
      let blocked = false
      createHook(HTMLVideoElement.prototype, 'play', () => {
        if (!blocked) {
          blocked = true
          select('.bilibili-live-player-video-controller-start-btn>button')
            .then((button: HTMLButtonElement) => {
              button?.click()
            })
          return false
        }
        return true
      })
    },
  },
}

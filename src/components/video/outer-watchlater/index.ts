import { ComponentMetadata, componentsTags } from '@/components/component'

const entry = async () => {
  const {
    dq, mountVueComponent, getUID, playerReady,
  } = await import('@/core/utils')
  if (!getUID()) {
    return
  }
  await playerReady()
  const favoriteButton = dq('.video-toolbar .ops .collect') as HTMLElement
  if (!favoriteButton) {
    return
  }
  const OuterWatchlater = await import('./OuterWatchlater.vue')
  const vm: Vue & {
    aid: string
  } = mountVueComponent(OuterWatchlater)
  favoriteButton.insertAdjacentElement('afterend', vm.$el)
  const { videoChange } = await import('@/core/observer')
  videoChange(() => {
    vm.aid = unsafeWindow.aid
  })
}
export const component: ComponentMetadata = {
  name: 'outerWatchlater',
  displayName: '外置稍后再看',
  enabledByDefault: true,
  entry,
  tags: [
    componentsTags.video,
  ],
  description: {
    'zh-CN': '将视频页面菜单里的\`稍后再看\`移到外面.',
  },
  urlInclude: [
    '//www.bilibili.com/video/',
  ],
  reload: () => {
    document.querySelectorAll('.ops .watchlater').forEach((it: HTMLElement) => {
      it.style.display = 'inline-block'
    })
  },
  unload: () => {
    document.querySelectorAll('.ops .watchlater').forEach((it: HTMLElement) => {
      it.style.display = 'none'
    })
  },
}

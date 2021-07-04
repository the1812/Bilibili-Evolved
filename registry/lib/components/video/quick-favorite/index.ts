import { ComponentMetadata } from '@/components/types'
import { favoriteListUrls, videoUrls } from '@/core/utils/urls'

const entry = async () => {
  const { playerReady, aidReady, mountVueComponent } = await import('@/core/utils')
  await playerReady()
  await aidReady()
  const favoriteButton = dq('.video-toolbar .ops .collect')
  if (!favoriteButton) {
    return
  }
  const QuickFavorite = await import('./QuickFavorite.vue')
  const vm: Vue & {
    aid: string
  } = mountVueComponent(QuickFavorite)
  favoriteButton.insertAdjacentElement('afterend', vm.$el)
  const { videoChange } = await import('@/core/observer')
  videoChange(() => {
    vm.aid = unsafeWindow.aid
  })
}
export const component: ComponentMetadata = {
  name: 'quickFavorite',
  displayName: '启用快速收藏',
  description: {
    'zh-CN': '启用快速收藏, 在视频页面可以一键收藏到设定的某个收藏夹.',
  },
  enabledByDefault: false,
  entry,
  unload: () => {
    dqa('.ops .quick-favorite').forEach((it: HTMLElement) => (it.style.display = 'none'))
  },
  reload: () => {
    dqa('.ops .quick-favorite').forEach((it: HTMLElement) => (it.style.display = 'inline-block'))
  },
  urlInclude: videoUrls,
  urlExclude: favoriteListUrls,
  tags: [
    componentsTags.video,
  ],
  options: {
    favoriteFolderID: {
      defaultValue: 0,
      displayName: '快速收藏夹ID',
      hidden: true,
    },
  },
}

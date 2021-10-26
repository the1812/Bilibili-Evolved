import { ComponentMetadata } from '@/components/types'
import { favoriteListUrls, videoUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../utils/keymap/bindings'

const entry = async () => {
  const {
    playerReady,
    mountVueComponent,
    getUID,
  } = await import('@/core/utils')
  if (!getUID()) {
    return
  }

  await playerReady()
  const favoriteButton = dq('.video-toolbar .ops .collect')
  if (!favoriteButton) {
    return
  }
  const QuickFavorite = await import('./QuickFavorite.vue')
  let vm: Vue & {
    aid: string
    syncFavoriteState: () => Promise<void>
  }
  const { videoChange } = await import('@/core/observer')
  videoChange(() => {
    if (!vm) {
      vm = mountVueComponent(QuickFavorite)
      favoriteButton.insertAdjacentElement('afterend', vm.$el)
    }
    vm.aid = unsafeWindow.aid
    vm.syncFavoriteState()
  })
}
export const component: ComponentMetadata = {
  name: 'quickFavorite',
  displayName: '启用快速收藏',
  description: {
    'zh-CN': '启用快速收藏, 在视频页面可以一键收藏到设定的某个收藏夹.',
  },
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
  plugin: {
    displayName: '快速收藏 - 快捷键支持',
    setup: ({ addData }) => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.quickFavorite = {
          displayName: '快速收藏',
          run: context => {
            const { clickElement } = context
            return clickElement('.quick-favorite', context)
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.quickFavorite = 'shift s'
      })
    },
  },
}

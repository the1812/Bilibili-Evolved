import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { matchUrlPattern } from '@/core/utils'
import { favoriteListUrls, videoUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../utils/keymap/bindings'

const options = defineOptionsMetadata({
  favoriteFolderID: {
    defaultValue: 0,
    displayName: '快速收藏夹ID',
    hidden: true,
  },
  showInFavoritePages: {
    defaultValue: false,
    displayName: '在收藏夹播放页面仍然显示',
  },
})
const entry: ComponentEntry<typeof options> = async ({ settings }) => {
  if (favoriteListUrls.some(matchUrlPattern) && !settings.options.showInFavoritePages) {
    return
  }
  const {
    playerReady,
    mountVueComponent,
    getUID,
  } = await import('@/core/utils')
  if (!getUID()) {
    return
  }

  await playerReady()
  const favoriteButton = dq('.video-toolbar .ops .collect, .video-toolbar-v1 .toolbar-left .collect')
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
export const component = defineComponentMetadata({
  name: 'quickFavorite',
  displayName: '启用快速收藏',
  description: {
    'zh-CN': '启用快速收藏, 在视频页面可以一键收藏到设定的某个收藏夹. 首次启动时或者右键点击快速收藏图标可以配置快速收藏夹. 请注意如果在在收藏夹播放页面仍然显示, 是不会实时同步右侧的播放列表的.',
  },
  entry,
  unload: () => {
    dqa('.ops .quick-favorite').forEach((it: HTMLElement) => (it.style.display = 'none'))
  },
  reload: () => {
    dqa('.ops .quick-favorite').forEach((it: HTMLElement) => (it.style.display = 'inline-block'))
  },
  urlInclude: videoUrls,
  // urlExclude: favoriteListUrls,
  tags: [
    componentsTags.video,
  ],
  options,
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
})

import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { getUID, matchUrlPattern, mountVueComponent } from '@/core/utils'
import { favoriteListUrls, videoUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../utils/keymap/bindings'
import { addVideoActionButton } from '@/components/video/video-actions'
import { videoChange } from '@/core/observer'
import { options, Options } from './options'

const entry: ComponentEntry<Options> = async ({ settings }) => {
  if (favoriteListUrls.some(matchUrlPattern) && !settings.options.showInFavoritePages) {
    return
  }
  if (!getUID()) {
    return
  }
  const QuickFavorite = await import('./QuickFavorite.vue')
  const vm: Vue & {
    aid: string
    syncFavoriteState: () => Promise<void>
  } = mountVueComponent(QuickFavorite)
  await addVideoActionButton(() => vm.$el)
  videoChange(() => {
    vm.aid = unsafeWindow.aid
    vm.syncFavoriteState()
  })
}
export const component = defineComponentMetadata({
  name: 'quickFavorite',
  displayName: '启用快速收藏',
  description: {
    'zh-CN':
      '启用快速收藏, 在视频页面可以一键收藏到设定的某个收藏夹. 首次启动时或者右键点击快速收藏图标可以配置快速收藏夹. 请注意如果在在收藏夹播放页面仍然显示, 是不会实时同步右侧的播放列表的.',
  },
  entry,
  unload: () => {
    dqa('.be-quick-favorite').forEach((it: HTMLElement) => (it.style.display = ''))
  },
  reload: () => {
    dqa('.be-quick-favorite').forEach((it: HTMLElement) => (it.style.display = 'inline-block'))
  },
  urlInclude: videoUrls,
  // urlExclude: favoriteListUrls,
  tags: [componentsTags.video],
  options,
  plugin: {
    displayName: '快速收藏 - 快捷键支持',
    setup: ({ addData }) => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.quickFavorite = {
          displayName: '快速收藏',
          run: context => {
            const { clickElement } = context
            return clickElement('.be-quick-favorite', context)
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.quickFavorite = 'shift s'
      })
    },
  },
})

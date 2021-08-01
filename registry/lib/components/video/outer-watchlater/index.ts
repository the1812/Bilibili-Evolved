import { ComponentMetadata } from '@/components/types'
import { videoUrls, watchlaterUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../utils/keymap/bindings'

const entry = async () => {
  const {
    mountVueComponent, getUID, playerReady,
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
  entry,
  tags: [
    componentsTags.video,
  ],
  description: {
    'zh-CN': '将视频页面菜单里的\`稍后再看\`移到外面.',
  },
  urlInclude: videoUrls,
  urlExclude: watchlaterUrls,
  reload: () => {
    dqa('.ops .watchlater').forEach((it: HTMLElement) => {
      it.style.display = 'inline-block'
    })
  },
  unload: () => {
    dqa('.ops .watchlater').forEach((it: HTMLElement) => {
      it.style.display = 'none'
    })
  },
  plugin: {
    displayName: '稍后再看 - 快捷键支持',
    setup: ({ addData }) => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.watchlater = {
          displayName: '稍后再看',
          run: context => {
            const { clickElement } = context
            return clickElement('.video-toolbar .ops .watchlater, .more-ops-list .ops-watch-later, .video-toolbar-module .see-later-box', context)
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.watchlater = 'shift w'
      })
    },
  },
}

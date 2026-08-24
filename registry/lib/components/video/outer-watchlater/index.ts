import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { getUID, matchUrlPattern, mountVueComponent } from '@/core/utils'
import { videoAndBangumiUrls, watchlaterUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../utils/keymap/bindings'
import { addVideoActionButton } from '@/components/video/video-actions'
import { Options, options } from './options'

const entry: ComponentEntry<Options> = async ({ settings }) => {
  if (watchlaterUrls.some(matchUrlPattern) && !settings.options.showInWatchlaterPages) {
    return
  }
  if (!getUID()) {
    return
  }
  const OuterWatchlater = await import('./OuterWatchlater.vue')
  const vm: Vue & {
    aid: string
  } = mountVueComponent(OuterWatchlater)
  if (await addVideoActionButton(() => vm.$el)) {
    const { videoChange } = await import('@/core/observer')
    videoChange(({ aid }) => {
      console.log('videoChange', unsafeWindow.aid, aid)
      vm.aid = unsafeWindow.aid
    })
  }
}
export const component = defineComponentMetadata({
  name: 'outerWatchlater',
  displayName: '外置稍后再看',
  entry,
  tags: [componentsTags.video],
  urlInclude: videoAndBangumiUrls,
  // urlExclude: watchlaterUrls,
  options,
  reload: () => {
    dqa('.be-outer-watchlater').forEach((it: HTMLElement) => {
      it.style.display = ''
    })
  },
  unload: () => {
    dqa('.be-outer-watchlater').forEach((it: HTMLElement) => {
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
            return clickElement('.be-outer-watchlater', context)
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.watchlater = 'shift w'
      })
    },
  },
})

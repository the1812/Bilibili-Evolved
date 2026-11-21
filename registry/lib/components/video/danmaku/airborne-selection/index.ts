import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { mountVueComponent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../../../utils/keymap/bindings'

const componentName = 'airborneSelection'

const options = defineOptionsMetadata({
  analysisStrategy: {
    defaultValue: 'realtime',
    displayName: '弹幕分析策略',
    hidden: true,
    validator: (value: string, oldValue: string) =>
      value === 'full' || value === 'realtime' ? value : oldValue,
  },
})

type SelectionDialogVm = Vue & {
  selectNextAirborne: () => boolean
}

let selectionDialogVm: SelectionDialogVm | null = null

export const component = defineComponentMetadata({
  displayName: '根据弹幕快捷空降',
  name: componentName,
  tags: [componentsTags.video],
  author: {
    name: 'Cosy',
    link: 'https://space.bilibili.com/180611120',
  },
  urlInclude: playerUrls,
  options,
  extraOptions: () => import('./ExtraOptions.vue').then(m => m.default),

  /// 组件启动入口
  entry: async () => {
    /// 为播放器添加组件

    const videoWrapElement = await playerAgent.query.video.wrap()
    const selectionDialog = await import('./SelectionDialog.vue')
    const vueIns: SelectionDialogVm = mountVueComponent(selectionDialog)
    selectionDialogVm = vueIns
    unsafeWindow.selectVue = vueIns

    // 原生投票对话框容器元素 'bpx-player-cmd-dm-inside'
    videoWrapElement.querySelector('.bpx-player-cmd-dm-inside').appendChild(vueIns.$el)
  },
  plugin: {
    displayName: '根据弹幕快捷空降 - 快捷键支持',
    setup: ({ addData }) => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.airborneSelectionNext = {
          displayName: '切换空降位置',
          run: () => selectionDialogVm?.selectNextAirborne() === true,
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.airborneSelectionNext = 'tab'
      })
    },
  },
})

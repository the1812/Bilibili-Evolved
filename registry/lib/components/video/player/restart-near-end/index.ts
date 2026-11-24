import { defineComponentMetadata } from '@/components/define'
import { playerUrls } from '@/core/utils/urls'
import { addData } from '@/plugins/data'
import { KeyBindingAction } from '../../../utils/keymap/bindings'
import {
  isComponentEnabled,
  runPrimaryControlAction,
  startRestartNearEnd,
  stopRestartNearEnd,
} from './entry'
import { options } from './options'

export const component = defineComponentMetadata({
  name: 'restartNearEnd',
  displayName: '近结尾自动重头',
  author: [
    {
      name: 'Qiscard',
      link: 'https://github.com/Qiscard',
    },
  ],
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  options,
  instantStyles: [
    {
      name: 'restart-near-end-toast',
      style: () => import('./toast-ui.scss'),
      important: true,
    },
  ],
  entry: async ({ settings }) => {
    await startRestartNearEnd(settings)
  },
  reload: () => {
    startRestartNearEnd().then(none)
  },
  unload: () => stopRestartNearEnd(),
  plugin: {
    displayName: '近结尾自动重头 - 快捷键支持',
    setup: () => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.restartNearEndControl = {
          displayName: '近结尾重头 / 还原进度',
          // 未启用时返回 false, 不拦截按键, 以免吞掉浏览器刷新
          run: () => {
            if (!isComponentEnabled()) {
              return false
            }
            runPrimaryControlAction().then(none)
            return true
          },
        }
      })
      // 默认 Ctrl+R; 可在「快捷键扩展」组件中修改
      // 注意: 部分浏览器会优先处理刷新, 若冲突请改键
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.restartNearEndControl = 'ctrl r'
      })
    },
  },
})

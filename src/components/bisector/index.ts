import { defineComponentMetadata } from '@/components/define'
import { bisectorOptionsMetadata } from './options'
import { LifeCycleEventTypes } from '@/core/life-cycle'
import { componentsTags } from '@/components/types'
import { useScopedConsole } from '@/core/utils/log'
import type { LaunchBarActionProvider } from '../launch-bar/launch-bar-action'

export const component = defineComponentMetadata({
  name: 'bisector',
  displayName: '组件二等分',
  tags: [componentsTags.general, componentsTags.utils],
  hidden: true,
  configurable: false,
  entry: async ({ settings: { options } }) => {
    const bisector = await import('./api')
    bisector.setOptions(options)
    bisector.setConsole(useScopedConsole('组件二等分'))
    unsafeWindow.addEventListener(LifeCycleEventTypes.ComponentsLoaded, () => {
      if (bisector.isRecover()) {
        bisector.recover()
      }
    })
  },
  options: bisectorOptionsMetadata,
  plugin: {
    displayName: '组件二等分 - 功能扩展',
    setup: ({ addData }) => {
      addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
        providers.push({
          name: 'bisector-start',
          getActions: async () => [
            {
              name: '开始 / 继续组件二等分',
              description: 'Start / Continue component bisection',
              icon: 'mdi-view-split-horizontal',
              action: async () => {
                const bisector = await import('./api')
                await bisector.start()
              },
            },
          ],
        })
      })
    },
  },
})

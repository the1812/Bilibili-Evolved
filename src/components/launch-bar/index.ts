import { defineComponentMetadata } from '@/components/define'
import { registerData } from '@/plugins/data'
import { componentsTags } from '../types'

export const component = defineComponentMetadata({
  name: 'launchBar',
  displayName: '搜索栏',
  configurable: false,
  entry: () => {
    registerData('launchBar.toggle', async () => {
      const { toggleLaunchBar } = await import('./toggle')
      toggleLaunchBar()
    })
  },
  hidden: true,
  tags: [componentsTags.general, componentsTags.utils],
})

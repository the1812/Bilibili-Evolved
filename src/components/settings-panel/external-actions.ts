import { addData } from '@/plugins/data'
import { LaunchBarActionProvider, LaunchBarActionProviders } from '../launch-bar/launch-bar-action'

export const provideActions = () => {
  addData(LaunchBarActionProviders, (providers: LaunchBarActionProvider[]) => {
    const onlineRegistryActionName = 'onlineRegistry'
    providers.push({
      name: onlineRegistryActionName,
      getActions: async () => [
        {
          name: '切换在线仓库',
          description: 'Toggle Online Registry',
          icon: 'mdi-web',
          action: async () => {
            const { togglePopup } = await import('./sub-pages/online-registry/vm')
            togglePopup()
          },
        },
      ],
    })
  })
}

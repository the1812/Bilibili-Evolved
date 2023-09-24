import { addData } from '@/plugins/data'
import {
  LaunchBarAction,
  LaunchBarActionProvider,
  LaunchBarActionProviders,
} from '../launch-bar/launch-bar-action'
import { aboutPageActions } from './sub-pages/about-page'

export const provideActions = () => {
  addData(LaunchBarActionProviders, (providers: LaunchBarActionProvider[]) => {
    const onlineRegistryActionName = 'onlineRegistry'
    providers.push(
      {
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
      },
      {
        name: 'aboutPageActionsProvider',
        getActions: async () => {
          return aboutPageActions
            .map((action): LaunchBarAction => {
              if (action.actionName) {
                return {
                  name: action.name,
                  displayName: action.displayName,
                  icon: action.icon,
                  description: action.actionName,
                  action: () => action.run(),
                }
              }
              return null
            })
            .filter(it => it !== null)
        },
      },
    )
  })
}

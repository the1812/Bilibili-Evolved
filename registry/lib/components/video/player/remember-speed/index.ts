import { importComponent } from '@/components/component'
import { ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'
import { KeyBindingAction, KeyBindingActionContext } from 'registry/lib/components/utils/keymap/bindings'
import type { createController } from './controller'

const componentName = 'rememberVideoSpeed'

type Controller = ReturnType<typeof createController>

export const component: ComponentMetadata = {
  name: componentName,
  displayName: '倍速增强',
  author: {
    name: 'JLoeve',
    link: 'https://github.com/LonelySteve',
  },
  description: {
    'zh-CN': '可以记忆上次选择的视频播放速度, 还可以使用更多倍速来扩展原生倍速菜单.',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  entry: async () => (await import('./controller')).createController(),
  plugin: {
    displayName: '倍速增强 - 快捷键支持',
    setup: async ({ addData }) => {
      const { getComponentSettings } = await import('@/core/settings')

      const videoSpeed = async (
        context: KeyBindingActionContext,
        controllerAction: (
          controller: Controller, rates: number[]
        ) => void,
      ) => {
        // 不要提前导入，插件在组件加载之前进行加载，因此如果提前加载会取不到 entry 调用后返回的对象
        const controller = importComponent(componentName) as Controller
        controllerAction(controller, controller.getSupportedRates())
        context.showTip(`${controller.videoSpeed()}x`, 'mdi-fast-forward')
      }

      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.videoSpeedIncrease = {
          displayName: '提高倍速',
          run: context => {
            videoSpeed(context, (controller, rates) => {
              controller.setVideoSpeed(
                rates.find(it => it > controller.videoSpeed())
                || rates[rates.length - 1],
              )
            })
            return true
          },
        }
        actions.videoSpeedDecrease = {
          displayName: '降低倍速',
          run: context => {
            videoSpeed(context, (controller, rates) => {
              controller.setVideoSpeed(
                [...rates].reverse().find(it => it < controller.videoSpeed())
                || rates[0],
              )
            })
            return true
          },
        }
        actions.videoSpeedReset = {
          displayName: '重置倍速',
          run: context => {
            videoSpeed(context, controller => {
              controller.toggleVideoSpeed()
            })
            return true
          },
        }
        if (getComponentSettings('rememberVideoSpeed').options.individualRemember) {
          actions.videoSpeedForget = {
            displayName: '清除当前倍速记忆',
            run: context => {
              videoSpeed(context, controller => {
                controller.resetVideoSpeed(true)
              })
              return true
            },
          }
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.videoSpeedIncrease = 'shift > 》 arrowUp'
        presetBase.videoSpeedDecrease = 'shift < 《 arrowDown'
        presetBase.videoSpeedReset = 'shift ? ？'
        presetBase.videoSpeedForget = 'shift : ：'
      })
    },
  },
  options: {
    speed: {
      displayName: '记忆的速度',
      defaultValue: '1.0',
      hidden: true,
    },
    extend: {
      displayName: '扩展倍速菜单',
      defaultValue: true,
    },
    extendList: {
      displayName: '扩展倍速列表',
      defaultValue: [2.5, 3],
      hidden: true,
    },
    remember: {
      displayName: '启用倍速记忆',
      defaultValue: true,
    },
    individualRemember: {
      displayName: '各视频分别记忆',
      defaultValue: false,
      hidden: true,
    },
    individualRememberList: {
      displayName: '分别记忆倍速列表',
      defaultValue: {},
      hidden: true,
    },
  },
}

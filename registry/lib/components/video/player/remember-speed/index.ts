import { ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'
import { KeyBindingAction, KeyBindingActionContext } from 'registry/lib/components/utils/keymap/bindings'

export const component: ComponentMetadata = {
  name: 'rememberVideoSpeed',
  displayName: '倍速记忆',
  description: {
    'zh-CN': '记忆上次选择的视频播放速度, 还可以使用更多倍速来扩展原生倍速菜单.',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  entry: async () => {
    const { VideoSpeedController } = await import('./controller')
    VideoSpeedController.init()
    return VideoSpeedController
  },
  plugin: {
    displayName: '倍速记忆 - 快捷键支持',
    setup: async ({ addData }) => {
      const { getComponentSettings } = await import('@/core/settings')
      const videoSpeed = async (
        context: KeyBindingActionContext,
        controllerAction: (
          controller: InstanceType<typeof import('./controller')['VideoSpeedController']>, rates: number[]
        ) => void,
      ) => {
        const { VideoSpeedController } = await import('./controller')
        const controller = await VideoSpeedController.getInstance()
        controllerAction(controller, VideoSpeedController.supportedRates)
        context.showTip(`${controller.playbackRate}x`, 'mdi-fast-forward')
      }
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.videoSpeedIncrease = {
          displayName: '提高倍速',
          run: context => {
            videoSpeed(context, (controller, rates) => {
              controller.setVideoSpeed(
                rates.find(it => it > controller.playbackRate)
                || rates[rates.length - 1],
              )
            })
          },
        }
        actions.videoSpeedDecrease = {
          displayName: '降低倍速',
          run: context => {
            videoSpeed(context, (controller, rates) => {
              controller.setVideoSpeed(
                [...rates].reverse().find(it => it < controller.playbackRate)
                || rates[0],
              )
            })
          },
        }
        actions.videoSpeedReset = {
          displayName: '重置倍速',
          run: context => {
            videoSpeed(context, controller => {
              controller.toggleVideoSpeed()
            })
          },
        }
        if (getComponentSettings('rememberVideoSpeed').options.individualRemember) {
          actions.videoSpeedForget = {
            displayName: '清除当前倍速记忆',
            run: context => {
              videoSpeed(context, controller => {
                controller.reset(true)
              })
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

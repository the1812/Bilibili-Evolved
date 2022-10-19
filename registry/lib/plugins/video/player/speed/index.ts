import type {
  KeyBindingAction,
  KeyBindingActionContext,
} from 'registry/lib/components/utils/keymap/bindings'
import { Toast } from '@/core/toast'
import type { PluginMetadata } from '@/plugins/plugin'
import {
  getSpeedContext,
  SpeedContext,
} from '../../../../components/video/player/common/speed/context'
import { formatSpeedText } from '../../../../components/video/player/common/speed/utils'
import type { RememberSpeedComponent } from '../../../../components/video/player/remember-speed/component'
import '../../../../components/video/player/common/speed'

interface CommonKeyBindingAction {
  videoSpeedIncrease: KeyBindingAction
  videoSpeedDecrease: KeyBindingAction
  videoSpeedToggle: KeyBindingAction
}

export const plugin: PluginMetadata = {
  name: 'speed.keymap',
  displayName: '快捷键扩展 - 视频倍速',
  author: {
    name: 'JLoeve',
    link: 'https://github.com/LonelySteve',
  },
  description: `

为操作视频倍速提供快捷键支持：

- 提高倍速
- 降低倍速
- 切换倍速

若添加并启用了记忆倍速组件，则还会增加一个快捷键：

- 清除倍速记忆
  `,
  setup: ({ addData, addHook }) => {
    const videoSpeedAction =
      (cb: (context: SpeedContext) => Promise<unknown> | unknown) =>
      async (context: KeyBindingActionContext) => {
        const speedContext = await getSpeedContext()
        await cb(speedContext)
        context.showTip(formatSpeedText(speedContext.videoElement.playbackRate), 'mdi-fast-forward')
        return true
      }

    // 最基本的支持
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      Object.assign(actions, {
        videoSpeedIncrease: {
          displayName: '提高倍速',
          run: videoSpeedAction(({ increase }) => increase()),
        },
        videoSpeedDecrease: {
          displayName: '降低倍速',
          run: videoSpeedAction(({ decrease }) => decrease()),
        },
        videoSpeedToggle: {
          displayName: '切换倍速',
          run: videoSpeedAction(({ toggle }) => {
            toggle()
          }),
        },
      } as CommonKeyBindingAction)
    })

    addData('keymap.presets', (presetBase: Record<keyof CommonKeyBindingAction, string>) => {
      presetBase.videoSpeedIncrease = 'shift > 》 arrowUp'
      presetBase.videoSpeedDecrease = 'shift < 《 arrowDown'
      presetBase.videoSpeedToggle = 'shift ? ？'
    })

    // NOTE: 不能使用像以前一样使用 importComponent，
    // 因为插件在组件之前加载，我们期望在插件的加载期间加载组件，这在目前是无法做到的，即使我们可以通过 isComponentEnabled 判断倍速相关的组件是否被启用，
    // 但仍然拿不到加载后的实例
    // 解决方法是使用 addHook，这个 API 本质上提供了一种类似事件监听的机制，由于插件在组件之前加载，因此不用担心挂载的钩子不能被组件调用

    // 对记忆倍速的额外支持
    addHook('speed.component.rememberVideoSpeed', {
      after: (component: RememberSpeedComponent) => {
        // 这样设计仍然会出现一个问题，当用户禁用记忆倍速功能后，打开后，如果不刷新页面
        // 即使快捷键扩展里有「清除倍速记忆」的快捷键设置，按下相应的快捷键不会起作用
        // 除了刷新页面之外，理论上还可以通过修改「快捷键扩展」的「预设」和「自定义按键」来正确注册处理程序
        addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
          actions.videoSpeedForget = {
            displayName: '清除倍速记忆',
            run: lodash.debounce(
              videoSpeedAction(async () => {
                if (!component.settings.enabled) {
                  Toast.error(
                    '组件已禁用，不能清除当前视频倍速记忆值',
                    component.metadata.displayName,
                    5000,
                  )
                  return
                }
                if (!component.options.individualRemember) {
                  Toast.error(
                    '选项「各视频分别记忆」已禁用，不能清除当前视频倍速记忆值',
                    component.metadata.displayName,
                    5000,
                  )
                  return
                }
                component.forgetSpeed()
                await component.resetVideoSpeed()
                Toast.success('已清除当前视频倍速记忆值', component.metadata.displayName, 3000)
              }),
              200,
            ),
          }
        })
        addData('keymap.presets', (presetBase: Record<string, string>) => {
          presetBase.videoSpeedForget = 'shift : ：'
        })
      },
    })
  },
}

import { meta } from '@/core/meta'
import { playerUrls } from '@/core/utils/urls'
import { MAX_BROWSER_SPEED_VALUE, MIN_BROWSER_SPEED_VALUE } from '../common/speed'
import { Options, RememberSpeedComponent } from './component'

export const component = RememberSpeedComponent.create<Options>({
  name: 'rememberVideoSpeed',
  displayName: '记忆倍速',
  author: {
    name: 'JLoeve',
    link: 'https://github.com/LonelySteve',
  },
  description: {
    'zh-CN': `

> 提高视频播放器的倍速记忆体验，可实现跨页共享倍速，也可以按视频分别记忆倍速.

#### 🔧 **选项**

- \`全局记忆倍速值\`：默认情况下，这是跨页共享的倍速值，如果启用「各视频分别记忆」，则作为从未独立记忆倍速视频的初始倍速值.
- \`固定全局倍速值\`：默认情况下，全局倍速值将随着用户改变视频倍速而改变，打开此选项后，全局记忆倍速值不再受倍速调整的影响.
- \`各视频分别记忆\`：打开此选项后，将按不同视频分别记忆倍速，对于从未被记忆过倍速的视频，将采用全局记忆倍速值，选项「固定全局倍速值」在此情况下强制生效.
- \`交由 RBVP 决定还原策略\`：打开此选项后，「记忆倍速」不再自行决定何时还原倍速，而是作为 RBVP 的兼容存储层使用；此时 \`固定全局倍速值\` 和 \`各视频分别记忆\` 不再参与自动策略.
- \`弹出还原倍速提示\`：打开此选项后，每次成功还原倍速后都会弹出提示.

#### 🌈 **温馨提示**

「扩展倍速」和倍速相关的快捷键插件已分离为单独的组件或插件.

请根据自身需要：

- 前往「组件」页面安装[「扩展倍速」](${meta.compilationInfo.altCdn.root}registry/dist/components/video/player/extend-speed.js)组件
- 前往「插件」页面安装[「快捷键扩展 - 视频倍速」](${meta.compilationInfo.altCdn.root}registry/dist/plugins/video/player/speed.js)插件.

*如果想要清除当前视频的记忆状态，需要安装「快捷键扩展 - 视频倍速」插件.*
`,
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  options: {
    globalSpeed: {
      displayName: '全局记忆倍速值',
      defaultValue: 1,
      validator: val =>
        lodash.clamp(parseFloat(val), MIN_BROWSER_SPEED_VALUE, MAX_BROWSER_SPEED_VALUE) || 1,
    },
    fixGlobalSpeed: {
      displayName: '固定全局倍速值',
      defaultValue: false,
    },
    individualRemember: {
      displayName: '各视频分别记忆',
      defaultValue: false,
    },
    useRbvp: {
      displayName: '交由 RBVP 决定还原策略',
      defaultValue: false,
      hidden: true,
    },
    individualRememberRecord: {
      displayName: '独立记忆倍速记录',
      defaultValue: {},
      hidden: true,
    },
    showRestoreTip: {
      displayName: '弹出还原倍速提示',
      defaultValue: true,
    },
  },
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
  plugin: {
    displayName: '记忆倍速 - RBVP 兼容',
    setup: async ({ addData }) => {
      const { rememberVideoSpeedNamespaceProvider } = await import('./rbvp-provider')
      addData('rbvp.namespaces', namespaces => {
        delete namespaces.speed
        namespaces.rememberVideoSpeed = rememberVideoSpeedNamespaceProvider
      })
    },
  },
})

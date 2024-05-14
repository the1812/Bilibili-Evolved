import { playerUrls } from '@/core/utils/urls'
import { MAX_BROWSER_SPEED_VALUE, MIN_BROWSER_SPEED_VALUE } from '../common/speed'
import { ExtendSpeedComponent, Options } from './component'

export const component = ExtendSpeedComponent.create<Options>({
  name: 'extendVideoSpeed',
  displayName: '扩展倍速',
  author: {
    name: 'JLoeve',
    link: 'https://github.com/LonelySteve',
  },
  description: {
    'zh-CN': `

> 扩展视频播放器的倍速菜单项，可用于突破原有播放倍数的上限或下限.

#### 🔧 **选项**

- \`隐藏滚动条\`：如果添加的倍速过多，倍速菜单将出现滚动条，在 Windows 下，若没有安装并启用「细滚动条」组件会显得比较挤，建议开启此选项隐藏滚动条.

- \`隐藏移除图标\`：如果认为倍速右侧的移除倍速图标有些突兀，可以开启此选项隐藏.

- \`隐藏新增图标\`：如果认为顶部的新增倍速图标有些突兀，可以开启此选项隐藏.

#### **新增倍速**

开启组件后，在默认情况下，播放器的倍速菜单就会新增 2.5x 和 3.0x 两个倍速选项.

如果需要添加更多倍速，只需将鼠标指针移到菜单顶部的新增图标上，图标将变成一个输入框，根据需要键入新的倍速值，或通过滚轮增减数值，或直接使用推荐的数值，回车确认即可.

新增倍速的范围要求在 ${MIN_BROWSER_SPEED_VALUE} 到 ${MAX_BROWSER_SPEED_VALUE} 之间，数量则不受限制.

**不推荐设置超高倍速（>3.0x）**：原生播放器内部没有针对超高倍速进行优化，可能导致音画不同步、播放卡顿、声音嘈杂/消失等一系列问题.

#### **删除倍速**

将鼠标指针移到**自定义**的倍速菜单项上，其右侧将会显示一个移除图标，单击即可删除相应的倍速.

`,
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  options: {
    maxMenuHeight: {
      displayName: '倍速菜单最大高度',
      defaultValue: 360,
      hidden: true,
      validator: val => Math.max(parseInt(val), 360) || 360,
    },
    hideScrollbar: {
      displayName: '隐藏滚动条',
      defaultValue: false,
    },
    hideRemoveBtn: {
      displayName: '隐藏移除图标',
      defaultValue: false,
    },
    hideAddBtn: {
      displayName: '隐藏新增图标',
      defaultValue: false,
    },
    extendSpeedList: {
      displayName: '扩展倍速列表',
      defaultValue: [2.5, 3],
      hidden: true,
    },
  },
})

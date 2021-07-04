import { toggleStyle } from '@/components/styled-component'
import { ComponentMetadata } from '@/components/types'
import { addComponentListener } from '@/core/settings'

export const component: ComponentMetadata = {
  ...toggleStyle('removePlayerPopup', () => import('./remove-popup.scss'), ({ settings, metadata }) => {
    const { options } = settings
    const { kebabCase } = lodash
    Object.keys(options).forEach(name => {
      addComponentListener(`${metadata.name}.${name}`, (value: boolean) => {
        document.body.classList.toggle(`${kebabCase(metadata.name)}-${kebabCase(name)}`, value)
      }, true)
    })
  }),
  displayName: '删除视频弹窗',
  tags: [componentsTags.video, componentsTags.style],
  description: {
    'zh-CN': '删除视频播放器中出现的各种弹窗, 类别可在选项中分别选择.',
  },
  enabledByDefault: true,
  options: {
    votes: {
      defaultValue: false,
      displayName: '投票',
    },
    relatedVideos: {
      defaultValue: true,
      displayName: '关联视频',
    },
    comboLikes: {
      defaultValue: true,
      displayName: '关注/三连',
    },
  },
}

import { defineComponentMetadata } from '@/components/define'
import { addComponentListener, getComponentSettings } from '@/core/settings'

const componentName = 'hideHeaderBadge'

type HeaderBadgeOptions = {
  hideMessagesBadge: boolean
  hideFeedsBadge: boolean
}

const applyOptions = (options: HeaderBadgeOptions) => {
  const { classList } = document.documentElement
  classList.toggle('be-hide-header-badge--messages', !!options.hideMessagesBadge)
  classList.toggle('be-hide-header-badge--feeds', !!options.hideFeedsBadge)
}

const apply = () => applyOptions(getComponentSettings(componentName).options as HeaderBadgeOptions)

export const component = defineComponentMetadata({
  name: componentName,
  displayName: '屏蔽消息/动态红点',
  author: [{ name: 'TangKuku9', link: 'https://github.com/TangKuku9' }],
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: componentName,
      style: () => import('./hide-header-badge.scss'),
    },
  ],
  options: {
    hideMessagesBadge: {
      displayName: '屏蔽「消息」红点',
      defaultValue: true,
    },
    hideFeedsBadge: {
      displayName: '屏蔽「动态」红点',
      defaultValue: true,
    },
  },
  entry: ({ metadata }) => {
    addComponentListener(`${metadata.name}.hideMessagesBadge`, apply)
    addComponentListener(`${metadata.name}.hideFeedsBadge`, apply)
    apply()
  },
  reload: apply,
  unload: () => {
    document.documentElement.classList.remove(
      'be-hide-header-badge--messages',
      'be-hide-header-badge--feeds',
    )
  },
})

import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'
import { mainSiteUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideCategoryBar',
  displayName: '隐藏分区栏',
  entry: ({ metadata }) => {
    addComponentListener(
      `${metadata.name}.spacing`,
      (value: number) => {
        document.documentElement.style.setProperty('--hide-category-bar-spacing', `${value}px`)
      },
      true,
    )
  },
  instantStyles: [
    {
      name: 'hideCategoryBar',
      style: () => import('./category-bar.scss'),
    },
  ],
  urlInclude: mainSiteUrls,
  options: {
    spacing: {
      displayName: '保留间距 (px)',
      defaultValue: 16,
      validator: getNumberValidator(0, Infinity),
    },
  },
  tags: [componentsTags.style],
  author: {
    name: 'ChiyukiKazama',
    link: 'https://github.com/ChiyukiKazama',
  },
})

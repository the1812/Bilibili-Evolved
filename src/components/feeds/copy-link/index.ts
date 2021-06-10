import { ComponentMetadata, componentsTags } from '@/components/component'
import { feedsUrls } from '../feeds-urls'
import { FeedsCard } from '../api'

const entry = async () => {
  const { forEachFeedsCard } = await import('../api')
  const { dq } = await import('@/core/utils')

  const addCopyLinkButton = (card: FeedsCard) => {
    const morePanel = dq(card.element, '.more-panel') as HTMLElement
    if (!morePanel || dq(morePanel, '.copy-link')) {
      return
    }
    const copyLinkButton = document.createElement('p')
    copyLinkButton.classList.add('child-button', 'c-pointer', 'copy-link')
    copyLinkButton.textContent = '复制链接'
    const vueScopeAttributes = [...new Set(
      [...morePanel.children].map(
        (element: HTMLElement) => element.getAttributeNames().filter(it => it.startsWith('data-v-')),
      ).flat(),
    )]
    vueScopeAttributes.forEach(attr => copyLinkButton.setAttribute(attr, ''))
    copyLinkButton.addEventListener('click', () => {
      GM_setClipboard(`https://t.bilibili.com/${card.id}`, { mimetype: 'text/plain' })
      card.element.click()
    })
    morePanel.appendChild(copyLinkButton)
  }
  forEachFeedsCard({
    added: addCopyLinkButton,
  })
}
export const component: ComponentMetadata = {
  name: 'copyFeedsLink',
  displayName: '复制动态链接',
  description: {
    'zh-CN': '开启后, 可在每条动态的菜单中选择复制链接.',
  },
  enabledByDefault: false,
  entry,
  urlInclude: feedsUrls,
  tags: [
    componentsTags.feeds,
    componentsTags.utils,
  ],
}

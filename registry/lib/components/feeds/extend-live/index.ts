import { defineComponentMetadata } from '@/components/define'
import { styledComponentEntry } from '@/components/styled-component'
import { select } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'

const entry = async () => {
  const console = useScopedConsole('extendFeedsLive')
  const aside = (await select('.bili-dyn-home--member aside.left')) as HTMLElement
  if (!aside) {
    console.error('aside not found')
  }
  let container: HTMLElement
  if (aside.childNodes[aside.childNodes.length - 1].nodeType === Node.COMMENT_NODE) {
    const stickySection = document.createElement('section')
    stickySection.classList.add('sticky')
    aside.appendChild(stickySection)
    container = stickySection
  } else {
    container = (await select(() => dq(aside, 'section.sticky'))) as HTMLElement
  }
  if (!container) {
    console.error('container not found')
  }
  const LiveList = await import('./LiveList.vue').then(m => m.default)
  const liveList = mountVueComponent(LiveList)
  container.appendChild(liveList.$el)
}

export const component = defineComponentMetadata({
  name: 'extendFeedsLive',
  displayName: '直播信息扩充',
  entry: styledComponentEntry(() => import('./extend-feeds-live.scss'), entry),
  tags: [componentsTags.feeds, componentsTags.live],
  urlInclude: [/^https:\/\/t\.bilibili\.com\/$/],
})

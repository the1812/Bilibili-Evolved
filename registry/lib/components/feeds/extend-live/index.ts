import { defineComponentMetadata } from '@/components/define'
import { styledComponentEntry } from '@/components/styled-component'
import { select } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'

const entry = async () => {
  const console = useScopedConsole('extendFeedsLive')
  const container = (await select(
    '.bili-dyn-home--member aside.left section:last-child',
  )) as HTMLElement
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

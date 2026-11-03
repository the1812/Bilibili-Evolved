import { defineComponentMetadata } from '@/components/define'
import { urlChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import { layoutClass, publishingOpenClass } from './constants'

let abortController: AbortController | null = null
let publishButton: Vue | null = null

const isVideoTab = (url: string) => new URL(url).searchParams.get('tab') === 'video'

const entry = async () => {
  const controller = new AbortController()
  abortController = controller
  urlChange(url => document.documentElement.classList.toggle(layoutClass, isVideoTab(url)), {
    signal: controller.signal,
  })

  const sidebar = await select('.bili-dyn-sidebar')
  if (!sidebar || controller.signal.aborted) {
    return
  }
  const PublishButton = await import('./PublishButton.vue')
  if (controller.signal.aborted) {
    return
  }
  publishButton = mountVueComponent(PublishButton)
  sidebar.prepend(publishButton.$el)
}

export const component = defineComponentMetadata({
  name: 'feedsVideoWaterfall',
  displayName: '动态视频瀑布流',
  author: {
    name: 'tianmiao8152',
    link: 'https://github.com/tianmiao8152',
  },
  tags: [componentsTags.feeds, componentsTags.style],
  urlInclude: [/^https:\/\/t\.bilibili\.com\/$/],
  instantStyles: [
    {
      name: 'feedsVideoWaterfall',
      style: () => import('./video-waterfall.scss'),
      important: true,
    },
  ],
  entry,
  reload: entry,
  unload: () => {
    abortController?.abort()
    abortController = null
    publishButton?.$destroy()
    publishButton?.$el.remove()
    publishButton = null
    document.documentElement.classList.remove(layoutClass, publishingOpenClass)
  },
})

import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

const userOpenedClass = 'live-side-bar-user-opened'

const handleUserClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest?.('.side-bar-cntr')) {
    // 用户已主动操作侧栏, 恢复面板显示
    document.documentElement.classList.add(userOpenedClass)
  }
}

const entry = () => {
  document.addEventListener('click', handleUserClick, { capture: true })
}

const unload = () => {
  document.documentElement.classList.remove(userOpenedClass)
  document.removeEventListener('click', handleUserClick, { capture: true })
}

export const component = defineComponentMetadata({
  name: 'collapseLiveSideBar',
  displayName: '自动收起直播侧栏',
  entry,
  reload: entry,
  unload,
  instantStyles: [
    {
      name: 'collapseLiveSideBar',
      style: () => import('./side-bar.scss'),
    },
  ],
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: liveUrls,
})

import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

const popupSelector = '.side-bar-popup-cntr'

let observer: MutationObserver

const handleUserClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest?.('.side-bar-cntr')) {
    observer?.disconnect()
    document.removeEventListener('click', handleUserClick, { capture: true })
  }
}

const stopObserving = () => {
  observer?.disconnect()
  document.removeEventListener('click', handleUserClick, { capture: true })
}

const handleMutations = (mutations: MutationRecord[]) => {
  const popup = mutations
    .map(mutation => mutation.target)
    .find(
      (target): target is HTMLElement =>
        target instanceof HTMLElement &&
        target.matches(popupSelector) &&
        target.style.display !== 'none',
    )
  if (popup) {
    popup.style.display = 'none'
    stopObserving()
  }
}

const entry = () => {
  document.addEventListener('click', handleUserClick, { capture: true })
  observer = new MutationObserver(handleMutations)
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  })

  const popup = dq(popupSelector) as HTMLElement | null
  if (popup && popup.style.display !== 'none') {
    popup.style.display = 'none'
    stopObserving()
  }
}

const unload = () => {
  stopObserving()
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

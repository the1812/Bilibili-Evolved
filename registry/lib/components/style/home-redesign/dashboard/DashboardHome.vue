<template>
  <HomeRedesignBase>
    <div
      class="dashboard-home"
      :class="{ 'hide-watchlater': !watchlaterShow }"
      @click="handleLinkClick"
    >
      <DashboardTabs @open-link="handleOpenLink" />
    </div>
    <LinkPreview ref="linkPreview" />
  </HomeRedesignBase>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { getDashboardHomeOptions, useDashboardOption, type DashboardHomeOptions } from './options'
import LinkPreview from './shared/LinkPreview.vue'
import { getLinkType, type LinkType } from './shared/urls'
import DashboardTabs from './tabs/DashboardTabs.vue'

const watchlaterShow = useDashboardOption('watchlaterShow')
const linkPreview = ref<InstanceType<typeof LinkPreview>>()

const linkOptions: Record<LinkType, keyof DashboardHomeOptions | undefined> = {
  home: undefined,
  live: 'openLiveLinksInPlace',
  dynamic: 'openDynamicLinksInPlace',
  video: 'openVideoLinksInPlace',
  column: 'openColumnLinksInPlace',
  bilibili: 'openBilibiliLinksInPlace',
  external: 'openExternalLinksInPlace',
}

const openInPlace = (href: string) => {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return false
  }
  const type = getLinkType(url)
  if (!type) {
    return false
  }
  const option = linkOptions[type]
  if (!option) {
    return false
  }

  return getDashboardHomeOptions()[option] && linkPreview.value?.show(url, type)
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey

/** 负责 `<a>` 的点击事件 */
const handleLinkClick = (event: MouseEvent) => {
  if (event.defaultPrevented || !isPlainClick(event) || !(event.target instanceof Element)) {
    return
  }
  const anchor = event.target.closest('a[href]')
  if (
    anchor instanceof HTMLAnchorElement &&
    !anchor.hasAttribute('download') &&
    openInPlace(anchor.href)
  ) {
    event.preventDefault()
  }
}

/** 负责组件发出的事件 */
const handleOpenLink = (url: string, event: MouseEvent) => {
  if (event.defaultPrevented) {
    return
  }
  if (!isPlainClick(event) || !openInPlace(url)) {
    window.open(url, '_blank', 'noopener')
    event.preventDefault()
  }
}
</script>

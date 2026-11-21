<template>
  <HomeRedesignBase>
    <div
      class="dashboard-home"
      :class="{ 'is-watchlater-hidden': !showWatchlater }"
      @click="handleLinkClick"
    >
      <DashboardTabs @open-link="handleTabLinkClick" />
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

type LinkPreviewOption = keyof DashboardHomeOptions & `open${string}LinksInPlace`

const linkPreviewOptions: Partial<Record<LinkType, LinkPreviewOption>> = {
  live: 'openLiveLinksInPlace',
  dynamic: 'openDynamicLinksInPlace',
  video: 'openVideoLinksInPlace',
  column: 'openColumnLinksInPlace',
  bilibili: 'openBilibiliLinksInPlace',
  external: 'openExternalLinksInPlace',
}

const showWatchlater = useDashboardOption('watchlaterShow')
const linkPreview = ref<InstanceType<typeof LinkPreview>>()

const tryOpenLinkPreview = (href: string): boolean => {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return false
  }
  const linkType = getLinkType(url)
  const option = linkType && linkPreviewOptions[linkType]
  return Boolean(
    option && getDashboardHomeOptions()[option] && linkPreview.value?.openPreview(url, linkType),
  )
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey

const handleLinkClick = (event: MouseEvent) => {
  if (event.defaultPrevented || !isPlainClick(event) || !(event.target instanceof Element)) {
    return
  }
  const anchor = event.target.closest('a[href]')
  if (
    anchor instanceof HTMLAnchorElement &&
    !anchor.hasAttribute('download') &&
    tryOpenLinkPreview(anchor.href)
  ) {
    event.preventDefault()
  }
}

const handleTabLinkClick = (url: string, event: MouseEvent) => {
  if (event.defaultPrevented) {
    return
  }
  if (!isPlainClick(event) || !tryOpenLinkPreview(url)) {
    window.open(url, '_blank', 'noopener')
    event.preventDefault()
  }
}
</script>

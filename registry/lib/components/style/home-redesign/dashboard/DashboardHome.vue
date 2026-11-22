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
import { dashboardLinkPreviewOptions, getDashboardHomeOptions, useDashboardOption } from './options'
import LinkPreview from './link-preview/LinkPreview.vue'
import { getLinkType } from './shared/urls'
import DashboardTabs from './tabs/DashboardTabs.vue'

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
  const option = linkType && dashboardLinkPreviewOptions[linkType]
  return Boolean(option && getDashboardHomeOptions()[option] && linkPreview.value?.openPreview(url))
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

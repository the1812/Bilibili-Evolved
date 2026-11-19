<template>
  <HomeRedesignBase>
    <div
      class="dashboard-home"
      :class="{ 'hide-watchlater': !watchlaterShow }"
      @click="handleLinkClick"
    >
      <DashboardTabs @open-link="openTabLink" />
    </div>
    <LinkPreview ref="linkPreview" />
  </HomeRedesignBase>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { getDashboardHomeOptions, useDashboardOption } from './options'
import LinkPreview from './shared/LinkPreview.vue'
import DashboardTabs from './tabs/DashboardTabs.vue'

const watchlaterShow = useDashboardOption('watchlaterShow')
const linkPreview = ref<InstanceType<typeof LinkPreview>>()

const getLinkOption = ({ hostname, pathname, searchParams }: URL) => {
  if (hostname === 't.bilibili.com') {
    return 'openDynamicLinksInPlace'
  }
  if (hostname === 'www.bilibili.com' || hostname === 'bilibili.com') {
    if (pathname === '/read' || pathname.startsWith('/read/')) {
      return 'openArticleLinksInPlace'
    }
    if (pathname.startsWith('/opus/')) {
      return 'openDynamicLinksInPlace'
    }
    if (
      pathname.startsWith('/video/') ||
      pathname.startsWith('/bangumi/play/') ||
      pathname.startsWith('/medialist/play/') ||
      (pathname === '/list/watchlater' && searchParams.has('bvid'))
    ) {
      return 'openVideoLinksInPlace'
    }
  }
  if (hostname === 'player.bilibili.com') {
    return 'openVideoLinksInPlace'
  }
  return 'openOtherLinksInPlace'
}

const openInPlace = (href: string) => {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return false
  }
  if (
    url.origin === location.origin &&
    url.pathname === location.pathname &&
    (!url.search || url.search === location.search)
  ) {
    return false
  }
  const option = getLinkOption(url)
  const reading = option === 'openDynamicLinksInPlace' || option === 'openArticleLinksInPlace'
  return getDashboardHomeOptions()[option] && linkPreview.value?.show(url, reading)
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey

const handleLinkClick = (event: MouseEvent) => {
  if (event.defaultPrevented || !isPlainClick(event) || !(event.target instanceof Element)) {
    return
  }
  const link = event.target.closest('a[href]')
  if (
    link instanceof HTMLAnchorElement &&
    !link.hasAttribute('download') &&
    openInPlace(link.href)
  ) {
    event.preventDefault()
  }
}

const openTabLink = (url: string, event: MouseEvent) => {
  if (!isPlainClick(event) || !openInPlace(url)) {
    window.open(url, '_blank', 'noopener')
  }
}
</script>

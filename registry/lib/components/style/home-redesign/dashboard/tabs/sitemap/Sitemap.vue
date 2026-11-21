<template>
  <nav class="dashboard-home-sitemap" aria-label="哔哩哔哩站点地图">
    <section
      v-for="{ id, title, links } in sections"
      :key="id"
      class="dashboard-home-sitemap-section"
      :class="{ 'is-wide': id === 'channels' }"
    >
      <h2>{{ title }}</h2>
      <SitemapLinkList :links="links" />
    </section>
  </nav>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { mutationObserve } from '@/core/observer'
import { getUID } from '@/core/utils'
import SitemapLinkList from './SitemapLinkList.vue'
import {
  getSitemapSections,
  readSitemapChannelLinks,
  sitemapChannelSelector,
} from './sitemap-links'

const uid = getUID()
const channelLinks = shallowRef(readSitemapChannelLinks(document))
let headerObserver: MutationObserver | undefined
const sections = computed(() => getSitemapSections(uid, channelLinks.value))

const updateChannelLinks = () => {
  const nextLinks = readSitemapChannelLinks(document)
  if (!lodash.isEqual(channelLinks.value, nextLinks)) {
    channelLinks.value = nextLinks
  }
}

onMounted(() => {
  updateChannelLinks()
  const channelBar = document.querySelector(sitemapChannelSelector)
  const channelContainer =
    channelBar?.closest('.bili-header') ??
    channelBar?.parentElement ??
    document.querySelector('.bili-header') ??
    document.querySelector('#i_cecream') ??
    document.body
  const [observer] = mutationObserve(
    [channelContainer],
    { childList: true, subtree: true, characterData: true, attributeFilter: ['class', 'href'] },
    updateChannelLinks,
  )
  headerObserver = observer
})
onBeforeUnmount(() => headerObserver?.disconnect())
</script>

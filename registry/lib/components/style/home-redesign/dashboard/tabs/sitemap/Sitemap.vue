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
const sections = computed(() => getSitemapSections(uid, channelLinks.value))

const updateChannels = () => {
  const links = readSitemapChannelLinks(document)
  if (!lodash.isEqual(channelLinks.value, links)) {
    channelLinks.value = links
  }
}

let headerObserver: MutationObserver
onMounted(() => {
  updateChannels()
  const channelBar = document.querySelector(sitemapChannelSelector)
  const header =
    channelBar?.closest('.bili-header') ??
    channelBar?.parentElement ??
    document.querySelector('.bili-header') ??
    document.querySelector('#i_cecream') ??
    document.body
  const [observer] = mutationObserve(
    [header],
    { childList: true, subtree: true, characterData: true, attributeFilter: ['class', 'href'] },
    updateChannels,
  )
  headerObserver = observer
})
onBeforeUnmount(() => headerObserver?.disconnect())
</script>

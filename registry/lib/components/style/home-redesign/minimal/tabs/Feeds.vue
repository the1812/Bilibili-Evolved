<template>
  <div class="minimal-home-tab" :class="{ loading, loaded, error }">
    <div class="minimal-home-tab-cards">
      <VideoCard v-for="c of cards" :key="c.id" :data="c" />
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <ScrollTrigger v-if="!error" ref="scrollTrigger" detect-viewport @trigger="loadCards" />
    <MinimalHomeOperations v-if="cards.length > 0" @refresh="refresh" />
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, useTemplateRef } from 'vue'
import { getVideoFeeds } from '@/components/feeds/api'
import type { VideoCard as VideoCardType } from '@/components/feeds/video-card'
import VideoCard from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { ascendingStringSort } from '@/core/utils/sort'
import { ScrollTrigger, VEmpty } from '@/ui'
import type { ScrollTrigger as ScrollTriggerType } from '@/ui'
import MinimalHomeOperations from '../MinimalHomeOperations.vue'

const loading = ref(true)
const cards = ref<VideoCardType[]>([])
const error = ref(false)

const scrollTrigger = useTemplateRef<InstanceType<typeof ScrollTriggerType>>('scrollTrigger')

const loaded = computed(() => !loading.value && !error.value)

const lastID = computed(() => {
  if (!cards.value.length) {
    return null
  }
  const sorted = [...cards.value].sort(ascendingStringSort(c => c.id))
  return sorted[0].id
})

const loadCards = async () => {
  try {
    error.value = false
    loading.value = true
    scrollTrigger.value.setLoadState('loading')
    const newCards = await getVideoFeeds('video', lastID.value)
    cards.value = lodash.uniqBy([...cards.value, ...newCards], it => it.id)
  } catch (e) {
    logError(e)
    error.value = true
    scrollTrigger.value.setLoadState('error')
  } finally {
    loading.value = false
    if (loaded.value) {
      scrollTrigger.value.setLoadState('loaded')
    }
  }
}

const refresh = async () => {
  cards.value = []
  scrollTrigger.value.resetIsFirstLoad()
}
</script>

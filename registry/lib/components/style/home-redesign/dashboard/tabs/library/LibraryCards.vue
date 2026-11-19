<template>
  <ul v-if="entries.length" class="dashboard-home-library-list" role="list">
    <li v-for="item in entries" :key="item.id" class="dashboard-home-library-card">
      <component
        :is="item.url ? 'a' : 'div'"
        class="dashboard-home-library-media"
        :href="item.url"
        :target="item.url ? '_blank' : undefined"
        :rel="item.url ? 'noopener' : undefined"
      >
        <div class="dashboard-home-library-cover">
          <DpiImage
            v-if="item.cover"
            :src="item.cover"
            :size="{ width: 320, height: 180 }"
            loading="lazy"
            alt=""
          />
          <VIcon v-else icon="mdi-play-box-multiple-outline" :size="28" aria-hidden="true" />
          <span v-if="item.badge" class="dashboard-home-library-badge">{{ item.badge }}</span>
          <progress
            v-if="item.progress !== undefined"
            :value="item.progress"
            max="1"
            aria-label="观看进度"
          />
        </div>
        <div class="dashboard-home-library-info">
          <strong>{{ item.title }}</strong>
          <span v-if="item.detail">{{ item.detail }}</span>
        </div>
      </component>
      <div v-if="$scopedSlots.actions" class="dashboard-home-library-card-actions">
        <slot name="actions" :item="item" />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { DpiImage, VIcon } from '@/ui'
import type { LibraryEntry } from './library'

defineProps<{ entries: LibraryEntry[] }>()
</script>

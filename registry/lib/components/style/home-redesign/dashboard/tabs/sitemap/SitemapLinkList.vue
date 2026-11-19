<template>
  <ul class="dashboard-home-sitemap-links" role="list">
    <li v-for="[label, href, icon, subcategories] in links" :key="subcategories?.id ?? href">
      <div class="dashboard-home-sitemap-tile">
        <a class="dashboard-home-sitemap-link" :href="href" target="_blank" rel="noopener">
          <VIcon class="dashboard-home-sitemap-icon" :icon="icon" :size="18" aria-hidden="true" />
          <span>{{ label }}</span>
        </a>
        <button
          v-if="subcategories"
          type="button"
          class="dashboard-home-sitemap-toggle"
          :aria-label="`${label}子分区`"
          :aria-controls="subcategories.id"
          :aria-expanded="expandedGroups.has(subcategories.id) ? 'true' : 'false'"
          @click="toggleGroup(subcategories.id)"
        >
          <VIcon
            class="dashboard-home-sitemap-icon"
            icon="mdi-chevron-down"
            :size="16"
            aria-hidden="true"
          />
        </button>
      </div>
      <ul
        v-if="subcategories"
        v-show="expandedGroups.has(subcategories.id)"
        :id="subcategories.id"
        class="dashboard-home-sitemap-sublinks"
        role="list"
      >
        <li v-for="[subLabel, subHref, subIcon] in subcategories.links" :key="subHref">
          <a class="dashboard-home-sitemap-link" :href="subHref" target="_blank" rel="noopener">
            <VIcon
              class="dashboard-home-sitemap-icon"
              :icon="subIcon"
              :size="16"
              aria-hidden="true"
            />
            <span>{{ subLabel }}</span>
          </a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { VIcon } from '@/ui'
import type { SitemapLink } from './sitemap-links'

defineProps<{ links: SitemapLink[] }>()

const expandedGroups = shallowRef(new Set<string>())

const toggleGroup = (id: string) => {
  const next = new Set(expandedGroups.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedGroups.value = next
}
</script>

<template>
  <div class="dashboard-home-feed-day">
    <time v-if="label" class="dashboard-home-feed-date" :datetime="date" :title="date">
      {{ label }}
    </time>
    <ul class="dashboard-home-card-grid" role="list">
      <slot />
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{ date: string; label: string }>()
</script>

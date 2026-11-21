<template>
  <div class="dashboard-home-card-date-group">
    <time v-if="label" class="dashboard-home-card-date" :datetime="date" :title="date">
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

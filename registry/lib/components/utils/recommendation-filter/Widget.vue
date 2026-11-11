<template>
  <DefaultWidget name="推荐过滤设置" icon="mdi-filter-outline" @click="openManager()" />
</template>
<script setup lang="ts">
import { DefaultWidget } from '@/ui'
import { openManager } from './manager'
</script>

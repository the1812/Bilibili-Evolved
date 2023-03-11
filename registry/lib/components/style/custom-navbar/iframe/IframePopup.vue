<script setup lang="ts">
import type { NavbarIframeConfig } from './iframe'
import type { CustomNavbarItem } from '../custom-navbar-item'
import { usePopup } from '../mixins'

const props = defineProps<{
  item: CustomNavbarItem & NavbarIframeConfig
  container: HTMLElement
}>()

const { el } = usePopup(props)
</script>

<template>
  <iframe
    ref="el"
    :src="item.src"
    frameborder="0"
    :width="item.width"
    :height="item.height"
  ></iframe>
</template>

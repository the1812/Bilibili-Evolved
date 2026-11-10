<template>
  <div class="component-description" v-html="html"></div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { getDescriptionHTML } from '../description'
import type { FeatureBase } from '../types'

const props = defineProps<{ componentData: Pick<FeatureBase, 'description'> }>()
const html = ref('')
onBeforeMount(async () => {
  html.value = await getDescriptionHTML(props.componentData)
})
</script>

<style lang="scss">
@import 'markdown';

.component-description {
  word-break: break-all;
  @include markdown();
}
</style>

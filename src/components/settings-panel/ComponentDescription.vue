<template>
  <div class="component-description">
    <FeatureAuthors :author="componentData.author" />
    <div class="component-description-markdown" v-html="html"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { getDescriptionHTML } from '../description'
import type { FeatureBase } from '../types'
import FeatureAuthors from './FeatureAuthors.vue'

const props = defineProps<{ componentData: Pick<FeatureBase, 'author' | 'description'> }>()
const html = ref('')
onBeforeMount(async () => {
  html.value = await getDescriptionHTML(props.componentData)
})
</script>

<style lang="scss">
@import 'common';
@import 'markdown';

.component-description {
  @include v-stretch(6px);
}

.component-description-markdown {
  word-break: break-all;
  @include markdown();
}
</style>

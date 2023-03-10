<template>
  <div class="component-description" v-html="html"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { ComponentMetadata } from '@/components/types'

import { getDescriptionHTML } from '../description'

export default defineComponent({
  props: {
    componentData: {
      type: Object as PropType<ComponentMetadata>,
      required: true,
    },
  },
  data() {
    return {
      html: '',
    }
  },
  watch: {
    'componentData.description': {
      async handler() {
        this.html = await getDescriptionHTML(this.componentData)
      },
      immediate: true,
    },
  },
})
</script>

<style lang="scss">
@import 'common';
@import 'markdown';

.component-description {
  word-break: break-all;
  @include markdown();
}
</style>

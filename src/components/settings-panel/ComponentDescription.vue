<template>
  <div class="component-description" v-html="html"></div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { ComponentMetadata } from '@/components/types'
import { getComponentSettings } from '@/core/settings'

import { getDescriptionHTML } from '../description'

export default Vue.extend({
  props: {
    componentData: {
      type: Object as PropType<ComponentMetadata>,
      required: true,
    },
  },
  data() {
    return {
      settings: getComponentSettings(this.componentData),
      html: '',
    }
  },
  async created() {
    this.html = await getDescriptionHTML(this.componentData)
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

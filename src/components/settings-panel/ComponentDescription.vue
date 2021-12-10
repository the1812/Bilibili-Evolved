<template>
  <div class="component-description" v-html="description(componentData)"></div>
</template>

<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { ComponentMetadata } from '../component'
import { getDescriptionHTML } from '../description'

export default Vue.extend({
  props: {
    componentData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      settings: getComponentSettings(this.componentData),
    }
  },
  methods: {
    description(component: ComponentMetadata) {
      return getDescriptionHTML(component)
    },
  },
})
</script>

<style lang="scss">
@import "common";
@import "markdown";

.component-description {
  word-break: break-all;
  @include markdown();
}
</style>

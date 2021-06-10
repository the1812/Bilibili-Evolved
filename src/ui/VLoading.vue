<template>
  <div class="be-loading">
    <slot>
      <template
        v-if="typeof content === 'string' && content.length > 0"
      >
        {{ content }}
      </template>
      <component :is="content" v-if="typeof content !== 'string'"></component>
    </slot>
  </div>
</template>
<script lang="ts">
import { getLoadingContent } from './v-loading'

export default Vue.extend({
  name: 'VLoading',
  data() {
    return {
      content: '',
    }
  },
  async created() {
    this.content = await getLoadingContent()
  },
})
</script>

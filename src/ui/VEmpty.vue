<template>
  <div class="be-empty">
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
import { getEmptyContent } from './v-empty'

export default Vue.extend({
  name: 'VEmpty',
  data() {
    return {
      content: '',
    }
  },
  async created() {
    this.content = await getEmptyContent()
  },
})
</script>

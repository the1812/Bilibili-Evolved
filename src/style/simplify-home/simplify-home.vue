<template>
  <div class="simplify-home">
    <component :is="activeComponent"></component>
  </div>
</template>
<script lang="ts">
export default {
  components: {
    'minimal-home': () => import('./minimal-home/minimal-home.vue'),
    'simple-home': () => import('./simple-home/simple-home.vue'),
  },
  computed: {
    activeComponent () {
      return this.homeStyle === '清爽' ? 'simple-home' : 'minimal-home'
    }
  },
  props: {
    homeStyle: String,
  },
}
</script>
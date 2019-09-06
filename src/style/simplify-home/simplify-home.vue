<template>
  <div class="simplify-home">
    <component class="simplify-home-component" :is="activeComponent"></component>
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
<style lang="scss">
.simplify-home {
  margin-top: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  --card-width: 700px;
  --card-height: 160px;
  --card-margin: 16px;
  --card-column-count: 1;

  .simplify-home-component {
    max-width: 80%;
  }
}
</style>
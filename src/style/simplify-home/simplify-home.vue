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
  padding-top: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f4f4;

  body.dark & {
    background-color: #181818;
  }
  .simplify-home-component {
    max-width: 100%;
  }
}
html {
  scroll-behavior: smooth;
}
</style>
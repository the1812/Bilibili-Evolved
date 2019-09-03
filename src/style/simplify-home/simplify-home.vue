<template>
  <div class="simplify-home">
    <component :is="activeComponent"></component>
  </div>
</template>
<script lang="ts">
import MinimalHome from './minimal-home.vue'
import SimpleHome from './simple-home.vue'
export default {
  components: {
    'minimal-home': MinimalHome,
    'simple-home': SimpleHome,
  },
  computed: {
    activeComponent () {
      return this.homeStyle === '清爽' ? SimpleHome : MinimalHome
    }
  },
  props: {
    homeStyle: String,
  },
}
</script>
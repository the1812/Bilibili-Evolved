<template>
  <div class="slideshow-cards">*{{cards.length}} cards*</div>
</template>

<script lang="ts">
export default {
  props: ['cards', 'error'],
}
</script>

<style lang="scss">
.slideshow-cards {
  display: flex;
}
</style>
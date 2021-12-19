<template>
  <div class="home-redesign-base">
    <slot />
  </div>
</template>
<script lang="ts">
export default Vue.extend({

})
</script>
<style lang="scss">
@import "common";

body {
  @include v-stretch();
  min-height: 100vh;
}
.home-redesign-base {
  --home-base-color: #fff;
  --home-background-color: #fff;
  --home-color: #000;
  --home-max-width: var(--home-max-width-override, 1440px);
  --home-content-height: 250px;
  --home-card-radius: 12px;
  --home-card-shadow: inset 0 0 0 1px #8882, 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: var(--home-base-color);
  color: var(--home-color);
  font-size: 12px;
  flex-grow: 1;
  line-height: normal;
  @include v-center();

  body.dark & {
    --home-base-color: #181818;
    --home-background-color: #282828;
    --home-color: #eee;
    --home-card-shadow: inset 0 0 0 1px #8882, 0 4px 12px 0 rgba(0, 0, 0, 0.2);
  }
}
html {
  scroll-behavior: smooth;
}
</style>

<template>
  <div class="home-redesign-base">
    <slot />
  </div>
</template>
<script setup lang="ts">
const params = new URLSearchParams(location.search)
if (params.has('bvid')) {
  const restParams = new URLSearchParams([...params.entries()].filter(([name]) => name !== 'bvid'))
  location.replace(
    `/video/${params.get('bvid')}${restParams.size > 0 ? `?${restParams.toString()}` : ''}`,
  )
}
</script>
<style lang="scss">
@import 'common';

html {
  scroll-behavior: smooth;
  min-height: 100vh;
}
body {
  @include v-stretch();
  min-height: 100vh;
}
#i_cecream {
  width: 100%;
}
.home-redesign-base {
  --home-base-color: #fff;
  --home-background-color: #fff;
  --home-color: #000;
  --home-max-width: var(--home-max-width-override, 1440px);
  --home-content-height: 250px;
  --home-card-radius: 12px;
  --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  --home-card-border: 1px solid #8882;
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
    --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);
  }
  body.home-redesign-off & {
    display: none;
  }
}
</style>

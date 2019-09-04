<template>
  <div class="minimal-home">
    <Logo class="logo"></Logo>
    I'm MinimalHome component!
  </div>
</template>
<script lang="ts">
// https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=39717974&type_list=8
// https://api.bilibili.com/x/web-interface/ranking/index?day=1
export default {
  components: {
    Logo: () => import('../logo.vue')
  }
}
</script>
<style lang="scss">
.minimal-home {

  .logo {
    font-size: 48px;
  }
}
</style>
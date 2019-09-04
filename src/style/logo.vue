<template>
  <div class="bilibili-logo bilibili-logo-icon"></div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
@font-face {
  font-family: "bilibili-logo-iconfont";
  src: url("//s1.hdslb.com/bfs/seed/jinkela/header/asserts/iconfont.ttf") format("truetype");
}
.bilibili-logo {
  color: var(--theme-color);
  font-family: "bilibili-logo-iconfont" !important;
  font-size: 24px;
  font-style: normal;
  &::before {
    content: "\E725";
  }
}
</style>
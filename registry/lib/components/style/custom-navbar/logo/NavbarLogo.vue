<template>
  <VIcon icon="logo" class="custom-navbar-logo"></VIcon>
</template>

<script lang="ts">
// import { addComponentListener } from '@/core/settings'
// import { getJson } from '@/core/ajax'
import { VIcon } from '@/ui'

export default Vue.extend({
  name: 'NavbarLogo',
  components: {
    VIcon,
  },
  // data() {
  //   return {
  //     seasonLogoUrl: '',
  //   }
  // },
  // async created() {
  //   addComponentListener(
  //     'customNavbar.seasonLogo',
  //     async (value: boolean) => {
  //       if (!value) {
  //         this.seasonLogoUrl = ''
  //         return
  //       }
  //       const json = await getJson(
  //         'https://api.bilibili.com/x/web-show/res/locs?pf=0&ids=142',
  //       )
  //       if (json.code !== 0) {
  //         this.seasonLogoUrl = ''
  //         return
  //       }
  //       this.seasonLogoUrl = lodash.get(json, 'data[142][0].litpic', '').replace(
  //         'http:',
  //         'https:',
  //       )
  //     },
  //     true,
  //   )
  // },
})
</script>

<style lang="scss" scoped>
.custom-navbar-logo {
  width: auto;
  margin: 0 4px;
  .custom-navbar:not(.fill) & {
    &:not(.season) {
      color: var(--theme-color);
    }
  }
  &.season {
    transform: scale(1.15);
  }
}
</style>

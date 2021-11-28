<template>
  <VIcon v-if="!seasonLogoUrl" icon="logo" class="custom-navbar-logo"></VIcon>
  <img
    v-else
    height="38"
    class="custom-navbar-logo season"
    :src="seasonLogoUrl"
  />
</template>

<script lang="ts">
import { addComponentListener } from '@/core/settings'
import { getJson } from '@/core/ajax'
import { VIcon } from '@/ui'

export default Vue.extend({
  name: 'NavbarLogo',
  components: {
    VIcon,
  },
  data() {
    return {
      seasonLogoUrl: '',
    }
  },
  watch: {
    seasonLogoUrl() {
      document.body.classList.toggle('season-logo-enabled', Boolean(this.seasonLogoUrl))
    },
  },
  async created() {
    addComponentListener(
      'customNavbar.seasonLogo',
      async (value: boolean) => {
        if (!value) {
          this.seasonLogoUrl = ''
          return
        }
        const json = await getJson(
          'https://api.bilibili.com/x/web-show/page/header?resource_id=1',
        )
        if (json.code !== 0) {
          this.seasonLogoUrl = ''
          return
        }
        this.seasonLogoUrl = lodash.get(json, 'data.litpic', '').replace(
          'http:',
          'https:',
        )
      },
      true,
    )
  },
})
</script>

<style lang="scss">
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
    filter: drop-shadow(0 0 2px #0002);
  }
}
body.season-logo-enabled {
  .bili-header .inner-logo {
    display: none !important;
  }
}
</style>

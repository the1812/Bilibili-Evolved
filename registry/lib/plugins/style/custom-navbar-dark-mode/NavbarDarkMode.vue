<template>
  <div class="navbar-dark-mode" :title="dark ? '关闭夜间模式' : '开启夜间模式'">
    <svg
      v-if="dark"
      style="width: 18px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 47.96 47.96"
    >
      <path d="M24,12A12,12,0,1,0,36,24,12,12,0,0,0,24,12Zm0,20a8,8,0,1,1,8-8A8,8,0,0,1,24,32Z" />
      <path d="M24,9a2,2,0,0,0,2-2V4a2,2,0,0,0-4,0V7A2,2,0,0,0,24,9Z" />
      <path
        d="M36,14a2,2,0,0,0,1.42-.59l2.12-2.12a2,2,0,1,0-2.83-2.83l-2.12,2.12A2,2,0,0,0,36,14Z"
      />
      <path d="M44,22H41a2,2,0,0,0,0,4h3a2,2,0,1,0,0-4Z" />
      <path d="M37.4,34.61a2,2,0,1,0-2.83,2.82l2.12,2.13a2,2,0,0,0,2.83-2.83Z" />
      <path d="M24,39a2,2,0,0,0-2,2v3a2,2,0,0,0,4,0V41A2,2,0,0,0,24,39Z" />
      <path
        d="M10.53,34.61,8.41,36.73a2,2,0,0,0,0,2.83,2,2,0,0,0,2.82,0l2.13-2.13a2,2,0,1,0-2.83-2.82Z"
      />
      <path d="M9,24a2,2,0,0,0-2-2H4a2,2,0,0,0,0,4H7A2,2,0,0,0,9,24Z" />
      <path
        d="M10.53,13.39a2,2,0,0,0,1.41.59,2,2,0,0,0,1.42-3.42L11.23,8.44a2,2,0,0,0-2.82,2.83Z"
      />
    </svg>
    <svg v-else style="width: 18px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path
        d="M24.48,42.18A18.66,18.66,0,0,1,22.11,5,2,2,0,0,1,23.56,8.6,11.32,11.32,0,1,0,39.4,24.44,2,2,0,0,1,43,25.89,18.68,18.68,0,0,1,24.48,42.18ZM16.36,11.32A14.66,14.66,0,1,0,36.68,31.64,15.35,15.35,0,0,1,15,17.68,15.2,15.2,0,0,1,16.36,11.32Z"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { getComponentSettings, addComponentListener } from '@/core/settings'

export default Vue.extend({
  data() {
    return {
      dark: getComponentSettings('darkMode').enabled,
    }
  },
  created() {
    addComponentListener('darkMode', (value: boolean) => {
      this.dark = value
    })
  },
})
</script>
<style lang="scss">
.navbar-dark-mode {
  display: flex;
  svg {
    height: 18px;
    width: 18px;
    fill: currentColor;
  }
}
</style>

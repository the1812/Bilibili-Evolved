<template>
  <div class="show-area-info" :style="{ color: mainColor }">
    <a
      :href="`https://live.bilibili.com/p/eden/area-tags?parentAreaId=${areaInfo.parent_area_id}`"
      target="_blank"
      >{{ areaInfo.parent_area_name || '父分区' }}</a
    >
    <span class="sep">-</span>
    <a
      :href="`https://live.bilibili.com/p/eden/area-tags?parentAreaId=${areaInfo.parent_area_id}&areaId=${areaInfo.area_id}`"
      target="_blank"
      >{{ areaInfo.area_name || '子分区' }}</a
    >
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  props: {
    areaInfo: {
      type: Object as () => {
        area_id: number
        area_name: string
        parent_area_id: number
        parent_area_name: string
      },
      required: true,
    },
  },
  data() {
    return {
      mainColor: 'rgba(255,255,255,1)',
    }
  },
  mounted() {
    const colorSelector1 = '.live-skin-coloration-area .live-skin-normal-a-text'
    const colorSelector2 = '.left-anchor-section .room-owner-username'
    const el1 = document.querySelector(colorSelector1) as HTMLElement | null
    if (el1) {
      this.mainColor = getComputedStyle(el1).color
    } else {
      const el2 = document.querySelector(colorSelector2) as HTMLElement | null
      if (el2) {
        this.mainColor = getComputedStyle(el2).color
      }
    }
  },
})
</script>

<style lang="scss" scoped>
.show-area-info {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  font-size: 14px;
  white-space: nowrap;
  gap: 6px;
}
.show-area-info a {
  color: inherit;
  text-decoration: none;
}
.show-area-info a:hover {
  color: #f69;
}
</style>

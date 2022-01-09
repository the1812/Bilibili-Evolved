<template>
  <div
    class="fresh-home-categories-default scroll-top scroll-bottom"
    :class="{ 'not-empty': videos.length > 0 }"
  >
    <div class="fresh-home-categories-default-mask left"></div>
    <div ref="content" class="fresh-home-categories-default-content">
      <div v-if="videos.length === 0" class="fresh-home-categories-default-empty">
        <VLoading v-if="loading" />
        <VEmpty v-else />
      </div>
      <div
        v-for="video of videos"
        v-else
        :key="video.id"
      >
        {{ video.aid }}
      </div>
    </div>
    <div class="fresh-home-categories-default-mask right"></div>
  </div>
</template>
<script lang="ts">
export default Vue.extend({
  props: {
    regionCode: {
      type: Number,
      required: true,
    },
  },
})
</script>
<style lang="scss">

</style>

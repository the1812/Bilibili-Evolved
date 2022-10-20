<template>
  <a class="bangumi-card" :class="{ new: isNew }" target="_blank" :href="data.url">
    <div class="ep-cover-container">
      <DpiImage class="ep-cover" :size="{ width: 100 }" :src="data.epCoverUrl"></DpiImage>
    </div>
    <h1 class="ep-title" :title="data.epTitle">{{ data.epTitle }}</h1>
    <div class="up" :title="data.title">
      <DpiImage class="cover" :size="24" :src="data.coverUrl"></DpiImage>
      <div class="title">{{ data.title }}</div>
    </div>
  </a>
</template>
<script lang="ts">
import { DpiImage } from '@/ui'

export default Vue.extend({
  components: {
    DpiImage,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
  },
})
</script>
<style lang="scss" scoped>
@import 'common';

.bangumi-card {
  --cover-width: 94px;
  background-color: #fff;
  margin: 0 8px 8px 8px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  border: 1px solid #8882;
  $radius: 8px;
  border-radius: $radius;
  display: grid;
  grid-template-areas: 'cover epTitle' 'cover title';
  grid-template-columns: var(--cover-width) 1fr;
  grid-template-rows: 6fr 5fr;
  position: relative;
  flex-shrink: 0;
  .up {
    grid-area: title;
    display: flex;
    align-items: center;
    padding: 0 12px;
    align-self: center;
    overflow: hidden;
    margin-bottom: 4px;
    .cover {
      height: 18px;
      width: 18px;
      border-radius: 50%;
    }
    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 6px;
      line-height: normal;
    }
  }
  .ep-title {
    grid-area: epTitle;
    font-size: 11pt;
    @include semi-bold();
    padding: 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    align-self: center;
    color: inherit;
    line-height: normal;
    margin: 4px 0 0 0;
  }
  .ep-cover-container {
    grid-area: cover;
    border-radius: $radius 0 0 $radius;
    overflow: hidden;
    display: flex;
    .ep-cover {
      background-color: #8884;
      width: var(--cover-width);
      min-height: 62.5px;
    }
  }
  &:hover {
    .ep-title {
      color: var(--theme-color);
    }
    .ep-cover {
      transform: scale(1.05);
    }
  }
  body.dark & {
    box-shadow: #0001 0 4px 12px 0px;
    background-color: #2d2d2d;
    color: #eee;
  }
  &.new::before {
    content: 'NEW';
    position: absolute;
    top: 4px;
    left: 4px;
    background-color: var(--theme-color);
    color: var(--foreground-color);
    padding: 0 6px;
    height: 18px;
    border-radius: 9px;
    font-weight: 700;
    font-size: 11px;
    line-height: 18px;
    z-index: 1;
  }
}
</style>

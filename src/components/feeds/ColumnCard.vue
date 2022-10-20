<template>
  <a class="column-card" target="_blank" :href="`https://www.bilibili.com/read/cv${data.cvID}`">
    <div class="covers">
      <DpiImage
        v-for="cover of data.covers"
        :key="cover"
        class="cover"
        :size="{ height: 120 }"
        :src="cover"
      ></DpiImage>
    </div>
    <a class="up" target="_blank" :href="`https://space.bilibili.com/${data.upID}`">
      <DpiImage class="face" :size="24" :src="data.upFaceUrl"></DpiImage>
      <div class="name">{{ data.upName }}</div>
    </a>
    <h1 class="title" :title="data.title">{{ data.title }}</h1>
    <div class="description" :title="data.description">{{ data.description }}</div>
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
.column-card {
  width: 356px;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #8882;
  background-color: #fff;
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  font-size: 12px;
  cursor: pointer;
  $radius: 8px;
  border-radius: $radius;

  body.dark & {
    background-color: #282828;
    color: #eee;
  }
  .covers {
    position: relative;
    display: flex;
    overflow: hidden;
    border-radius: $radius $radius 0 0;
    .cover {
      flex: 1 0 0;
      height: 120px;
      width: 0;
      object-fit: cover;
    }
  }
  .up {
    position: absolute;
    left: 8px;
    top: calc(120px - 28px - 6px);
    padding: 2px;
    display: flex;
    align-items: center;
    background-color: #000a;
    border-radius: 14px;
    height: 28px;
    box-sizing: border-box;
    .face {
      border-radius: 50%;
      height: 24px;
      width: 24px;
    }
    .name {
      margin: 0 6px;
      color: #fff;
    }
  }
  .title {
    padding: 10px 10px 0;
    margin: 0;
    font-size: 11pt;
    @include semi-bold();
    color: inherit;
    line-height: normal;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .description {
    margin: 8px 10px;
    @include max-line(2);
  }
  &:hover {
    .title {
      color: var(--theme-color);
    }
    .cover {
      transform: scale(1.05);
    }
  }
}
</style>

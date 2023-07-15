<template>
  <div class="release-content">
    <div class="release-content-markdown" v-html="content" />
    <div class="release-content-actions">
      <VButton @click="$emit('dialog-close')"> 取消 </VButton>
      <a v-if="detailsLink" :href="detailsLink" target="_blank">
        <VButton> 查看详情 </VButton>
      </a>
      <a v-if="updateUrl" :href="updateUrl" target="_blank">
        <VButton type="primary"> 安装 </VButton>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defaultOwner } from '@/core/cdn-types'
import { VButton } from '@/ui'

const detailsLink = `https://github.com/${defaultOwner}/Bilibili-Evolved/releases`
export default Vue.extend({
  components: {
    VButton,
  },
  props: {
    content: {
      type: String,
      default: '',
    },
    updateUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      detailsLink,
    }
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'markdown';

.release-content {
  @include v-stretch(12px);
  padding: 0 16px 16px 16px;
  &-markdown {
    font-size: 14px;
    flex-grow: 1;
    max-height: calc(100vh - 220px);
    overflow: auto;
    @include markdown();
  }
  &-actions {
    @include h-center(6px);
    flex-shrink: 0;
    font-size: 15px;
    justify-content: flex-end;
    .be-button {
      padding: 6px 12px;
    }
  }
}
</style>

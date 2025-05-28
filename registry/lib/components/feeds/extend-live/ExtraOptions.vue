<template>
  <div class="extend-feeds-live-extra-options">
    <div class="extend-feeds-live-extra-option">
      <div class="extend-feeds-live-extra-option-header">置顶列表</div>
      <div class="extend-feeds-live-extra-option-description">
        配置直播信息扩充要展示的置顶列表，置顶列表中的用户会排序到上方。
      </div>
      <FollowingListSelect :value="pinnedListID" @change="handlePinnedListChange" />
    </div>
    <div class="extend-feeds-live-extra-option">
      <div class="extend-feeds-live-extra-option-header">隐藏列表</div>
      <div class="extend-feeds-live-extra-option-description">
        配置直播信息扩充要展示的隐藏列表，隐藏列表中的用户会被隐藏，优先级高于置顶列表。
      </div>
      <FollowingListSelect :value="hiddenListID" @change="handleHiddenListChange" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import FollowingListSelect from './FollowingListSelect.vue'
import { getComponentSettings } from '@/core/settings'
import { ExtendFeedsLiveOptions } from './options'
import { FollowingListID } from './types'

const { options } = getComponentSettings<ExtendFeedsLiveOptions>('extendFeedsLive')

const pinnedListID = ref(options.pinnedListID)
const handlePinnedListChange = (value: FollowingListID) => {
  options.pinnedListID = value
  pinnedListID.value = value
}

const hiddenListID = ref(options.hiddenListID)
const handleHiddenListChange = (value: FollowingListID) => {
  options.hiddenListID = value
  hiddenListID.value = value
}
</script>
<style lang="scss">
@import 'common';

.extend-feeds-live-extra-options {
  margin-top: 8px;
  @include v-stretch(12px);
  .extend-feeds-live-extra-option {
    @include v-stretch(8px);
    &-header {
      @include semi-bold();
    }
    &-description {
      font-size: 12px;
      opacity: 0.75;
    }
  }
}
</style>

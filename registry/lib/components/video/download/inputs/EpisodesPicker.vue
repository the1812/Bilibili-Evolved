<template>
  <div class="episodes-picker download-video-config-section">
    <div class="episodes-picker-header">
      <div class="episodes-picker-title">选集:</div>
      <div class="episodes-picker-checked-ratio">
        {{ checkedRatio }}
      </div>
      <div class="episodes-picker-actions">
        <VButton
          class="select-all"
          title="全选"
          type="transparent"
          @click="forEachItem(it => (it.isChecked = true))"
        >
          <VIcon :size="16" icon="mdi-checkbox-multiple-marked-circle" />
        </VButton>
        <VButton
          class="deselect-all"
          title="全不选"
          type="transparent"
          @click="forEachItem(it => (it.isChecked = false))"
        >
          <VIcon :size="16" icon="mdi-checkbox-multiple-blank-circle-outline" />
        </VButton>
        <VButton
          class="invert-selection"
          title="反选"
          type="transparent"
          @click="forEachItem(it => (it.isChecked = !it.isChecked))"
        >
          <VIcon :size="16" icon="mdi-circle-slice-4" />
        </VButton>
      </div>
    </div>
    <div class="episodes-picker-items">
      <div v-if="episodeItems.length === 0" class="episodes-picker-empty">
        <VEmpty />
      </div>
      <div v-for="(item, index) of episodeItems" :key="item.key" class="episodes-picker-item">
        <CheckBox
          v-model="item.isChecked"
          icon-position="left"
          :data-aid="item.inputItem.aid"
          :data-cid="item.inputItem.cid"
          :data-bvid="item.inputItem.bvid"
          @click.native="shiftSelect($event, item, index)"
        >
          <span class="episode-title">
            {{ item.title }}
          </span>
          <span v-if="item.durationText" class="episode-duration">
            {{ item.durationText }}
          </span>
        </CheckBox>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon, CheckBox, VEmpty } from '@/ui'
import { EpisodeItem } from './episode-item'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    CheckBox,
    VEmpty,
  },
  props: {
    api: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      episodeItems: [],
      maxCheckedItems: 32,
      lastCheckedEpisodeIndex: -1,
    }
  },
  computed: {
    checkedRatio() {
      const checked: number = this.episodeItems.filter((it: EpisodeItem) => it.isChecked).length
      return `(${checked}/${this.episodeItems.length})`
    },
    inputItems() {
      return this.episodeItems.map((it: EpisodeItem) => it.inputItem)
    },
    checkedInputItems() {
      const items: EpisodeItem[] = this.episodeItems
      return items.filter(it => it.isChecked).map(it => it.inputItem)
    },
  },
  created() {
    this.getEpisodeItems()
  },
  methods: {
    shiftSelect(e: MouseEvent, item: EpisodeItem, index: number) {
      if (!e.shiftKey || this.lastCheckedEpisodeIndex === -1) {
        // console.log('set lastCheckedEpisodeIndex', index)
        this.lastCheckedEpisodeIndex = index
        return
      }
      if (e.shiftKey && this.lastCheckedEpisodeIndex !== -1) {
        ;(this.episodeItems as EpisodeItem[])
          .slice(
            Math.min(this.lastCheckedEpisodeIndex, index) + 1,
            Math.max(this.lastCheckedEpisodeIndex, index),
          )
          .forEach(it => {
            it.isChecked = !it.isChecked
          })
        // console.log(
        //   'shift toggle',
        //   Math.min(this.lastCheckedEpisodeIndex, index) + 1,
        //   Math.max(this.lastCheckedEpisodeIndex, index),
        // )
        this.lastCheckedEpisodeIndex = index
        e.preventDefault()
      }
    },
    forEachItem(action: (item: EpisodeItem, index: number) => void) {
      const items: EpisodeItem[] = this.episodeItems
      items.forEach(action)
    },
    async getEpisodeItems() {
      if (this.episodeItems.length > 0) {
        return
      }
      this.episodeItems = await this.api(this)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.episodes-picker {
  &-header {
    @include h-center();
  }
  &-checked-ratio {
    flex-grow: 1;
    margin-left: 4px;
  }
  &-actions {
    @include h-center();
    .be-button {
      padding: 4px;
      &.invert-selection .be-icon {
        font-size: 14px;
      }
      &.select-all .be-icon,
      &.deselect-all .be-icon {
        transform: translateY(1px);
      }
    }
  }
  &-items {
    max-height: 400px;
    overflow: auto;
    &:not(:empty) {
      margin-top: 4px;
      border: 1px solid #8884;
      border-radius: 6px;
    }
    .be-check-box {
      padding: 2px 6px;
    }
    .episode-duration {
      margin-right: 4px;
      text-align: right;
      flex: 1 1 0;
      opacity: 0.5;
    }
  }
  &-empty {
    @include h-center();
    justify-content: center;
    padding: 4px 0;
  }
}
</style>

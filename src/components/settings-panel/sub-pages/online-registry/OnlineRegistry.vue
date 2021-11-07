<template>
  <VPopup v-model="popupOpen" class="online-registry" fixed :auto-close="false">
    <div class="online-registry-header">
      <VIcon icon="mdi-web" class="online-registry-header-title-icon" />
      <div class="online-registry-header-title">
        在线仓库
      </div>
      <div class="online-registry-header-search">
        <VIcon icon="search" :size="18" />
        <TextBox
          v-model="searchKeyword"
          placeholder="搜索功能"
        />
      </div>
      <VIcon
        icon="mdi-refresh"
        :size="22"
        class="online-registry-header-refresh-icon"
        title="刷新"
        @click="fetchFeatures()"
      />
      <VIcon
        icon="close"
        :size="18"
        class="online-registry-header-close-icon"
        title="关闭"
        @click="popupOpen = false"
      />
    </div>
    <div class="online-registry-separator"></div>
    <div ref="content" class="online-registry-content">
      <VLoading v-if="loading" />
      <VEmpty v-if="!loading && !list.length" />
      <RegistryItem
        v-for="item of filteredList"
        :key="item.name"
        :item="item"
      />
      <!-- <RegistryItem
        v-for="item of packList"
        :key="item.name"
        :item="item"
      /> -->
    </div>
  </VPopup>
</template>
<script lang="ts">
import { monkey } from '@/core/ajax'
import { cdnRoots } from '@/core/cdn-types'
import { meta } from '@/core/meta'
import { getGeneralSettings } from '@/core/settings'
import { logError } from '@/core/utils/log'
import {
  VIcon,
  TextBox,
  VPopup,
  VLoading,
  VEmpty,
} from '@/ui'
import Fuse from 'fuse.js'
import { DocSourceItem } from 'registry/lib/docs'
import RegistryItem from './RegistryItem.vue'

export default Vue.extend({
  components: {
    VIcon,
    TextBox,
    VPopup,
    RegistryItem,
    VLoading,
    VEmpty,
  },
  props: {
    open: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      searchKeyword: '',
      popupOpen: false,
      loading: false,
      list: [],
      filteredList: [],
      // packList: [],
      fuse: null,
    }
  },
  watch: {
    searchKeyword: lodash.debounce(function updateList(keyword: string) {
      if (!keyword) {
        this.filteredList = this.list
        return
      }
      const fuse = this.fuse as Fuse<DocSourceItem>
      const fuseResult = fuse.search(keyword)
      this.filteredList = fuseResult.map(it => it.item)
      this.$nextTick().then(() => this.$refs.content.scrollTo(0, 0))
    }, 200),
  },
  mounted() {
    this.fetchFeatures()
  },
  methods: {
    async fetchFeatures() {
      if (this.loading) {
        return
      }
      try {
        this.loading = true
        const featureListUrl = `${cdnRoots[getGeneralSettings().cdnRoot](meta.compilationInfo.branch)}doc/features/features.json`
        const packListUrl = `${cdnRoots[getGeneralSettings().cdnRoot](meta.compilationInfo.branch)}doc/features/pack/pack.json`
        const featureList = await monkey({
          url: featureListUrl,
          responseType: 'json',
        })
        const packList = await monkey({
          url: packListUrl,
          responseType: 'json',
        })
        this.list = [...packList, ...featureList]
        this.fuse = new Fuse(this.list, {
          keys: ['displayName', 'name', 'description'],
        })
        this.searchKeyword = ''
        this.filteredList = [...this.list]
      } catch (error) {
        logError(error)
      } finally {
        this.loading = false
      }
    },
  },
})
</script>
<style lang="scss">
@import "common";

.online-registry {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 360px;
  height: 85vh;
  z-index: 100002;
  transition: .2s ease-out;
  font-size: 14px;
  @include v-stretch();
  @include popup();
  &.open {
    transform: translate(-50%, -50%) scale(1);
  }
  &-header {
    padding: 12px;
    @include h-center(6px);
    &-title {
      font-size: 18px;
      font-weight: bold;
    }
    &-search {
      flex: 1;
      margin: 0 12px;
      justify-content: center;
      @include h-center(6px);
      .be-textbox {
        max-width: 320px;
        flex: 1;
        font-size: 12px;
      }
    }
    &-refresh-icon,
    &-close-icon {
      padding: 4px;
      cursor: pointer;
      transition: .3s ease-out;
      &:hover {
        color: var(--theme-color);
      }
    }
    &-refresh-icon {
      padding: 2px;
      &:hover {
        transform: rotate(360deg);
      }
    }
  }
  &-separator {
    height: 1px;
    width: calc(100% - 24px);
    margin: 0 12px;
    background-color: #8882;
  }
  &-content {
    flex: 1;
    padding: 4px 0;
    @include no-scrollbar();
    .be-loading,
    .be-empty {
      margin: 12px 0;
    }
  }
}
</style>

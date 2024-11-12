<template>
  <VPopup
    v-model="popupOpen"
    class="online-registry be-settings-extra-options"
    fixed
    :auto-close="false"
  >
    <div class="online-registry-header">
      <VIcon icon="mdi-web" class="online-registry-header-title-icon" />
      <div class="online-registry-header-title">在线仓库</div>
      <VIcon
        icon="mdi-refresh"
        :size="22"
        class="online-registry-header-refresh-icon"
        title="刷新"
        @click="fetchFeatures()"
      />
      <VIcon
        icon="mdi-close"
        :size="24"
        class="online-registry-header-close-icon"
        title="关闭"
        @click="popupOpen = false"
      />
    </div>
    <div class="online-registry-header">
      <div class="online-registry-header-search">
        <VIcon icon="search" :size="18" />
        <TextBox v-model="searchKeyword" :disabled="loading" placeholder="搜索功能" />
      </div>
      <div class="online-registry-header-branch">
        分支:
        <VDropdown v-model="selectedBranch" :disabled="loading" :items="registryBranches">
          <template #item="{ item }">
            {{ item }}
          </template>
        </VDropdown>
      </div>
      <div class="online-registry-header-filter">
        查看:
        <RadioButton
          v-for="option of itemFilterOptions"
          :key="option.value"
          group="itemFilter"
          :checked="itemFilter === option.value"
          @change="$event && (itemFilter = option.value)"
        >
          {{ option.label }}
        </RadioButton>
      </div>
    </div>
    <div class="online-registry-separator"></div>
    <div ref="content" class="online-registry-content">
      <VLoading v-if="loading" />
      <VEmpty v-if="!loading && !filteredList.length" />
      <RegistryItem
        v-for="item of filteredList"
        :key="item.name"
        ref="items"
        :item="item"
        :branch="selectedBranch"
        :item-filter="itemFilter"
        @refresh="checkInstalled"
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
import { DocSourceItem } from 'registry/lib/docs'
import { monkey } from '@/core/ajax'
import { cdnRoots } from '@/core/cdn-types'
import { meta } from '@/core/meta'
import { getGeneralSettings } from '@/core/settings'
import { logError } from '@/core/utils/log'
import { VIcon, VDropdown, TextBox, VPopup, VLoading, VEmpty, RadioButton } from '@/ui'
import RegistryItem from './RegistryItem.vue'
import { registryBranches } from './third-party'
import { ItemFilter } from './item-filter'
import { getDescriptionText } from '@/components/description'

type ExtendedSettings = ReturnType<typeof getGeneralSettings> & { registryBranch: string }
const general = getGeneralSettings() as ExtendedSettings
function updateList(keyword: string) {
  if (!keyword) {
    this.filteredList = this.list
    return
  }
  this.filteredList = this.list.filter((it: DocSourceItem) => {
    const text = [it.name, it.displayName, it.descriptionText].join('\n').toLowerCase()
    return text.includes(keyword)
  })
  this.$nextTick().then(() => this.$refs.content.scrollTo(0, 0))
}
const itemFilterOptions = [
  {
    label: '全部',
    value: ItemFilter.All,
  },
  {
    label: '已安装',
    value: ItemFilter.Installed,
  },
  {
    label: '未安装',
    value: ItemFilter.NotInstalled,
  },
]

export default Vue.extend({
  components: {
    VIcon,
    VDropdown,
    TextBox,
    VPopup,
    RegistryItem,
    VLoading,
    VEmpty,
    RadioButton,
  },
  props: {
    open: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    const branches = [
      general.registryBranch,
      meta.compilationInfo.branch,
      registryBranches[0],
    ].filter(it => registryBranches.includes(it) && Boolean(it))
    return {
      searchKeyword: '',
      popupOpen: false,
      loading: false,
      list: [],
      itemFilter: ItemFilter.All,
      itemFilterOptions,
      filteredList: [],
      // packList: [],
      registryBranches,
      selectedBranch: branches[0],
    }
  },
  watch: {
    searchKeyword: lodash.debounce(updateList, 200),
    selectedBranch(newBranch: string) {
      general.registryBranch = newBranch
      this.fetchFeatures()
    },
  },
  mounted() {
    this.fetchFeatures()
  },
  methods: {
    async fetchFeatures() {
      if (this.loading) {
        return
      }
      const fetchPath = cdnRoots[general.cdnRoot](this.selectedBranch)
      try {
        this.loading = true
        this.list = []
        this.filteredList = []
        const featureListUrl = `${fetchPath}doc/features/features.json`
        const packListUrl = `${fetchPath}doc/features/pack/pack.json`
        const featureList = await monkey({
          url: featureListUrl,
          responseType: 'json',
        })
        const packList = await monkey({
          url: packListUrl,
          responseType: 'json',
        })
        if (!Array.isArray(featureList) || !Array.isArray(packList)) {
          console.error('Fetch failed:', featureList, packList, featureListUrl, packListUrl)
          throw new Error('获取在线仓库数据失败, 请尝试在通用设置中设置其他更新源, 然后再试一次.')
        }
        this.list = await Promise.all(
          [...packList, ...featureList].map(async it => {
            return {
              ...it,
              descriptionText: await getDescriptionText(it),
            }
          }),
        )
        console.log(this.list)
        updateList.call(this, this.searchKeyword)
      } catch (error) {
        logError(error)
      } finally {
        this.loading = false
      }
    },
    checkInstalled() {
      this.$refs.items?.forEach((item: any) => item.checkInstalled())
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.online-registry {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 400px;
  height: 85vh;
  z-index: 100000;
  transition: 0.2s ease-out;
  font-size: 14px;
  @include v-stretch();
  @include popup();
  &.open {
    transform: translate(-50%, -50%) scale(1);
  }
  &-header {
    padding: 12px 12px 6px 12px;
    @include h-center(12px);
    row-gap: 6px;
    flex-wrap: wrap;
    & + & {
      padding-top: 6px;
    }
    &-title {
      flex: 1;
      font-size: 18px;
      @include semi-bold();
    }
    &-search {
      flex: 1;
      justify-content: center;
      @include h-center(6px);
      .be-textbox {
        max-width: 320px;
        flex: 1;
        font-size: 12px;
      }
    }
    &-filter {
      @include h-center(6px);
      font-size: 12px;
    }
    &-branch {
      @include h-center(6px);
      font-size: 12px;
    }
    &-refresh-icon,
    &-close-icon {
      padding: 2px;
      cursor: pointer;
      transition: 0.3s ease-out;
      &:hover {
        color: var(--theme-color);
      }
    }
    &-refresh-icon {
      padding: 3px;
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

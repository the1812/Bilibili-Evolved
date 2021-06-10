<template>
  <div class="manage-panel">
    <div class="manage-panel-title sub-page-row">
      <VIcon :icon="config.icon" />
      <div class="title-text">
        {{ config.title }}
      </div>
      <VIcon icon="search" :size="18" />
      <TextBox
        v-model="search"
        class="list-search"
        :placeholder="`在 ${filteredList.length} 个${config.title}中搜索`"
      />
    </div>
    <div v-if="config.description" class="sub-page-row">
      <div class="description-text">
        {{ config.description }}
      </div>
    </div>
    <div v-if="config.description" class="sub-page-row separator"></div>
    <div class="sub-page-row">
      <div class="title-text">
        添加{{ config.title }}:
      </div>
      <VButton @click="browse()">
        <VIcon :size="18" icon="mdi-folder-open-outline" />
        浏览本地
      </VButton>
    </div>
    <div class="sub-page-row">
      <TextBox
        v-model="url"
        class="item-url"
        :placeholder="'粘贴' + config.title + '链接'"
        @keydown.enter="addItem()"
      />
      <VButton :disabled="!url" @click="addItem()">
        <VIcon :size="18" icon="mdi-plus" />
        添加
      </VButton>
    </div>
    <div v-if="result" class="sub-page-row">
      <div class="item-url-result">
        {{ result }}
      </div>
    </div>
    <div class="sub-page-row separator"></div>
    <div class="sub-page-row">
      <div class="title-text">
        已安装的{{ config.title }}:
      </div>
      <div class="exclude-built-in">
        隐藏内置{{ config.title }}
        <SwitchBox v-model="excludeBuiltIn" />
      </div>
    </div>
    <div v-if="!loaded" class="sub-page-row">
      <VLoading />
    </div>
    <div v-if="loaded" class="manage-item-list">
      <VEmpty v-if="debouncedList.length === 0" />
      <ManageItem
        v-for="item of debouncedList"
        :key="item.name"
      >
        <slot name="item" :item="item">
          {{ item.displayName }}
        </slot>
      </ManageItem>
    </div>
  </div>
</template>
<script lang="ts">
import { monkey } from '@/core/ajax'
import { pickFile } from '@/core/file-picker'
import { logError } from '@/core/utils/log'
import VIcon from '@/ui/icon/VIcon.vue'
import VButton from '@/ui/VButton.vue'
import TextBox from '@/ui/TextBox.vue'
import VEmpty from '@/ui/VEmpty.vue'
import VLoading from '@/ui/VLoading.vue'
import SwitchBox from '@/ui/SwitchBox.vue'
import ManageItem from './ManageItem.vue'

export default Vue.extend({
  components: {
    VIcon,
    VButton,
    TextBox,
    VEmpty,
    VLoading,
    ManageItem,
    SwitchBox,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      search: '',
      url: '',
      result: '',
      loaded: false,
      excludeBuiltIn: true,
      debouncedList: [],
    }
  },
  computed: {
    filteredList() {
      return this.config.list.filter(it => this.config.listFilter(
        it, this.search, this.excludeBuiltIn,
      ))
    },
  },
  watch: {
    filteredList() {
      this.loaded = false
      window.setTimeout(() => {
        this.debouncedList = this.filteredList
        this.loaded = true
      }, 200)
    },
  },
  mounted() {
    window.setTimeout(() => {
      this.debouncedList = this.filteredList
      this.loaded = true
    })
  },
  methods: {
    async handleCode(code: string) {
      try {
        this.result = '获取中...'
        this.result = await this.config.onItemAdd?.(code, this.url)
      } catch (error) {
        logError(error)
        this.result = ''
      }
    },
    async browse() {
      const codes = await pickFile({ accept: '*.json,*.js' })
      if (codes.length === 0) {
        return
      }
      const [codeFile] = codes
      const code = await codeFile.text()
      await this.handleCode(code)
    },
    async addItem() {
      if (!this.url) {
        return
      }
      try {
        const code = await monkey({
          url: this.url,
          method: 'GET',
        })
        console.log(code)
        await this.handleCode(code)
        this.url = ''
      } catch (error) {
        logError(error)
        this.result = ''
      }
    },
  },
})
</script>
<style lang="scss">
@import "common";

.manage-panel {
  height: calc(var(--panel-height) - 52px - 48px);
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: 12px;
  }
  .be-button .be-icon {
    margin-right: 6px;
  }
  .exclude-built-in .be-switch-box {
    margin-left: 6px;
  }
  .title-text {
    font-size: 14px;
    font-weight: bold;
  }
  .item-url-result {
    color: var(--theme-color);
  }
  .item-url {
    margin-right: 12px;
  }
  .manage-item-list {
    @include v-center();
    @include no-scrollbar();
    overflow: auto;
    flex-shrink: 1;
  }
  .exclude-built-in {
    @include h-center();
  }
  .be-loading {
    width: 100%;
    text-align: center;
  }
  .description-text {
    opacity: .75;
  }
  &-title {
    .be-icon {
      margin-right: 6px;
    }
    .title-text {
      font-size: 16px;
      font-weight: bold;
      flex: 1 0 auto;
    }
  }
}
</style>

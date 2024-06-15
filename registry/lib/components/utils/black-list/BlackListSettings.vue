<template>
  <VPopup
    ref="popup"
    v-model="open"
    class="custom-black-list-settings"
    fixed
    :lazy="false"
    :trigger-element="triggerElement"
  >
    <div class="black-list-settings-header">
      <VIcon class="title-icon" icon="mdi-sort" :size="24"></VIcon>
      <div class="title">{{ titleName }}黑名单设置</div>
      <div class="grow"></div>
      <div class="close" @click="open = false">
        <VIcon icon="close" :size="18"></VIcon>
      </div>
    </div>
    <div class="black-list-settings-content">
      <div class="black-list-settings-section">
        <div class="black-list-settings-section-title">添加到黑名单</div>
        <div class="black-list-settings-section-input">
          <TextBox :text="name" @change="changeName" />
          <VButton @click="add">添加</VButton>
        </div>
      </div>
      <div class="black-list-settings-section">
        <div class="black-list-settings-section-title">黑名单列表</div>
        <div class="black-list-settings-section-description">点击×图标可以删除名单.</div>
        <VLoading v-if="!loaded" />
        <div
          v-show="loaded"
          ref="black-listSortList"
          class="black-list-settings-section-content black-list-sort-list"
        >
          <div v-for="item of list" :key="item" class="black-list-sort-item" :data-name="item">
            <div class="item-name">
              {{ item }}
            </div>
            <div class="toggle-visible">
              <VIcon :size="18" icon="close" @click="toggleVisible(item)"></VIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VPopup>
</template>
<script lang="ts">
import { VPopup, TextBox, VIcon, VButton } from '@/ui'

export default Vue.extend({
  components: {
    VPopup,
    TextBox,
    VIcon,
    VButton,
  },
  props: {
    triggerElement: {
      type: HTMLElement,
      default: null,
    },
    list: {
      type: Array,
      default: null,
    },
    save: {
      type: Function,
      default: undefined,
    },
    titleName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      open: false,
      loaded: false,
      name: '',
    }
  },
  watch: {
    open(newVal: boolean) {
      if (!newVal) {
        this.save(this.list)
      }
    },
  },
  async mounted() {
    this.loaded = true
  },
  methods: {
    toggle() {
      this.$refs.popup.toggle()
    },
    changeName(val: string) {
      this.name = val
    },
    add() {
      // eslint-disable-next-line vue/no-mutating-props
      this.list.push(this.name)
      // eslint-disable-next-line vue/no-mutating-props
      this.list = lodash.uniq(this.list)
      this.name = ''
    },
    toggleVisible(item: any) {
      // eslint-disable-next-line vue/no-mutating-props
      this.list.splice(this.list.indexOf(item), 1)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.custom-black-list-settings {
  @include popup();
  width: 800px;
  font-size: 14px;
  padding: 12px 12px 12px 18px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.95);
  transition: 0.2s ease-out;
  z-index: 100002;
  &.open {
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  .black-list-settings-header {
    @include h-center();
    justify-content: space-between;
    .title {
      margin-left: 6px;
      font-size: 18px;
      @include semi-bold();
    }
    .grow {
      flex: 1;
    }
    .close {
      padding: 6px;
      cursor: pointer;
      transition: 0.2s ease-out;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
  .black-list-settings-content {
    .black-list-settings-section {
      margin-top: 12px;
      > :not(:last-child) {
        margin-bottom: 6px;
      }
      &-title {
        font-size: 14px;
      }
      &-input {
        display: flex;
        div {
          margin: 0 10px;
        }
      }
      &-description {
        font-size: 12px;
        opacity: 0.6;
        line-height: 1.5;
      }
      &-content {
        margin-top: 20px;
        max-height: 400px;
        padding: 10px;
        overflow: auto;

        scrollbar-width: thin;
        scrollbar-color: #888 #eee;

        &::-webkit-scrollbar {
          width: 12px;
        }

        &::-webkit-scrollbar-track {
          background: #eee;
        }

        &::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 10px;
          border: 3px solid #eee;
        }
        @include h-center();
        flex-wrap: wrap;
        .be-slider {
          margin: 0 4px;
          flex: 1;
        }
        .padding-value {
          margin-left: 12px;
          width: 50px;
          text-align: end;
        }
        .black-list-sort-item {
          @include card();
          @include h-center();
          transition: none;
          white-space: nowrap;
          padding: 6px;
          padding-left: 8px;
          margin: 0 4px 4px 0;
          cursor: move;
          &:hover {
            border-color: var(--theme-color);
          }
          &.black-list-hidden {
            opacity: 0.5;
          }
          &.sortable-ghost {
            opacity: 0;
          }
          &.sortable-chosen {
            box-shadow: 0 4px 16px 0 rgb(0 0 0 / 16%);
            transform: scale(1.05);
          }
          &.sortable-drag {
            opacity: 1;
          }
          &.sortable-drag.black-list-hidden {
            opacity: 0.5;
          }
          .toggle-visible {
            margin-left: 6px;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>

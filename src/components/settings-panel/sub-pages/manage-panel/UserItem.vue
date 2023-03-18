<template>
  <div class="user-item">
    <div class="user-item-display-name">
      {{ config.item.displayName }}
    </div>
    <div class="user-item-name">
      {{ config.item.name }}
    </div>
    <div v-if="config.isUserItem" class="user-item-line"></div>
    <div
      v-if="config.isUserItem"
      ref="removeIcon"
      class="user-item-remove"
      @dblclick="removeItem()"
    >
      <VIcon icon="mdi-trash-can-outline" :size="18" />
      <div ref="removeConfirmTemplate" class="user-item-remove-confirm">
        确定要卸载 {{ config.item.displayName }} 吗?
        <VButton type="primary" @click="removeItem()">
          <VIcon icon="mdi-trash-can-outline" :size="16" />
          确定
        </VButton>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Toast } from '@/core/toast'
import { VIcon } from '@/ui'
import VButton from '@/ui/VButton.vue'

export default Vue.extend({
  components: {
    VIcon,
    VButton,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      removeConfirm: false,
      settings: {},
    }
  },
  mounted() {
    if (this.config.getSettings) {
      this.settings = this.config.getSettings(this.config.item)
    }
    if (this.config.isUserItem) {
      Toast.mini(this.$refs.removeConfirmTemplate, this.$refs.removeIcon, {
        trigger: 'click',
        hideOnClick: true,
      })
    }
  },
  methods: {
    async removeItem() {
      await this.config.onItemRemove(this.config.item)
      this.removeConfirm = false
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.manage-panel .user-item {
  display: grid;
  column-gap: 6px;
  grid-template: 'displayName line remove' auto 'name line remove' auto / auto 1fr auto;
  align-items: center;
  padding: 6px 0;

  .user-item-display-name {
    grid-area: displayName;
  }
  .user-item-name {
    grid-area: name;
    opacity: 0.5;
    font-size: 11px;
  }
  .user-item-line {
    grid-area: line;
    justify-self: stretch;
    transition: 0.2s ease-out;
    opacity: 0;
    height: 0;
    width: 100%;
    border-bottom: 1px dashed;
    box-sizing: border-box;
  }
  .user-item-toggle {
    grid-area: toggle;
    justify-self: end;
  }
  .user-item-remove-confirm {
    @include h-center(8px);
    font-size: 13px;
    color: white;
    .be-button {
      color: inherit;
      font-size: 12px;
      padding: 4px;
      padding-right: 6px;
      .be-icon {
        margin-right: 4px;
      }
    }
  }
  .tippy-box {
    border-radius: 8px;
    .tippy-content {
      padding-right: 5px;
    }
  }
  .user-item-remove {
    grid-area: remove;
    justify-self: end;
    display: flex;
    align-items: center;
    opacity: 0.1;
    transition: 0.2s ease-out;
    cursor: pointer;
    padding: 4px;
    &:hover {
      opacity: 1;
      color: #e54e4e;
    }
  }
  &:hover {
    .user-item-remove:not(:hover) {
      opacity: 0.75;
    }
    .user-item-line {
      opacity: 0.5;
    }
  }
}
</style>

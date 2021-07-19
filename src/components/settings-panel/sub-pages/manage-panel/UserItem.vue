<template>
  <div class="user-item">
    <div class="user-item-display-name">
      {{ config.item.displayName }}
    </div>
    <div class="user-item-name">
      {{ config.item.name }}
    </div>
    <div v-if="config.isUserItem" class="user-item-line"></div>
    <div v-if="config.isUserItem" class="user-item-remove">
      <VIcon
        v-if="!removeConfirm"
        icon="mdi-trash-can-outline"
        :size="18"
        @click="showRemoveConfirm()"
      />
      <div
        v-else
        class="user-item-remove-confirm"
        @click="removeItem()"
      >
        <VIcon
          icon="mdi-trash-can-outline"
          :size="18"
        />
        确认卸载
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { VIcon } from '@/ui'

export default Vue.extend({
  components: {
    VIcon,
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
  },
  methods: {
    showRemoveConfirm() {
      this.removeConfirm = true
      window.setTimeout(() => {
        this.removeConfirm = false
      }, 3000)
    },
    async removeItem() {
      // const hooks = getHook(`${this.config.key}.remove`, this.config.item)
      // await hooks.before()
      await this.config.onItemRemove(this.config.item)
      // await hooks.after()
      this.removeConfirm = false
    },
  },
})
</script>
<style lang="scss">
@import "common";

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
    opacity: .5;
    font-size: 11px;
  }
  .user-item-line {
    grid-area: line;
    justify-self: stretch;
    transition: .2s ease-out;
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
    @include h-center();
  }
  .user-item-remove {
    grid-area: remove;
    justify-self: end;
    display: flex;
    align-items: center;
    opacity: 0.1;
    transition: .2s ease-out;
    cursor: pointer;
    &:hover {
      opacity: 1;
      color: #E54E4E;
    }
  }
  &:hover {
    .user-item-remove:not(:hover) {
      opacity: .75;
    }
    .user-item-line {
      opacity: .5;
    }
  }
}
</style>

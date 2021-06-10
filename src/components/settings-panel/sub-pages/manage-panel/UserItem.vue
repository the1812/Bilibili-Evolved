<template>
  <div class="user-item">
    <div class="user-item-display-name">
      {{ config.item.displayName }}
    </div>
    <div v-if="config.item.configurable === true && config.getSettings" class="user-item-toggle">
      <SwitchBox v-model="settings.enabled" />
    </div>
    <div class="user-item-name">
      {{ config.item.name }}
    </div>
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
import VIcon from '@/ui/icon/VIcon.vue'
import SwitchBox from '@/ui/SwitchBox.vue'

export default Vue.extend({
  components: {
    SwitchBox,
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
  gap: 6px;
  grid-template: 'displayName toggle' auto 'name remove' auto / 1fr auto;
  align-items: center;

  .user-item-display-name {
    grid-area: displayName;
    font-size: 15px;
  }
  .user-item-name {
    grid-area: name;
    opacity: .5;
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
    opacity: .75;
    transition: .2s ease-out;
    cursor: pointer;
    &:hover {
      opacity: 1;
      color: #E54E4E;
    }
  }
}
</style>

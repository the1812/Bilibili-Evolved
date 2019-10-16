<template>
  <div class="filter-type-switch">
    <label :class="{disabled}">
      <span class="name" :class="{disabled}">{{type.name}}</span>
      <input type="checkbox" v-model="disabled" />
      <icon class="disabled" type="mdi" icon="cancel" v-if="disabled"></icon>
      <icon type="mdi" icon="check" v-else></icon>
    </label>
  </div>
</template>

<script lang="ts">
export default {
  components: {
    Icon: () => import('../../style/icon.vue')
  },
  props: ['name', 'type'],
  methods: {
    setFilter(disabled: boolean, updateSettings = true) {
      document.body.classList[disabled ? 'add' : 'remove'](
        `feeds-filter-block-${this.name}`
      )
      if (!updateSettings) {
        return
      }
      if (disabled) {
        settings.feedsFilterTypes.push(this.type.id)
      } else {
        const index = settings.feedsFilterTypes.indexOf(this.type.id)
        if (index !== -1) {
          settings.feedsFilterTypes.splice(index, 1)
        }
      }
      settings.feedsFilterTypes = settings.feedsFilterTypes
    }
  },
  data() {
    const disabled = settings.feedsFilterTypes.includes(this.type.id)
    this.setFilter(disabled, false)
    return {
      disabled,
    }
  },
  watch: {
    disabled(newValue: boolean) {
      this.setFilter(newValue)
    }
  }
}
</script>

<style lang="scss">
.filter-type-switch {
  label {
    cursor: pointer;
    margin: 0;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #0001;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid transparent;

    .name {
      font-size: 12px;
    }
    .disabled {
      color: var(--theme-color) !important;
    }
    &:hover {
      background-color: #0002;
    }
    &.disabled {
      border-color: var(--theme-color);
    }
    input {
      display: none;
    }
    .be-icon {
      font-size: 16px;
    }
  }
}
</style>
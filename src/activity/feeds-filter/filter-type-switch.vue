<template>
  <div class="filter-type-switch feeds-filter-swtich">
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
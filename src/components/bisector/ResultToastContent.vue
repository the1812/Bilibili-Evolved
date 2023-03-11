<template>
  <div>
    <div>可能出问题的组件是：{{ displayName }}（{{ name }}）</div>
    <div>
      <span class="link" @click="restore">恢复原状（{{ countdown }} 秒）</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import type { UserComponent } from './api'

export default defineComponent({
  props: {
    userComponent: {
      type: Object as PropType<UserComponent>,
      required: true,
    },
  },
  emits: {
    restore: null as () => void,
  },
  data() {
    return {
      countdown: 30,
      interval: undefined as number | undefined,
    }
  },
  computed: {
    displayName() {
      return this.userComponent.metadata?.displayName
    },
    name() {
      return this.userComponent.metadata?.name
    },
  },
  watch: {
    countdown(value) {
      if (value === 0) {
        this.restore()
      }
    },
  },
  created() {
    this.interval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--
      } else {
        clearInterval(this.interval)
      }
    }, 1e3)
  },
  unmounted() {
    clearInterval(this.interval)
  },
  methods: {
    restore() {
      clearInterval(this.interval)
      this.$emit('restore')
    },
  },
})
</script>

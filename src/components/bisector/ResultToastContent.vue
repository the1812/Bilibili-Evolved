<template>
  <div>
    <div>可能出问题的组件是：{{ displayName }}（{{ name }}）</div>
    <div>
      <span class="link" @click="restore">恢复原状（{{ countdown }} 秒）</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      countdown: 30,
      userComponent: undefined,
    }
  },
  computed: {
    displayName() {
      return this.userComponent?.metadata?.displayName
    },
    name() {
      return this.userComponent?.metadata?.name
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
  destroyed() {
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

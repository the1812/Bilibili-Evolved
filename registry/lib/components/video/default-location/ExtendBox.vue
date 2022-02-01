<template>
  <div class="container" :class="{ hidden: realHidden }">
    <div class="bar" :class="{ 'bar-bottom': !realHidden }" @click="onClick">
      <div class="bar-text">
        位置测试
      </div>
      <div class="bar-btn">
        <VIcon icon="mdi-chevron-up" :size="15" />
      </div>
    </div>

    <div class="content-container">
      <transition name="hidden">
        <div v-show="!realHidden" class="content">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { VIcon } from '@/ui'

export default Vue.extend({
  components: { VIcon },
  model: {
    prop: 'hidden',
    event: 'change',
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 12,
    },
    hidden: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      realHidden: this.hidden,
      barBottom: !this.hidden,
    }
  },
  methods: {
    onClick() {
      this.realHidden = !this.realHidden
      this.$emit('change', this.realHidden)
    },
  },
})
</script>

<style scoped>
.container {
  --border-color: #8884;
  border-radius: 3px;
  border: 1px solid var(--border-color);
}

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid transparent;
  border-radius: 3px;
  padding: 8px;
  cursor: pointer;
  &>* {
    hight: min-content;
  }
}

.bar-bottom {
  border-bottom-color: var(--border-color);
}

.content-container {
  overflow: hidden;
}

.content {
  padding: 0px 8px;
}

.hidden-enter-active,
.hidden-leave-active,
.bar,
.bar-btn {
  transition: all 0.3s;
}

.hidden-enter,
.hidden-leave-to {
  margin-top: -100%;
}

.hidden .bar-btn {
  transform: rotate(-0.5turn);
}
</style>

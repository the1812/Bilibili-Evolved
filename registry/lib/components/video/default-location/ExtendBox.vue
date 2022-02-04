<template>
  <div
    class="video-default-location-extend-box"
    :class="{ 'video-default-location-extend-box-hidden': realHidden }"
  >
    <div class="video-default-location-extend-box-bar" @click="onClick">
      <div class="video-default-location-extend-box-bar-text">
        位置测试
      </div>
      <div class="video-default-location-extend-box-bar-btn">
        <VIcon icon="mdi-chevron-up" :size="15" />
      </div>
    </div>

    <div class="video-default-location-extend-box-content-wrap">
      <div class="video-default-location-extend-box-content">
        <slot></slot>
      </div>
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

<style lang="scss">
.video-default-location-extend-box {
  --video-default-location-extend-box-border-color: #8884;
  border-radius: 3px;
  border: 1px solid var(--video-default-location-extend-box-border-color);
}

.video-default-location-extend-box-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 3px;
  border-bottom: 1px solid var(--video-default-location-extend-box-border-color);
  padding: 8px;
  cursor: pointer;
  & > * {
    height: min-content;
  }
}

.video-default-location-extend-box-content-wrap {
  overflow: hidden;
}

.video-default-location-extend-box-content {
  padding: 0px 8px;
}

.video-default-location-extend-box-bar,
.video-default-location-extend-box-bar-btn,
.video-default-location-extend-box-content {
  transition: all 0.3s;
}

.video-default-location-extend-box-hidden {
  .video-default-location-extend-box-bar {
    border-bottom-color: transparent;
  }
  .video-default-location-extend-box-bar-btn {
    transform: rotate(-0.5turn);
  }
  .video-default-location-extend-box-content {
    margin-top: -100%;
  }
}
</style>

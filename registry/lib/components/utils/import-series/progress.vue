<template>
  <div class="mask">
    <div class="container">
      <p class="title">收藏进度</p>
      <div class="progress-wrapper">
        <span class="progress">{{ handled }}</span>
        <span class="mid"> / </span>
        <span class="all">{{ all }}</span>
      </div>
      <button
        :disabled="isDisabled"
        :class="{ disabled: isDisabled }"
        class="sure_button"
        @click="sure"
      >
        确定
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  props: {
    isDisabled: {
      type: Boolean,
      default: true,
    },
    all: {
      type: Number,
      default: 0,
    },
    handled: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    sure() {
      this.$destroy()
      this.$el.parentNode.removeChild(this.$el)
    },
  },
})
</script>

<style scoped>
.mask {
  position: absolute;
  top: 0;
  background: rgba(0, 0, 0, 0.65);
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10102;
}

.container {
  width: 420px;
  background-color: white;
  border-radius: 4px;
  padding: 40px;
}

.title {
  height: 50px;
  line-height: 50px;
  font-size: 40px;
  text-align: center;
  margin-bottom: 30px;
}

.progress-wrapper {
  text-align: center;
  font-size: 30px;
  margin-bottom: 30px;
  height: 50px;
  line-height: 50px;
}

.sure_button {
  cursor: pointer;
  background: #00aeec;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  width: 160px;
  height: 40px;
  margin: 0 auto;
  display: block;
}

.sure_button.disabled {
  border: none;
  color: white;
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>

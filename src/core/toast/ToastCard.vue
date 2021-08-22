<template>
  <div class="toast-card visible" :class="'toast-' + card.type">
    <div class="toast-card-border"></div>
    <div class="toast-card-header">
      <h1 class="toast-card-title">
        {{ card.title }}
      </h1>
      <div class="toast-card-dismiss" @click="card.dismiss()">
        <VIcon icon="close" :size="20"></VIcon>
      </div>
    </div>
    <div class="toast-card-message" v-html="card.message"></div>
  </div>
</template>

<script lang="ts">
import { VIcon } from '@/ui'

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
})
</script>

<style lang="scss">
@import "common";
.toast-card {
  background: #fff;
  min-width: var(--card-min-width);
  max-width: 60vw;
  min-height: 87px;
  margin: 8px 0;
  @include shadow();
  box-sizing: border-box;
  border: 1px solid #8884;
  transform-origin: left;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  position: relative;
  padding-left: 8px;
  border-radius: 8px;

  &.toast-card-container-enter,
  &.toast-card-container-leave-to {
    opacity: 0;
    transform: translateX(var(--card-min-width-negative));
  }
  &.toast-card-container-leave-active {
    position: absolute;
    transition: 0.3s cubic-bezier(0.6, -0.28, 0.74, 0.05);
  }
  &-header {
    @include h-center();
  }
  &-title {
    font-size: 18px;
    color: #444;
    opacity: 0.5;
    margin: 12px;
    font-weight: bold;
    flex: 1 1 auto;
    body.dark & {
      color: #999;
    }
  }
  &-dismiss {
    height: 20px;
    width: 20px;
    @include h-center();
    flex: 0 0 auto;
    padding: 16px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s ease-out;
    transform-origin: center;
    opacity: 0.5;
    box-sizing: content-box;
    &:hover {
      transform: scale(1.2);
    }
    &:active {
      transform: scale(1.1);
    }
  }
  &-message {
    color: #000;
    font-size: 14px;
    margin: 0 16px 12px 12px;
    white-space: pre-wrap;
    display: flex;
    align-items: center;
    line-height: 1.5;
    flex-wrap: wrap;
    word-break: break-all;
    max-height: 200px;
    overflow: auto;
  }
  &-border {
    position: absolute;
    border-radius: 2px;
    height: calc(100% - 10px);
    width: 4px;
    top: 5px;
    left: 0;
  }
  @each $name,
    $color in (default: #444, error: #f44336, info: #2196f3, success: #8bc34a)
  {
    &.toast-#{$name} .toast-card-border {
      background-color: $color;
    }
  }
  span,
  .link {
    display: inline-block;
    padding: 4px 6px;
    margin: 0 2px;
    background-color: #8882;
    text-decoration: none;
    color: #000;
    transition: all 0.2s ease-out;
    border-radius: 6px;
  }
  .link {
    &:hover {
      background-color: #8883;
    }
    &:active {
      background-color: #8884;
    }
  }
  .download-link,
  .download-link:hover {
    color: inherit !important;
    text-decoration: underline;
    word-break: break-all;
  }
}
</style>

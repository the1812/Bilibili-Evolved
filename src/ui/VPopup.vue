<template>
  <div class="be-popup" :class="{ open, fixed, close: !open, 'closed-style': closedStyle }">
    <slot v-if="loaded"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'VPopup',
  props: {
    open: {
      type: Boolean,
      required: false,
      default: false,
    },
    closedStyle: {
      type: Boolean,
      required: false,
      default: true,
    },
    fixed: {
      type: Boolean,
      required: false,
      default: false,
    },
    triggerElement: {
      required: false,
      default: null,
    },
    lazy: {
      type: Boolean,
      required: false,
      default: true,
    },
    autoClose: {
      type: Boolean,
      required: false,
      default: true,
    },
    autoDestroy: {
      type: Boolean,
      required: false,
      default: false,
    },
    escClose: {
      type: Boolean,
      required: false,
      default: false,
    },
    autoClosePredicate: {
      type: Function as PropType<
        (options: {
          target: HTMLElement
          element: HTMLElement
          trigger: HTMLElement | null
        }) => boolean
      >,
      required: false,
      default: null,
    },
  },
  emits: ['update:open'],
  data() {
    return {
      loaded: !this.lazy,
    }
  },
  computed: {
    trigger(): HTMLElement | null {
      if (this.triggerElement === null) {
        return null
      }
      if ('$el' in this.triggerElement) {
        return this.triggerElement.$el
      }
      return this.triggerElement
    },
  },
  watch: {
    open() {
      if (this.lazy && !this.loaded) {
        this.loaded = true
      }
      this.setAutoClose()
    },
  },
  mounted() {
    const element = this.$el as HTMLElement
    if (this.open) {
      this.setAutoClose()
    }
    if (this.escClose) {
      element.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.$emit('update:open', false)
        }
      })
    }
    if (this.autoDestroy) {
      element.addEventListener('transitionend', () => {
        if (!this.open) {
          this.loaded = false
        }
      })
    }
  },
  methods: {
    openHandler(e: Event) {
      const targetElement = e.target as HTMLElement
      const toastContainer = document.querySelector('.toast-card-container')
      let isOutside =
        targetElement !== this.trigger &&
        !this.trigger?.contains(targetElement) &&
        targetElement !== this.$el &&
        !this.$el.contains(targetElement) &&
        !toastContainer?.contains(targetElement)
      if (this.autoClosePredicate) {
        isOutside =
          isOutside &&
          this.autoClosePredicate({
            target: targetElement,
            element: this.$el,
            trigger: this.trigger,
          })
      }
      if (isOutside) {
        this.$emit('update:open', false)
      }
    },
    setAutoClose() {
      if (this.autoClose /*  && this.trigger !== null */) {
        const eventTypes = ['mousedown', 'touchstart']
        eventTypes.forEach(type => {
          if (this.open) {
            document.documentElement.addEventListener(type, this.openHandler)
          } else {
            document.documentElement.removeEventListener(type, this.openHandler)
          }
        })
      }
    },
    toggle() {
      this.$emit('update:open', !this.open)
    },
  },
})
</script>

<style lang="scss">
@import './common';
.be-popup {
  position: absolute;
  z-index: 1;
  // @include shadow();
  @include round-corner();
  &.fixed {
    position: fixed;
  }
  &.close.closed-style {
    pointer-events: none;
    opacity: 0;
  }
  &.open {
    pointer-events: initial;
    opacity: 1;
  }
}
</style>

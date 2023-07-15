<template>
  <div
    class="be-popup"
    :class="{ open, fixed, close: !open, 'closed-style': closedStyle }"
    v-on="$listeners"
  >
    <slot v-if="loaded"></slot>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  name: 'VPopup',
  model: {
    prop: 'open',
    event: 'popup-change',
  },
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
      type: Function,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      loaded: !this.lazy,
    }
  },
  computed: {
    trigger() {
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
          this.$emit('popup-change', false)
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
        this.$emit('popup-change', false)
      }
    },
    setAutoClose() {
      if (this.autoClose /*  && this.trigger !== null */) {
        const eventTypes = ['mousedown', 'touchstart']
        eventTypes.forEach(type => {
          if (this.open) {
            document.documentElement.addEventListener(type, e => this.openHandler(e))
          } else {
            document.documentElement.removeEventListener(type, e => this.openHandler(e))
          }
        })
      }
    },
    toggle() {
      this.$emit('popup-change', !this.open)
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

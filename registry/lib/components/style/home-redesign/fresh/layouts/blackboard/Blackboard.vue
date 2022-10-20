<template>
  <div class="fresh-home-blackboard" @mouseenter="destroyTimer" @mouseleave="createTimer">
    <div class="fresh-home-header">
      <div class="fresh-home-header-title">活动</div>
      <a
        class="fresh-home-header-icon-button rotate"
        href="https://www.bilibili.com/blackboard/x/act_list/"
        target="_blank"
      >
        <VButton round>
          <VIcon icon="mdi-dots-horizontal" :size="20"></VIcon>
          更多
        </VButton>
      </a>
    </div>
    <input
      v-for="(b, i) of blackboards"
      :id="'blackboard' + i"
      :key="i"
      class="fresh-home-blackboard-radio"
      type="radio"
      name="blackboard"
      :checked="i === 0"
      :data-index="i"
    />
    <div class="fresh-home-blackboard-cards">
      <a
        v-for="(b, i) of blackboards"
        :key="i"
        class="fresh-home-blackboard-card"
        target="_blank"
        :href="b.url"
        :title="b.title"
      >
        <DpiImage
          class="fresh-home-blackboard-card-image"
          :src="b.imageUrl"
          :alt="b.title"
          :size="{ width: 500, height: 250 }"
          :intersection="{ root: cardsContainer }"
        />
        <div class="fresh-home-blackboard-card-title" :title="b.title">
          {{ b.title }}
        </div>
      </a>
    </div>
    <div class="fresh-home-blackboard-jump-dots">
      <label v-for="(b, i) of blackboards" :key="i" :for="'blackboard' + i">
        <div class="fresh-home-blackboard-jump-dot"></div>
      </label>
    </div>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon, DpiImage } from '@/ui'
import { getBlackboards } from './api'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    DpiImage,
  },
  data() {
    return {
      blackboards: [],
      timer: 0,
    }
  },
  computed: {
    cardsContainer() {
      return this.$el.querySelector('.fresh-home-blackboard-cards')
    },
  },
  async created() {
    const blackboards = await getBlackboards()
    this.blackboards = blackboards.filter(b => !b.isAd)
  },
  mounted() {
    this.createTimer()
  },
  beforeDestroy() {
    this.destroyTimer()
  },
  methods: {
    createTimer() {
      if (this.timer) {
        return
      }
      const radioClass = 'fresh-home-blackboard-radio'
      this.timer = window.setInterval(() => {
        if (!document.hasFocus() || this.$el.matches(':hover')) {
          return
        }
        const currentIndex = parseInt(dq(`.${radioClass}:checked`).getAttribute('data-index'))
        let targetIndex: number
        if (currentIndex === this.blackboards.length - 1) {
          targetIndex = 0
        } else {
          targetIndex = currentIndex + 1
        }
        ;(dq(`.${radioClass}[data-index='${targetIndex}']`) as HTMLInputElement).checked = true
      }, 5000)
    },
    destroyTimer() {
      if (!this.timer) {
        return
      }
      window.clearInterval(this.timer)
      this.timer = 0
    },
  },
})
</script>
<style lang="scss">
@import 'common';

$max-card-count: 16;
.fresh-home {
  &-blackboard {
    position: relative;
    &,
    & * {
      transition: 0.2s ease-out;
    }
    &-cards {
      display: flex;
      --blackboard-width: 350px;
      --blackboard-width-without-border: calc(var(--blackboard-width) - 2px);
      --blackboard-height: var(--home-content-height);
      --image-height: 197px;
      width: var(--blackboard-width);
      height: var(--blackboard-height);
      box-shadow: var(--home-card-shadow);
      border: var(--home-card-border);
      border-radius: var(--home-card-radius);
      background-color: var(--home-background-color);
      overflow: hidden;
    }
    &-card {
      flex: 0 0 auto;
      width: 100%;
      height: 100%;
      position: relative;
      display: block;
      transition: 0.8s cubic-bezier(0.44, 0.29, 0.13, 1);
      &,
      body.dark &,
      &:hover {
        color: inherit !important;
      }
      &-image {
        width: 100%;
        height: var(--image-height);
        object-fit: fill;
        display: block;
        border-radius: 12px;
        transition-duration: inherit;
      }
      &-title {
        $bottom: 16px;
        position: absolute;
        bottom: $bottom;
        left: 50%;
        transform: translateX(-50%);
        padding: 0 16px;
        font-size: 14px;
        @include semi-bold();
        line-height: calc(var(--blackboard-height) - var(--image-height) - #{$bottom});
        border-radius: 14px;
        max-width: var(--blackboard-width);
        box-sizing: border-box;
        @include single-line();
      }
    }
    &-radio {
      display: none;
      @for $i from 1 to $max-card-count {
        &:checked:nth-of-type(#{$i})
          ~ .fresh-home-blackboard-jump-dots
          label:nth-child(#{$i})
          .fresh-home-blackboard-jump-dot {
          background-color: var(--theme-color);
          width: 40px;
        }
        &:checked:nth-of-type(#{$i}) ~ .fresh-home-blackboard-cards .fresh-home-blackboard-card {
          transform: translateX(calc(-1 * #{$i - 1} * var(--blackboard-width-without-border)))
            scale(0.9);
          &:nth-of-type(#{$i}) {
            transform: translateX(calc(-1 * #{$i - 1} * var(--blackboard-width-without-border)));
            img {
              border-radius: var(--home-card-radius) var(--home-card-radius) 0 0;
            }
          }
        }
      }
    }
    &-jump-dots {
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      @include h-center();
      label {
        display: block;
        padding: 8px 6px;
        cursor: pointer;
      }
    }
    &-jump-dot {
      background-color: #8884;
      box-sizing: border-box;
      width: 20px;
      height: 8px;
      border-radius: 8px;
    }
  }
}
</style>

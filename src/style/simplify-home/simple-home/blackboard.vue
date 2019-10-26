<template>
  <div class="blackboards">
    <div class="header">
      <div class="title">活动</div>
      <a class="more">
        <icon type="mdi" icon="dots-horizontal"></icon>更多
      </a>
    </div>
    <input
      class="hidden-input blackboard-radio"
      type="radio"
      name="blackboard"
      v-for="(b, i) of blackboards"
      :checked="i === 0"
      :id="'blackboard' + i"
      :data-index="i"
      :key="i"
    />
    <div class="jump-dots">
      <label v-for="(b, i) of blackboards" :for="'blackboard' + i" :key="i">
        <div class="jump-dot"></div>
      </label>
    </div>
    <div class="blackboard-cards">
      <a
        class="blackboard-card"
        target="_blank"
        v-for="(b, i) of blackboards"
        :key="i"
        :href="b.url"
        :title="b.title"
      >
        <dpi-img :src="b.imageUrl" :alt="b.title" :size="{width: 500, height: 250}" :root="cardsContainer"></dpi-img>
        <div class="title">{{b.title}}</div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { Blackboard } from './blackboard'
export default {
  components: {
    Icon: () => import('../../icon.vue'),
    'dpi-img': () => import('../../dpi-img.vue'),
  },
  data() {
    return {
      blackboards: [] as Blackboard[],
      interval: 0
    }
  },
  destroyed() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  computed: {
    cardsContainer() {
      return this.$el.querySelector('.blackboard-cards')
    }
  },
  async mounted() {
    const { getBlackboards } = await import('./blackboard')
    this.blackboards = (await getBlackboards()).filter(it => !it.isAd)
    const blackboards = dq('.blackboards') as HTMLDivElement
    this.interval = setInterval(() => {
      if (!document.hasFocus() || blackboards.matches('.blackboards:hover')) {
        return
      }
      const currentIndex = parseInt(
        dq(`.blackboard-radio:checked`)!.getAttribute('data-index')!
      )
      let targetIndex: number
      if (currentIndex === this.blackboards.length - 1) {
        targetIndex = 0
      } else {
        targetIndex = currentIndex + 1
      }
      ;(dq(
        `.blackboard-radio[data-index='${targetIndex}']`
      ) as HTMLInputElement).checked = true
    }, 5000)
  }
}
</script>

<style lang="scss">
$first-row-height: 250px;
.simple-home .blackboards {
  display: grid;
  grid-template-areas: 'header header' 'dots cards';
  grid-template-columns: 8px 1fr;
  grid-template-rows: 1fr $first-row-height;
  row-gap: 16px;
  column-gap: 16px;
  align-self: start;
  justify-self: center;

  .blackboard-cards {
    grid-area: cards;
    --blackboard-width: 500px;
    --blackboard-height: 250px;
    width: var(--blackboard-width);
    height: var(--blackboard-height);
    border-radius: 16px;
    overflow: hidden;
    .blackboard-card {
      width: 100%;
      height: 100%;
      position: relative;
      display: block;
      transition: 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
      img {
        width: 100%;
        height: 100%;
        object-fit: fill;
        display: block;
      }
      .title {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 16px;
        color: white;
        background-color: #000a;
        font-size: 14px;
        font-weight: bold;
        border-radius: 14px;
        white-space: nowrap;
        opacity: 0;
      }
      &:hover .title {
        opacity: 1;
      }
    }
  }
}
</style>
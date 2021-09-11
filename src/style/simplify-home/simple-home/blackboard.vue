<template>
  <div class="blackboards">
    <div class="header">
      <div class="title">活动</div>
      <a class="more" href="https://www.bilibili.com/blackboard/x/act_list/" target="_blank">
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
        <div class="title" :title="b.title">{{b.title}}</div>
      </a>
    </div>
    <div class="jump-dots">
      <label v-for="(b, i) of blackboards" :for="'blackboard' + i" :key="i">
        <div class="jump-dot"></div>
      </label>
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
  position: relative;
  display: grid;
  grid-template-areas: 'header header' 'cards cards';
  grid-template-columns: 8px 1fr;
  grid-template-rows: 1fr $first-row-height;
  row-gap: 16px;
  column-gap: 16px;
  align-self: start;

  .jump-dots {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    grid-area: cards;
    align-self: center;
    justify-self: center;
    display: flex;
    align-items: center;
    & label {
      display: block;
      padding: 8px 6px;
      cursor: pointer;
    }
    .jump-dot {
      background-color: #8884;
      box-sizing: border-box;
      width: 20px;
      height: 8px;
      border-radius: 8px;
    }
  }
  .blackboard-cards {
    display: flex;
    grid-area: cards;
    --blackboard-width: 350px;
    --blackboard-height: 250px;
    --image-height: 197px;
    width: var(--blackboard-width);
    height: var(--blackboard-height);
    border-radius: 16px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 4px 8px 0 #0001;
    body.dark & {
      background-color: #282828;
    }

    .blackboard-card {
      flex: 0 0 auto;
      width: 100%;
      height: 100%;
      position: relative;
      display: block;
      transition: 0.8s cubic-bezier(0.44, 0.29, 0.13, 1);
      img {
        width: 100%;
        height: var(--image-height);
        object-fit: fill;
        display: block;
        border-radius: 12px;
        transition-duration: inherit;
      }
      .title {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 0 16px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 14px;
        max-width: var(--blackboard-width);
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
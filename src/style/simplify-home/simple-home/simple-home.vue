<template>
  <div class="simple-home">
    <div class="blackboards">
      <div class="header">
        <div class="title">活动</div>
        <div class="more">
          <icon type="mdi" icon="dots-horizontal"></icon>更多
        </div>
      </div>
      <div class="jump-dots">
        <div
          class="jump-dot"
          v-for="(b, i) of blackboards"
          :key="i"
          :class="{active: i === currentBlackboardIndex}"
        ></div>
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
          <img :src="b.imageUrl" :alt="b.title" />
          <div class="title">{{b.title}}</div>
        </a>
      </div>
    </div>
    <div class="rankings">
      <div class="header">

      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Blackboard } from './blackboard'
export default {
  components: {
    Icon: () => import('../../icon.vue'),
  },
  data() {
    return {
      blackboards: [] as Blackboard[],
      currentBlackboardIndex: 0
    }
  },
  async mounted() {
    const { getBlackboards } = await import('./blackboard')
    this.blackboards = getBlackboards().filter(it => !it.isAd)
  },
}
</script>
<style lang="scss">
.simple-home {
  --title-color: black;
  color: #444;

  body.dark & {
    --title-color: white;
    color: #ddd;
  }
  .more {
    background-color: #ddd;
    cursor: pointer;
    padding: 2px 16px 2px 8px;
    display: flex;
    align-items: center;
    border-radius: 16px;
    font-size: 14px;
    .be-icon {
      margin-right: 8px;
      transition: .3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    &:hover {
      .be-icon {
        transform: rotate(180deg);
      }
    }
    body.dark & {
      background-color: #333;
    }
  }
  .blackboards {
    display: grid;
    grid-template-areas: 'header header' 'dots cards';
    grid-template-columns: 8px 1fr;
    grid-template-rows: 1fr 250px;
    row-gap: 16px;
    column-gap: 16px;

    .header {
      grid-area: header;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        color: var(--title-color);
        font-weight: bold;
        font-size: 24px;
      }
    }
    .jump-dots {
      grid-area: dots;
      align-self: center;
      justify-self: center;
      .jump-dot {
        background-color: #ddd;
        width: 8px;
        height: 20px;
        border-radius: 8px;
        cursor: pointer;
        &.active {
          background-color: var(--theme-color);
          height: 40px;
        }
        &:not(:last-child) {
          margin-bottom: 6px;
        }
        body.dark &:not(.active) {
          background-color: #444;
        }
      }
    }
    .blackboard-cards {
      grid-area: cards;
      width: 500px;
      height: 250px;
      overflow: auto;
      scroll-snap-type: y mandatory;
      scrollbar-width: none !important;
      &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
      }
      .blackboard-card {
        width: 100%;
        height: 100%;
        scroll-snap-align: start;
        position: relative;
        display: block;
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          border-radius: 16px;
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
        }
      }
    }
  }
}
</style>
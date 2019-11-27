<template>
  <div class="slideshow-cards">
    <div class="error" v-if="error"></div>
    <template v-if="!error && cards.length >= 7">
      <a
        class="slideshow-card"
        target="_blank"
        v-for="card of cardQueue"
        :key="card.id"
        :href="'https://www.bilibili.com/av' + card.aid"
        :title="card.title"
      >
        <img :src="card.coverUrl" :alt="card.title" />
      </a>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  props: ['cards', 'error'],
  data() {
    return {
      cardQueue: []
    }
  },
  methods: {
    regenerateQueue() {
      if (this.cards.length < 7) {
        return
      }
      const cardQueue = [...this.cards]
      cardQueue.unshift(cardQueue.pop())
      this.cardQueue = cardQueue
      console.log(cardQueue)
    }
  },
  watch: {
    cards() {
      this.regenerateQueue()
    }
  },
  computed: {
    currentCard() {
      return this.cardQueue[1]
    }
  },
  mounted() {
    this.regenerateQueue()
  }
}
</script>

<style lang="scss">
.slideshow-cards {
  display: grid;
  position: relative;
  --card-height: 300px;
  --card-width: 500px;
  grid-template: 'cards operations info' var(--card-height) / var(--card-width) 64px 1fr;
  @media screen and (max-width: 1400px) {
    & {
      --card-height: 200px;
      --card-width: 334px;
    }
  }
  .error {
    grid-column: 1 / 4;
    align-self: stretch;
    justify-self: stretch;
  }
  .slideshow-card {
    grid-area: cards;
    cursor: pointer;
    align-self: stretch;
    justify-self: stretch;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    &:not(:first-child) {
      transform-origin: right;
    }
    &:not(:nth-child(2)) {
      pointer-events: none;
      transform: translateX(39px) scale(0.45);
      opacity: 0;
    }
    img {
      border-radius: 16px;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  @for $i from 1 to 8 {
    .slideshow-card:nth-child(#{$i}) {
      z-index: #{8 - $i};
    }
  }
  .slideshow-card:first-child {
    transform: translateX(-10%) scale(1.1);
    opacity: 0;
  }
  .slideshow-card:nth-child(2) {
    pointer-events: initial;
  }
  .slideshow-card:nth-child(3) {
    transform: translateX(20px) scale(0.9);
    opacity: 0.5;
  }
  .slideshow-card:nth-child(4) {
    transform: translateX(30px) scale(0.75);
    opacity: 0.25;
  }
  .slideshow-card:nth-child(5) {
    transform: translateX(35px) scale(0.65);
    opacity: 0.125;
  }
  .slideshow-card:nth-child(6) {
    transform: translateX(37.5px) scale(0.5);
    opacity: 0.0625;
  }
}
</style>
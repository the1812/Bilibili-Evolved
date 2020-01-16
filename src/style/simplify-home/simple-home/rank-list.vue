<template>
  <div class="rank">
    <div class="area-header">排行榜</div>
    <a
      class="rank-item"
      v-for="(c, index) of videos"
      :key="c.id"
      target="_blank"
      :href="'https://www.bilibili.com/av' + c.aid"
    >
      <div class="cover">
        <dpi-img :src="c.coverUrl" :size="{ width: 370 }"></dpi-img>
      </div>
      <div class="rank-number">{{index + 1}}</div>
      <div
        v-if="index === 0 || index > 2"
        class="title"
        :title="index === 0 ? c.title : null"
      >{{c.title}}</div>
      <div
        class="watchlater"
        v-if="c.watchlater !== null"
        :title="watchlaterList.includes(c.aid) ? '已添加' : '稍后再看'"
        @click.prevent="toggleWatchlater(c.aid)"
      >
        <icon v-if="watchlaterList.includes(c.aid)" type="mdi" icon="check-circle"></icon>
        <icon v-else type="mdi" icon="clock-outline"></icon>
      </div>
      <div class="details">
        <div v-if="index > 0 && index < 3" class="title" :title="c.title">{{c.title}}</div>
        <div v-if="index > 0 && index < 3" class="cover">
          <dpi-img :src="c.coverUrl" :size="{ width: 370 }"></dpi-img>
        </div>
        <div class="up">
          <div class="points">
            <icon icon="fire" type="mdi"></icon>
            {{c.points | bigNumber}}
          </div>
          <div class="up-info">
            <icon icon="up" type="extended"></icon>
            <div class="up-name">{{c.upName}}</div>
          </div>
        </div>
        <div class="stats">
          <icon type="extended" icon="play"></icon>
          <div class="number">{{c.playCount | bigNumber}}</div>
          <icon type="extended" icon="coin"></icon>
          <div class="number">{{c.coins | bigNumber}}</div>
          <icon type="extended" icon="favorites"></icon>
          <div class="number">{{c.favorites | bigNumber}}</div>
        </div>
      </div>
    </a>
  </div>
</template>

<script lang="ts">
export default {
  props: ['videos'],
  filters: {
    bigNumber(value: number) {
      return formatCount(value)
    }
  },
  components: {
    Icon: () => import('../../icon.vue'),
    DpiImg: () => import('../../dpi-img.vue'),
  },
  computed: {
    ...Vuex.mapState(['watchlaterList'])
  },
  methods: {
    ...Vuex.mapActions(['toggleWatchlater']),
  }
}
</script>

<style lang="scss">
</style>
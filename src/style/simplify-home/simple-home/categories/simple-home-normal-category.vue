<template>
  <div
    class="category-view"
    :class="{'new-activity-loading': newActivity.loading,'new-post-loading': newPost.loading,'rank-loading': rank.loading}"
  >
    <div class="new-activity loading"></div>
    <div class="new-post loading"></div>
    <div class="rank loading"></div>
    <slideshow-cards class="new-activity" :cards="newActivity.videos" :error="newActivity.error"></slideshow-cards>
    <slideshow-cards class="new-post" :cards="newPost.videos" :error="newPost.errors"></slideshow-cards>
    <div class="rank"></div>
  </div>
</template>

<script lang="ts">
// 有新动态 https://api.bilibili.com/x/web-interface/dynamic/region?ps=10&rid=1
// 最新发布 https://api.bilibili.com/x/web-interface/newlist?ps=10&rid=1
// 排行 https://api.bilibili.com/x/web-interface/ranking/region?rid=1&day=3&original=0
export default {
  components: {
    SlideshowCards: () => import('../slideshow-cards.vue')
  },
  props: {
    rid: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      newActivity: {
        error: false,
        loading: true,
        videos: []
      },
      newPost: {
        error: false,
        loading: true,
        videos: []
      },
      rank: {
        error: false,
        loading: true,
        videos: []
      }
    }
  },
  mounted() {
    console.log(this.rid)
  }
}
</script>

<style lang="scss">
.category-view {
  display: grid;
  grid-template:
    'new-activity rank' 1fr
    'new-post rank' 1fr / 3fr 1fr;
  grid-gap: 24px;
  gap: 24px;
  &,
  & *,
  ::after,
  ::before {
    transition: 0.2s ease-out;
  }
  @keyframes normal-category-loading {
    from {
      background-color: #8882;
    }
    to {
      background-color: #8881;
    }
  }
  .loading {
    opacity: 0;
    pointer-events: none;
    height: 100%;
    width: 100%;
    border-radius: 16px;
    animation: .64s infinite alternate normal-category-loading ease-in-out;
    &.new-activity {
      height: 40vh;
    }
  }
  @each $name in ('new-activity', 'new-post', 'rank') {
    .#{$name} {
      grid-area: unquote($name);
    }
    &.#{$name}-loading {
      .#{$name}.loading {
        opacity: 1;
        pointer-events: initial;
      }
      .#{$name}:not(.loading) {
        opacity: 0;
        pointer-events: none;
      }
    }
  }
}
</style>
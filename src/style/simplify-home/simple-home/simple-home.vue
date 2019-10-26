<template>
  <div class="simple-home">
    <blackboards></blackboards>
    <trending-videos></trending-videos>
    <info-row></info-row>
    <feeds></feeds>
  </div>
</template>
<script lang="ts">
export default {
  components: {
    Blackboards: () => import('./blackboard.vue'),
    TrendingVideos: () => import('./trending-videos.vue'),
    InfoRow: () => import('./online-info-row.vue'),
    Feeds: () => import('./simple-home-feeds.vue'),
  },
}
</script>
<style lang="scss">
.simple-home {
  --title-color: black;
  color: #444;
  display: grid;
  grid-template-areas: 'blackboards trendings' 'info info' 'feeds feeds' 'categories categories';
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(4, auto);
  column-gap: 44px;
  row-gap: 16px;
  @media screen and (max-width: 900px) {
    & {
      grid-template-areas: 'blackboards' 'trendings' 'info' 'feeds' 'categories';
      grid-template-columns: 1fr;
      grid-template-rows: repeat(5, auto);
    }
  }
  &,
  & * {
    transition: 0.2s ease-out;
  }
  body.dark & {
    --title-color: white;
    color: #ddd;
  }
  .jump-dots {
    grid-area: dots;
    align-self: center;
    justify-self: center;
    & label {
      display: block;
    }
    & label:not(:last-child) {
      margin-bottom: 6px;
    }
    .jump-dot {
      background-color: #ddd;
      width: 8px;
      height: 20px;
      border-radius: 8px;
      cursor: pointer;
      body.dark & {
        background-color: #444;
      }
    }
  }
  .hidden-input {
    display: none;
    @for $i from 1 to 16 {
      &:checked:nth-of-type(#{$i})
        ~ .jump-dots
        label:nth-child(#{$i})
        .jump-dot {
        background-color: var(--theme-color);
        height: 40px;
      }
      &:checked:nth-of-type(#{$i}) ~ .blackboard-cards .blackboard-card {
        transform: translateY(calc(-1 * #{$i - 1} * var(--blackboard-height)));
      }
    }
  }
  .more {
    cursor: pointer;
    padding: 2px 16px 2px 8px;
    display: flex;
    align-items: center;
    border-radius: 16px;
    font-size: 14px;
    .be-icon {
      margin-right: 8px;
      transition: 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    &:hover {
      .be-icon {
        transform: rotate(180deg);
      }
    }
    &, &.hover {
      color: inherit !important;
      background-color: #ddd !important;
    }
    body.dark &, body.dark &:hover {
      color: inherit !important;
      background-color: #333 !important;
    }
  }
  .header {
    grid-area: header;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      color: var(--title-color);
      font-weight: bold;
      font-size: 22px;
    }
  }

  .blackboards {
    grid-area: blackboards;
  }
  .trendings {
    grid-area: trendings;
    transform: translateX(8px);
  }
  .info-row {
    grid-area: info;
  }
  .feeds {
    grid-area: feeds;
  }
}
</style>
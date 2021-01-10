<template>
  <div class="simple-home" :class="{ snap }">
    <blackboards></blackboards>
    <trending-videos></trending-videos>
    <info-row></info-row>
    <feeds></feeds>
    <categories></categories>
  </div>
</template>
<script lang="ts">
export default {
  components: {
    Blackboards: () => import('./blackboard.vue'),
    TrendingVideos: () => import('./trending-videos.vue'),
    InfoRow: () => import('./online-info-row.vue'),
    Feeds: () => import('./simple-home-feeds.vue'),
    Categories: () => import('./categories/simple-home-categories.vue')
  },
  data() {
    return {
      snap: false,
    }
  },
  mounted() {
    addSettingsListener('simpleHomeWheelScroll', (value: boolean) => {
      this.snap = !value
    }, true)
  },
}
</script>
<style lang="scss">
.simple-home {
  --title-color: black;
  color: #444;
  display: grid;
  grid-template-areas:
    'blackboards trendings trendings'
    'feeds feeds info'
    'categories categories categories';
  grid-template-columns: auto 1fr auto;
  grid-template-rows: repeat(3, auto);
  column-gap: 32px;
  row-gap: 16px;
  &,
  & * {
    transition: 0.2s ease-out;
  }
  body.dark & {
    --title-color: white;
    color: #ddd;
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
  .toggle-reorder,
  .more {
    cursor: pointer;
    padding: 4px 12px 4px 8px;
    display: flex;
    align-items: center;
    border-radius: 16px;
    font-size: 13px;
    font-weight: bold;
    line-height: 24px;
    .be-icon {
      margin-right: 8px;
      transition: 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      font-size: 22px;
      font-weight: normal;
    }
    &:not(.toggle-reorder):hover {
      .be-icon {
        transform: rotate(180deg);
      }
    }
    &,
    &.hover {
      color: inherit !important;
      background-color: #ddd !important;
    }
    body.dark &,
    body.dark &:hover {
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
    .tabs {
      display: flex;
      align-items: center;
      .tab {
        cursor: pointer;
        position: relative;
        white-space: nowrap;
        .tab-name {
          opacity: 0.5;
          font-size: 14px;
        }
        &:not(:last-child) {
          margin-right: 24px;
        }
        &::after {
          content: '';
          width: calc(80%);
          height: 3px;
          border-radius: 2px;
          position: absolute;
          background-color: var(--theme-color);
          left: 10%;
          bottom: -6px;
          transform: scaleX(0);
          transition: 0.2s ease-out;
        }
        &.active::after {
          transform: scaleX(1);
        }
        &.active .tab-name {
          font-weight: bold;
          opacity: 1;
          transform: scale(1.1);
        }
      }
    }
  }
  .sub-header {
    color: var(--title-color);
    font-weight: bold;
    font-size: 18px;
    display: flex;
    align-items: center;
    &::before {
      content: '';
      display: block;
      width: 12px;
      height: 12px;
      background-color: var(--theme-color);
      border-radius: 50%;
      margin-right: 8px;
    }
  }
  .blackboards {
    grid-area: blackboards;
    justify-self: start;
  }
  .trendings {
    grid-area: trendings;
    transform: translateX(8px);
    justify-self: end;
  }
  .info-row {
    grid-area: info;
    justify-self: end;
  }
  .feeds {
    grid-area: feeds;
    transform: translateX(-8px);
    justify-self: start;
  }
  .categories {
    grid-area: categories;
    padding-bottom: 32px;
  }
  @media screen and (max-width: 1100px) {
    & {
      grid-template-areas: 'blackboards' 'trendings' 'info' 'feeds' 'categories';
      grid-template-columns: 1fr;
      grid-template-rows: repeat(5, auto);
      .blackboards,
      .trendings,
      .info-row,
      .feeds,
      .categories {
        justify-self: center;
      }
    }
    .info-row {
      display: none;
    }
    .trendings,
    .feeds {
      transform: translateX(0);
    }
  }
}
</style>
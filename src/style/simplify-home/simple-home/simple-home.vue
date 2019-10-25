<template>
  <div class="simple-home">
    <blackboards></blackboards>
    <trending-videos></trending-videos>
    <info-row></info-row>
  </div>
</template>
<script lang="ts">
export default {
  components: {
    Blackboards: () => import('./blackboard.vue'),
    TrendingVideos: () => import('./trending-videos.vue'),
    InfoRow: () => import('./online-info-row.vue'),
  },
}
</script>
<style lang="scss">
.simple-home {
  --title-color: black;
  color: #444;
  display: grid;
  grid-template-areas: 'blackboards trendings' 'info info' 'categories categories';
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(3, auto);
  column-gap: 44px;
  row-gap: 32px;
  @media screen and (max-width: 900px) {
    & {
      grid-template-areas: 'blackboards' 'trendings' 'info' 'categories';
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, auto);
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
    background-color: #ddd;
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
    body.dark & {
      background-color: #333;
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
}
</style>
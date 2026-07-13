<template>
  <HomeRedesignBase>
    <div class="search-home">
      <div class="search-home-bar">
        <LaunchBar />
      </div>
    </div>
  </HomeRedesignBase>
</template>
<script lang="ts">
import LaunchBar from '@/components/launch-bar/LaunchBar.vue'
import HomeRedesignBase from '../HomeRedesignBase.vue'

export default Vue.extend({
  components: {
    HomeRedesignBase,
    LaunchBar,
  },
})
</script>
<style lang="scss">
@import 'common';

.search-home {
  flex-grow: 1;
  width: 100%;
  min-height: calc(100vh - 64px);
  padding: 24px 16px 48px;
  box-sizing: border-box;
  background: transparent;
  @include v-center();
  justify-content: center;

  &-bar {
    width: min(640px, 92vw);

    .launch-bar {
      font-size: 16px;
      padding: 10px 16px;
      border-radius: 24px;
      border: 1px solid #8884;
      background-color: rgba(255, 255, 255, 0.92);
      box-shadow: var(--home-card-shadow, 0 4px 12px 0 rgba(0, 0, 0, 0.05));
      transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;

      body.dark & {
        background-color: rgba(40, 40, 40, 0.92);
        color: #eee;
      }

      &:hover,
      &:focus-within {
        border-color: var(--theme-color, #00a1d6);
        box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
      }

      .input-area .launch-bar-form .input {
        width: 100%;
        padding: 10px 8px;
        font-size: 16px;
      }

      .launch-bar-suggest-list {
        margin-top: 8px;
        border-radius: 12px;
      }
    }
  }
}
</style>

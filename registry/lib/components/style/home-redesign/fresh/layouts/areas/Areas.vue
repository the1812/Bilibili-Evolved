<template>
  <div class="fresh-home-areas">
    <div class="fresh-home-header">
      <div class="fresh-home-header-title">栏目</div>
    </div>
    <div class="fresh-home-areas-content">
      <a class="fresh-home-areas-content-primary" :href="primary.url" target="_blank">
        <div class="fresh-home-areas-content-primary-image"></div>
        <div class="fresh-home-areas-content-primary-title">
          {{ primary.title }}
        </div>
      </a>
      <div class="fresh-home-areas-content-other">
        <a v-for="other of others" :key="other.title" :href="other.url" target="_blank">
          <VButton type="transparent">
            <VIcon colored :icon="other.icon" :size="22" />
            {{ other.title }}
          </VButton>
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { addData } from '@/plugins/data'
import { VButton, VIcon } from '@/ui'
import LiveColored from './live.svg'
import TopicColored from './topic.svg'
import BlackRoomColored from './black-room.svg'

addData('ui.icons', (icons: Record<string, string>) => {
  icons['live-colored'] = LiveColored
  icons['topic-colored'] = TopicColored
  icons['black-room-colored'] = BlackRoomColored
})
const primary = {
  title: '专栏',
  url: 'https://www.bilibili.com/read/home',
}
const others = [
  {
    title: '直播',
    url: 'https://live.bilibili.com/',
    icon: 'live-colored',
  },
  {
    title: '专题',
    url: 'https://www.bilibili.com/blackboard/topic_list.html',
    icon: 'topic-colored',
  },
  {
    title: '小黑屋',
    url: 'https://www.bilibili.com/blackroom/',
    icon: 'black-room-colored',
  },
]
export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  data() {
    return {
      primary,
      others,
    }
  },
})
</script>
<style lang="scss">
@import 'common';

.fresh-home-areas {
  @include v-stretch();
  &-content {
    --areas-width: 350px;
    --areas-height: var(--home-content-height);
    width: var(--areas-width);
    height: var(--areas-height);
    border-radius: var(--home-card-radius);
    background-color: var(--home-background-color);
    box-shadow: var(--home-card-shadow);
    border: var(--home-card-border);
    overflow: hidden;
    @include v-stretch();
    &-primary {
      position: relative;
      &-image {
        background-size: cover;
        width: 100%;
        height: 202px;
        background-image: url('./column.jpg');
      }
      &-title {
        position: absolute;
        left: 16px;
        bottom: 8px;
        font-size: 18px;
        @include semi-bold();
        transition: color 0.2s ease-out, text-shadow 0.2s ease-out;

        html[fresh-home--options--area-primary-title-color='dark'] & {
          color: black;
        }

        html[fresh-home--options--area-primary-title-color='light'] & {
          color: #fafafa;
          text-shadow: rgba(0, 0, 0, 0.2) 0 0 8px;
        }
      }
    }
    &-other {
      flex: 1;
      padding: 6px;
      @include h-stretch();
      a {
        flex: 1 0 0;
        @include h-stretch();
      }
      .be-button {
        font-size: 14px;
        flex: 1;
        .be-icon {
          margin-right: 6px;
        }
      }
    }
  }
}
</style>

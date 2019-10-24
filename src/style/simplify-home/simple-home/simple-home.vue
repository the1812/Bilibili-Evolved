<template>
  <div class="simple-home">
    <blackboards></blackboards>
    <trending-videos></trending-videos>
    <div class="info">
      <div class="online">在线人数: {{online}}</div>
      <div class="entries">
        <a
          class="entry"
          v-for="entry of entries"
          :key="entry.name"
          :href="entry.url"
          target="_blank"
          :style="{backgroundColor: entry.color}"
        >
          <svg class="icon" viewBox="0 0 1024 1024" v-html="entry.icon" />
          {{entry.name}}
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
interface InfoEntry {
  name: string
  url: string
  color: string
  icon: string
}
const entries: InfoEntry[] = [
  {
    name: '专栏',
    url: 'https://www.bilibili.com/read/home',
    color: '#62E2FF66',
    icon: `
      <path
        d="M778.496 142.08h-537.6a56.832 56.832 0 0 0-60.16 54.016v630.528a56.832 56.832 0 0 0 59.136 54.016h537.6a56.832 56.832 0 0 0 59.136-54.016V196.096a56.832 56.832 0 0 0-59.136-54.016z"
        fill="#54E2E2"></path>
      <path
        d="M298.496 679.168h421.376a25.6 25.6 0 0 0 0-52.736H298.496a25.6 25.6 0 1 0 0 52.736zM719.872 732.928H298.496a25.6 25.6 0 1 0 0 52.736h421.376a25.6 25.6 0 0 0 0-52.736z"
        fill="#23ADE5"></path>
      <path
        d="M272.128 237.056m80.128 0l314.112 0q80.128 0 80.128 80.128l0 154.368q0 80.128-80.128 80.128l-314.112 0q-80.128 0-80.128-80.128l0-154.368q0-80.128 80.128-80.128Z"
        fill="#23ADE5"></path>
      <path d="M404.992 361.472m-49.408 0a49.408 49.408 0 1 0 98.816 0 49.408 49.408 0 1 0-98.816 0Z" fill="#2EC3E5">
      </path>
      <path d="M375.552 551.936l120.832-144.384a44.544 44.544 0 0 1 68.352 0l120.832 144.384z" fill="#2EC3E5"></path>
    `
  },
  {
    name: '直播',
    url: 'https://live.bilibili.com/',
    color: '#A5B8FF66',
    icon: `
      <path d="M392.448 332.8a92.416 92.416 0 1 1-92.416-92.416A92.416 92.416 0 0 1 392.448 332.8" fill="#23ADE5">
      </path>
      <path
        d="M572.928 426.24A143.872 143.872 0 1 0 429.312 281.6a143.872 143.872 0 0 0 143.616 144.64zM826.624 521.472l-63.744 36.864v-48.64A72.192 72.192 0 0 0 691.2 437.76H190.72a72.192 72.192 0 0 0-71.936 71.936v295.424a71.936 71.936 0 0 0 71.936 71.936H691.2a71.936 71.936 0 0 0 71.936-71.936v-23.808L826.624 819.2a51.2 51.2 0 0 0 76.8-44.544V565.76a51.2 51.2 0 0 0-76.8-44.288z"
        fill="#48CFE5"></path>
      <path
        d="M425.216 569.856l124.16 71.936a25.6 25.6 0 0 1 0 42.496l-124.16 71.68a25.6 25.6 0 0 1-37.12-21.248v-143.36a25.6 25.6 0 0 1 37.12-21.504"
        fill="#FDDE80"></path>
    `
  },
  {
    name: '话题',
    url: 'https://www.bilibili.com/blackboard/topic_list.html',
    color: '#A1FF8066',
    icon: `
      <path
      d="M880.64 520.448C880.64 642.56 768 742.4 627.712 742.4H409.6l-165.632 74.496-92.928-258.56a146.688 146.688 0 0 1-3.072-37.888v-37.888c0-122.112 110.592-226.56 250.112-226.56h232.704c136.448 0 249.856 104.448 249.856 226.56v37.888zM642.304 209.408h-256a280.064 280.064 0 0 0-279.04 273.152v43.776a250.88 250.88 0 0 0 3.072 46.336L215.04 878.08l183.04-90.112h244.224c153.6 0 279.04-116.48 279.04-261.632v-43.776a279.808 279.808 0 0 0-279.04-273.152z m58.112 351.744a51.2 51.2 0 0 1-51.2-51.2 55.552 55.552 0 0 1 58.112-52.48 54.528 54.528 0 0 1 51.2 55.296 57.088 57.088 0 0 1-58.112 49.408m-179.2 0a51.2 51.2 0 0 1-51.2-51.2 55.552 55.552 0 0 1 58.112-52.48 54.528 54.528 0 0 1 51.2 55.296A59.392 59.392 0 0 1 521.216 563.2m-179.2 0a51.2 51.2 0 0 1-51.2-51.2 55.552 55.552 0 0 1 58.112-52.48 54.528 54.528 0 0 1 51.2 55.296 59.648 59.648 0 0 1-58.112 49.408m279.04-270.336h-208.384c-122.112 0-224 87.296-224 188.928V512a111.36 111.36 0 0 0 3.072 31.744L267.264 768l110.592-58.112H645.12A194.048 194.048 0 0 0 842.752 512v-29.44c-2.816-104.448-102.4-191.744-223.744-191.744"
      fill="#8FC31F"></path>
    `
  },
  {
    name: '小黑屋',
    url: 'https://www.bilibili.com/blackroom/',
    color: '#FFD29E66',
    icon: `
      <path
      d="M518.656 475.904a223.488 223.488 0 0 1-23.296-75.52 366.08 366.08 0 0 1 81.408 14.592 623.104 623.104 0 0 1-58.112 60.928m-69.888-119.04c-11.52-58.112-8.704-55.296-25.6-156.928a265.984 265.984 0 0 0-78.336 46.592c51.2 104.448 60.928 165.376 92.928 290.304 51.2-5.632 211.968-40.704 226.56-130.56 8.704-64-142.336-64-215.04-49.408M486.4 624.128a263.424 263.424 0 0 0-107.52 69.632l43.52 153.6a47.872 47.872 0 0 1-92.928 23.296L216.576 473.088l-72.704-204.8c2.816-5.632 5.888-8.704 8.704-14.336l-14.592-51.2a46.08 46.08 0 0 1 32-57.856A47.616 47.616 0 0 1 228.096 179.2v2.816a334.848 334.848 0 0 1 98.816-43.52c177.152-46.592 203.264 55.04 429.824 23.296L890.368 588.8c-171.52 90.112-232.448-11.52-403.712 35.072"
      fill="#F39800"></path>
    `
  }
]
export default {
  components: {
    Blackboards: () => import('./blackboard.vue'),
    TrendingVideos: () => import('./trending-videos.vue'),
    Icon: () => import('../../icon.vue')
  },
  data() {
    return {
      online: '--',
      entries
    }
  },
  async mounted() {
    const json = await Ajax.getJson(
      'https://api.bilibili.com/x/web-interface/online'
    )
    if (json.code !== 0) {
      return
    }
    this.online = json.data.web_online
  }
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
  column-gap: 52px;
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
  }
  .info {
    grid-area: info;
  }
  .info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .online {
      padding: 8px 16px;
      height: 32px;
      border-radius: 16px;
      background-color: #8882;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }
    .entries {
      display: flex;
      align-items: center;
      .entry {
        display: flex;
        align-items: center;
        font-weight: bold;
        padding: 8px 24px 8px 16px;
        height: 32px;
        border-radius: 16px;
        font-size: 14px;
        color: inherit;
        box-sizing: border-box;

        .icon {
          margin-right: 16px;
          width: 24px;
          height: 24px;
        }
        &:not(:last-child) {
          margin-right: 24px;
        }
        @media screen and (max-width: 900px) {
          &:not(:last-child) {
            margin-right: 16px;
          }
        }
      }
    }
  }
}
</style>
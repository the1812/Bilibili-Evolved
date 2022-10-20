<template>
  <div class="messages-popup" role="list">
    <div v-for="e of entries" :key="e.name" class="message-entry" role="listitem">
      <a
        :data-prop="e.prop"
        target="_blank"
        :href="e.href"
        :data-count="e.count || null"
        @click="clearCount(e)"
        >{{ e.name }}</a
      >
    </div>
  </div>
</template>

<script lang="ts">
import { getJsonWithCredentials } from '@/core/ajax'
import { popperMixin } from '../mixins'

interface MessageEntry {
  prop?: string
  count?: number
  href: string
  name: string
}
const entries = [
  {
    prop: 'reply',
    href: 'https://message.bilibili.com/#/reply',
    name: '回复我的',
  },
  {
    prop: 'at',
    href: 'https://message.bilibili.com/#/at',
    name: '@我的',
  },
  {
    prop: 'like',
    href: 'https://message.bilibili.com/#/love',
    name: '收到的赞',
  },
  {
    prop: 'sys_msg',
    href: 'https://message.bilibili.com/#/system',
    name: '系统通知',
  },
  {
    prop: 'user_msg',
    href: 'https://message.bilibili.com/#/whisper',
    name: '我的消息',
  },
  {
    href: 'https://message.bilibili.com/#/archive',
    name: '私信存档',
  },
  {
    href: 'https://message.bilibili.com/#/config',
    name: '消息设置',
  },
] as MessageEntry[]
export default Vue.extend({
  name: 'MessagesPopup',
  mixins: [popperMixin],
  data() {
    return {
      entries: entries.map(e => {
        e.count = 0
        return e
      }),
      settings: {
        notify: true,
        hideNotFollowedCount: false,
        json: {},
      },
    }
  },
  async created() {
    await this.fetchSettings()
    this.notify()
  },
  methods: {
    popupRefresh() {
      this.notify()
    },
    async fetchSettings() {
      const json = await getJsonWithCredentials(
        'https://api.vc.bilibili.com/link_setting/v1/link_setting/get?msg_notify=1&show_unfollowed_msg=1',
      )
      if (json.code !== 0) {
        return
      }
      this.settings = {
        notify: json.data.msg_notify !== 3,
        hideNotFollowedCount: json.data.show_unfollowed_msg === 1,
        json: json.data,
      }
    },
    async notify() {
      if (!this.settings.notify) {
        return
      }
      const [mainJson, messageJson] = await Promise.all([
        getJsonWithCredentials('https://api.bilibili.com/x/msgfeed/unread'),
        getJsonWithCredentials(
          'https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread',
        ),
      ])
      mainJson.data.user_msg = messageJson.data.follow_unread || 0
      if (!this.settings.hideNotFollowedCount) {
        mainJson.data.user_msg += messageJson.data.unfollow_unread || 0
      }

      this.item.notifyCount = entries.reduce(
        (acc, it) => acc + (it.prop ? mainJson.data[it.prop] : 0),
        0,
      )
      if (!this.item.notifyCount) {
        return
      }
      console.log(entries)
      entries.forEach(e => {
        if (!e.prop) {
          return
        }
        const count = mainJson.data[e.prop] as number
        console.log(e.prop, e.count, count)
        if (count > 0) {
          e.count = count
        }
      })
    },
    clearCount(entry: MessageEntry) {
      this.item.notifyCount -= entry.count
      entry.count = 0
    },
  },
})
</script>

<style lang="scss" scoped>
@import '../nav-link';
.messages-popup {
  width: max-content;
  .message-entry {
    a {
      @include nav-link();
      &[data-count]::after {
        content: attr(data-count);
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        background-color: var(--theme-color);
        color: var(--foreground-color);
        padding: 0 6px;
        display: flex;
        justify-content: center;
        font-size: 9pt;
        border-radius: 6px;
        white-space: nowrap;
      }
    }
  }
}
</style>

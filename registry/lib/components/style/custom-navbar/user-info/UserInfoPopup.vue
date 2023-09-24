<template>
  <div class="user-info-panel">
    <div v-if="isLogin && userInfo.isLogin === true" class="logged-in">
      <a class="name" target="_blank" href="https://space.bilibili.com/">{{ userInfo.uname }}</a>
      <a class="type" target="_blank" href="https://account.bilibili.com/account/big">{{
        userType
      }}</a>
      <div v-if="userInfo.vipStatus === 1 && userInfo.vipType === 2" class="privileges row">
        <div
          class="b-coin"
          :class="{ received: privileges.bCoin.received }"
          :title="'有效期限: ' + privileges.bCoin.expire"
          @click="privilegeReceive(1)"
        >
          {{ privileges.bCoin.received ? '已领取B币' : '领取B币' }}
        </div>
        <div
          class="coupons"
          :class="{ received: privileges.coupons.received }"
          :title="'有效期限: ' + privileges.coupons.expire"
          @click="privilegeReceive(2)"
        >
          {{ privileges.coupons.received ? '已领取优惠券' : '领取优惠券' }}
        </div>
      </div>
      <div class="level-info row">
        <a
          target="_blank"
          title="等级"
          href="https://account.bilibili.com/account/record"
          class="level"
        >
          <VIcon
            v-if="userInfo.is_senior_member"
            :icon="'lv' + userInfo.level_info.current_level + '-plus'"
            colored
            :size="30"
            class="level-icon plus"
          />
          <VIcon v-else :icon="'lv' + userInfo.level_info.current_level" class="level-icon" />
        </a>
        <span class="level-progress-label"
          >{{ userInfo.level_info.current_exp }} / {{ userInfo.level_info.next_exp }}</span
        >
      </div>
      <div class="level-progress separator">
        <div class="level-progress-thumb" :style="levelProgressStyle"></div>
      </div>
      <div class="items">
        <a
          class="item"
          target="_blank"
          title="手机验证"
          href="https://passport.bilibili.com/account/security#/bindphone"
        >
          <VIcon icon="bind-phone" :size="20"></VIcon>
          <VIcon v-if="userInfo.mobile_verified" icon="ok" :size="18"></VIcon>
          <VIcon v-else icon="cancel" :size="18"></VIcon>
        </a>
        <a
          class="item"
          target="_blank"
          title="邮箱验证"
          href="https://passport.bilibili.com/account/security#/bindmail"
        >
          <VIcon icon="bind-email" :size="20"></VIcon>
          <VIcon v-if="userInfo.email_verified" icon="ok" :size="18"></VIcon>
          <VIcon v-else icon="cancel" :size="18"></VIcon>
        </a>
        <a class="item" target="_blank" href="https://account.bilibili.com/site/coin" title="硬币">
          <VIcon icon="coin-outline" :size="20"></VIcon>
          <span>{{ userInfo.money }}</span>
        </a>
        <a class="item" target="_blank" href="https://pay.bilibili.com/bb_balance.html" title="B币">
          <VIcon icon="b-coin-outline" :size="20"></VIcon>
          <span>{{ userInfo.wallet.bcoin_balance }}</span>
        </a>
      </div>
      <div class="separator"></div>
      <div class="stats">
        <a
          class="stats-item"
          :href="'https://space.bilibili.com/' + userInfo.mid + '/fans/follow'"
          target="_blank"
        >
          <div class="stats-number">{{ stat.following | count }}</div>
          关注
        </a>
        <a
          class="stats-item"
          :href="'https://space.bilibili.com/' + userInfo.mid + '/fans/fans'"
          target="_blank"
        >
          <div class="stats-number">{{ stat.follower | count }}</div>
          粉丝
        </a>
        <a
          class="stats-item"
          :href="'https://space.bilibili.com/' + userInfo.mid + '/dynamic'"
          target="_blank"
        >
          <div class="stats-number">{{ stat.dynamic_count | count }}</div>
          动态
        </a>
      </div>
      <div class="separator"></div>
      <a
        class="bv-custom-navbar-operation"
        target="_blank"
        href="https://account.bilibili.com/account/home"
      >
        <VIcon icon="profile"></VIcon>个人中心
      </a>
      <a
        class="bv-custom-navbar-operation"
        target="_blank"
        href="https://member.bilibili.com/platform/upload-manager/article"
      >
        <VIcon icon="posts"></VIcon>投稿管理
      </a>
      <a class="bv-custom-navbar-operation" target="_blank" href="https://pay.bilibili.com/">
        <VIcon icon="wallet"></VIcon>B币钱包
      </a>
      <a
        class="bv-custom-navbar-operation"
        target="_blank"
        href="https://link.bilibili.com/p/center/index"
      >
        <VIcon icon="live-center"></VIcon>直播中心
      </a>
      <a
        class="bv-custom-navbar-operation"
        target="_blank"
        href="https://show.bilibili.com/orderlist"
      >
        <VIcon icon="order-center"></VIcon>订单中心
      </a>
      <a
        class="bv-custom-navbar-operation"
        target="_blank"
        href="https://www.bilibili.com/v/cheese/mine"
      >
        <VIcon icon="course"></VIcon>我的课程
      </a>
      <div class="logout grey-button" @click="logout()">退出登录</div>
    </div>
    <div v-if="!isLogin" class="not-logged-in">
      <h1 class="welcome">欢迎来到 bilibili</h1>
      <a href="https://passport.bilibili.com/register/phone.html" class="signup grey-button"
        >注册</a
      >
      <a href="https://passport.bilibili.com/login" class="login theme-button">登录</a>
    </div>
  </div>
</template>

<script lang="ts">
import { getUID, getCsrf, formData } from '@/core/utils'
import { formatCount } from '@/core/utils/formatters'
import { logError } from '@/core/utils/log'
import { getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getUserInfo } from '@/core/user-info'
import { popperMixin } from '../mixins'

type PrivilegeType = 1 | 2
export default Vue.extend({
  components: {
    VIcon: coreApis.ui.VIcon,
  },
  filters: {
    count: formatCount,
  },
  mixins: [popperMixin],
  data() {
    return {
      userInfo: {},
      stat: {},
      isLogin: Boolean(getUID()),
      privileges: {
        bCoin: {
          received: false,
          expire: '',
        },
        coupons: {
          received: false,
          expire: '',
        },
      },
    }
  },
  computed: {
    level() {
      const baseLevel = `lv${this.userInfo.level_info.current_level}`
      if (this.userInfo.is_senior_member) {
        return {
          icon: `${baseLevel}-plus`,
          colored: true,
        }
      }
      return {
        icon: baseLevel,
      }
    },
    userType() {
      if (!this.userInfo.isLogin) {
        return '未登录'
      }
      if (this.userInfo.level_info.current_level === 0) {
        return '注册会员'
      }
      if (this.userInfo.vipStatus === 1) {
        if (this.userInfo.vipType === 1) {
          return this.userInfo.vip_theme_type ? '小会员' : '大会员'
        }
        if (this.userInfo.vipType === 2) {
          return this.userInfo.vip_theme_type ? '年度小会员' : '年度大会员'
        }
      }
      return '正式会员'
    },
    levelProgressStyle() {
      if (!this.userInfo.isLogin) {
        return {}
      }
      const { current_exp, current_min, next_exp } = this.userInfo.level_info
      const progress = (current_exp - current_min) / (next_exp - current_min)
      return {
        transform: `scaleX(${progress})`,
      }
    },
  },
  async created() {
    const userInfo = await getUserInfo()
    this.userInfo = userInfo
    const json = await getJsonWithCredentials('https://api.bilibili.com/x/web-interface/nav/stat')
    this.stat = json.data || {}
    if (this.isLogin && this.userInfo.vipType === 2) {
      // 年度大会员权益
      const privileges = await getJsonWithCredentials('https://api.bilibili.com/x/vip/privilege/my')
      if (privileges.code === 0) {
        const bCoin = privileges.data.list.find((it: { type: PrivilegeType }) => it.type === 1)
        this.privileges.bCoin.received = bCoin.state === 1
        this.privileges.bCoin.expire = new Date(bCoin.expire_time * 1000).toLocaleDateString()
        const coupons = privileges.data.list.find((it: { type: PrivilegeType }) => it.type === 2)
        this.privileges.coupons.received = coupons.state === 1
        this.privileges.coupons.expire = new Date(coupons.expire_time * 1000).toLocaleDateString()
      }
    }
  },
  methods: {
    async privilegeReceive(type: PrivilegeType) {
      const typeMapping = {
        1: 'bCoin',
        2: 'coupons',
      }
      if (this.privileges[typeMapping[type]].received) {
        return
      }
      this.privileges[typeMapping[type]].received = true
      const csrf = getCsrf()
      const result = await (
        await fetch('https://api.bilibili.com/x/vip/privilege/receive', {
          credentials: 'include',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: `type=${type}&csrf=${csrf}`,
          method: 'POST',
        })
      ).json()
      console.log(result)
      if (result.code === 0) {
        if (typeMapping[type] === 'bCoin') {
          this.userInfo.wallet.bcoin_balance += 5
        }
      } else if (result.code === 69801) {
        // 已领过
      } else {
        this.privileges[typeMapping[type]].received = false
        logError(result.message)
      }
    },
    async logout() {
      /** b 站 源 码
       *
       * ```js
       * export const postLogout = () => {
       *   const Cookie = require('js-cookie')
       *   const qs = require('qs')
       *   return axios({
       *     method: 'post',
       *     url: '//passport.bilibili.com/login/exit/v2',
       *     withCredentials: true,
       *     headers: {
       *       'Content-type': 'application/x-www-form-urlencoded',
       *     },
       *     data: qs.stringify({
       *       biliCSRF: Cookie.get('bili_jct')
       *     }),
       *   })
       * }
       * // ...
       * async logout() {
       *   try {
       *     const { data } = await postLogout()
       *     if(data && data.data.redirectUrl) {
       *       window.location = data.data.redirectUrl
       *     }
       *   } catch (_) {
       *   }
       * }
       * ```
       */
      const response = await postTextWithCredentials(
        'https://passport.bilibili.com/login/exit/v2',
        formData({
          biliCSRF: getCsrf(),
        }),
      )
      const url = lodash.get(JSON.parse(response), 'data.redirectUrl', '')
      if (url) {
        window.location.assign(url)
      }
    },
  },
})
</script>

<style lang="scss">
@import 'common';

.user-info-panel {
  border-radius: 8px;
  overflow: hidden;
  width: 240px;
  font-size: 12px;

  .circle {
    position: relative;
    width: var(--navbar-icon-size);
    height: var(--navbar-icon-size);
    opacity: 0.7;
  }
  .circle .mdi {
    position: absolute;
    top: 0;
    left: 0;
  }
  .mdi-circle ~ .mdi {
    filter: invert(1);
    font-size: calc(var(--navbar-icon-size) - 10px);
    line-height: calc(var(--navbar-icon-size) - 10px);
    transform: translate(5px, 5px);
  }
  .be-icon {
    // font-size: var(--navbar-icon-size);
    font-style: normal;
    // line-height: var(--navbar-icon-size);
  }
  .logged-in {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  .row,
  .items {
    align-self: stretch;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .items {
    padding-top: 4px;
  }
  .row {
    margin: 0 10px;
    // https://www.bilibili.com/audio/au1417415?type=7
    width: auto !important;
    &::after {
      content: none !important;
    }
    &.level-info {
      margin-bottom: -5px;
    }
  }
  .privileges {
    justify-content: center;
    & > * {
      font-size: 11px;
      background-color: #8882;
      padding: 2px 4px;
      margin: 0 2px;
      border-radius: 4px;
      line-height: normal;
      cursor: pointer;
      &.received {
        cursor: default;
        opacity: 0.5;
      }
      &:not(.received):hover {
        background-color: #8884;
      }
    }
  }
  .bv-custom-navbar-operation {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    align-self: stretch;
    &:hover {
      background-color: #8882;
    }
    .be-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
    }
  }
  .item {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 48px;
    flex: 1;
    > .be-icon {
      opacity: 0.7;
      // font-size: 14pt;
      &:nth-child(2) {
        font-size: 18px;
        line-height: 18px;
      }
    }
    span {
      font-size: 14px;
      @include semi-bold();
      opacity: 0.7;
    }
  }
  .welcome,
  .name {
    font-size: 16px;
    @include semi-bold();
    margin: 46px 0 16px 0;
    text-align: center;
    color: inherit;
  }
  .name {
    margin: 62px 0 0 0;
    &:hover {
      color: var(--theme-color) !important;
    }
  }
  .type {
    font-size: 11px;
    opacity: 0.5;
    margin: 6px 0;
  }
  .separator {
    height: 1px;
    align-self: stretch;
    margin: 5px 10px;
    background: rgba(0, 0, 0, 0.1);
    body.dark & {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  .level-icon.plus {
    max-height: 24px;
  }
  .level-progress-thumb {
    width: 100%;
    height: 100%;
    background: var(--theme-color);
    transform-origin: left;
  }
  .level-progress-label {
    font-size: 11px;
  }
  .stats {
    display: flex;
    align-items: center;
    align-self: stretch;
    margin: 0 10px;
    line-height: normal;
    &-item {
      padding: 6px 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: none;
      &:hover {
        color: var(--theme-color) !important;
      }
      .stats-number {
        @include semi-bold();
        margin-bottom: 4px;
        font-size: 14px;
        transition: none;
      }
    }
  }

  .grey-button,
  .theme-button {
    align-self: stretch;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 6px;
    border-radius: 4px;
    font-size: 14px;
  }
  .grey-button {
    background: #f8f8f8;
    color: inherit !important;
    &:hover {
      background: #f0f0f0;
    }
    &.logout {
      font-size: 12px;
      height: 32px;
      cursor: pointer;
      &:hover {
        color: inherit !important;
      }
    }
    body.dark & {
      background: #282828;
      &:hover {
        background: #333;
      }
    }
  }
  .theme-button {
    background: var(--theme-color);
    color: var(--foreground-color) !important;
    &:hover {
      background: var(--theme-color-90);
      color: var(--foreground-color) !important;
    }
  }
}
</style>

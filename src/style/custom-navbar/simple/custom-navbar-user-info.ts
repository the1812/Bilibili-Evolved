import { NavbarComponent } from '../custom-navbar-component'
type PrivilegeType = 1 | 2
export class UserInfo extends NavbarComponent {
  userInfo: any = {
    mid: getUID(),
    isLogin: Boolean(getUID()),
  }
  constructor() {
    super()
    this.noPadding = true
    this.href = 'https://space.bilibili.com'
    this.html = /*html*/`
      <div class="user-face-container">
        <img src='${EmptyImageUrl}' class="user-face"></img>
        <img src='${EmptyImageUrl}' class="user-pendant"></img>
      </div>
    `
    this.popupHtml = /*html*/`
      <div class="user-info-panel">
        <div v-if="isLogin" class="logged-in">
          <a class="name" target="_blank" href="https://space.bilibili.com/">{{uname}}</a>
          <a class="type" target="_blank" href="https://account.bilibili.com/account/big">{{userType}}</a>
          <div class="privileges row" v-if="this.vipType === 2">
            <div class="b-coin" :class="{received: privileges.bCoin.received}" @click="privilegeReceive(1)" :title="'有效期限: ' + privileges.bCoin.expire">
              {{privileges.bCoin.received ? '已领取B币' : '领取B币'}}
            </div>
            <div class="coupons" :class="{received: privileges.coupons.received}" @click="privilegeReceive(2)" :title="'有效期限: ' + privileges.coupons.expire">
              {{privileges.coupons.received ? '已领取优惠券' : '领取优惠券'}}
            </div>
          </div>
          <div class="level-info row">
            <a target="_blank" title="等级" href="https://account.bilibili.com/account/record"
              class="level">
              <i class="custom-navbar-iconfont-extended" :class="'custom-navbar-icon-lv' + level_info.current_level"></i>
            </a>
            <span class="level-progress-label">{{level_info.current_exp}} / {{level_info.next_exp}}</span>
          </div>
          <div class="level-progress separator">
            <div class="level-progress-thumb" :style="levelProgressStyle"></div>
          </div>
          <div class="items">
            <a class="item" target="_blank" title="手机验证"
              href="https://passport.bilibili.com/account/security#/bindphone">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-bind-phone"></i>
              <i v-if="mobile_verified" class="custom-navbar-iconfont-new-home custom-navbar-icon-ok"></i>
              <i v-else class="custom-navbar-iconfont-new-home custom-navbar-icon-cancel"></i>
            </a>
            <a class="item" target="_blank" title="邮箱验证"
              href="https://passport.bilibili.com/account/security#/bindmail">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-bind-email"></i>
              <i v-if="email_verified" class="custom-navbar-iconfont-new-home custom-navbar-icon-ok"></i>
              <i v-else class="custom-navbar-iconfont-new-home custom-navbar-icon-cancel"></i>
            </a>
            <a class="item" target="_blank" href="https://account.bilibili.com/site/coin" title="硬币">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-coin"></i>
              <span>{{money}}</span>
            </a>
            <a class="item" target="_blank" href="https://pay.bilibili.com/bb_balance.html" title="B币">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-b-coin"></i>
              <span>{{wallet.bcoin_balance}}</span>
            </a>
          </div>
          <div class="separator"></div>
          <a class="operation" target="_blank" href="https://account.bilibili.com/account/home">
            <i class="icon custom-navbar-icon-profile custom-navbar-iconfont-new-home"></i>
            个人中心
          </a>
          <a class="operation" target="_blank" href="https://member.bilibili.com/v2#/upload-manager/article">
            <i class="icon custom-navbar-icon-posts custom-navbar-iconfont-new-home"></i>
            投稿管理
          </a>
          <a class="operation" target="_blank" href="https://pay.bilibili.com/">
            <i class="icon custom-navbar-icon-wallet custom-navbar-iconfont-new-home"></i>
            B币钱包
          </a>
          <a class="operation" target="_blank" href="https://link.bilibili.com/p/center/index">
            <i class="icon custom-navbar-icon-live-center custom-navbar-iconfont-new-home"></i>
            直播中心
          </a>
          <a class="operation" target="_blank" href="https://show.bilibili.com/orderlist">
            <i class="icon custom-navbar-icon-order-center custom-navbar-iconfont-new-home"></i>
            订单中心
          </a>
          <!-- <a class="operation" target="_blank" href="https://www.bilibili.com/v/cheese/mine">
            <i class="icon custom-navbar-icon-course custom-navbar-iconfont-new-home"></i>
            我的课程
          </a> -->
          <a class="logout grey-button" href="https://account.bilibili.com/login?act=exit">
            退出登录
          </a>
        </div>
        <div v-else class="not-logged-in">
          <h1 class="welcome">欢迎来到 bilibili</h1>
          <a href="https://passport.bilibili.com/register/phone.html" class="signup grey-button">注册</a>
          <a href="https://passport.bilibili.com/login" class="login theme-button">登录</a>
        </div>
      </div>
    `
    this.requestedPopup = true
    this.init()
  }
  get name(): keyof CustomNavbarOrders {
    return 'userInfo'
  }
  async init() {
    const panel = await SpinQuery.select('.custom-navbar .user-info-panel') as HTMLElement
    const face = await SpinQuery.select('.custom-navbar .user-face-container .user-face') as HTMLElement
    const userInfoJson = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/web-interface/nav')
    const userStatJson = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/web-interface/nav/stat')
    Object.assign(this.userInfo, userInfoJson.data)
    Object.assign(this.userInfo, userStatJson.data)
    const vm = new Vue({
      el: panel,
      data: {
        ...this.userInfo,
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
      },
      computed: {
        userType() {
          if (!this.isLogin) {
            return '未登录'
          }
          if (this.level_info.current_level === 0) {
            return '注册会员'
          }
          if (this.vipStatus === 1) {
            if (this.vipType === 1) {
              return this.vip_theme_type ? '小会员' : '大会员'
            }
            else if (this.vipType === 2) {
              return this.vip_theme_type ? '年度小会员' : '年度大会员'
            }
          }
          return '正式会员'
        },
        levelProgressStyle() {
          const progress = (this.level_info.current_exp - this.level_info.current_min) / (this.level_info.next_exp - this.level_info.current_min)
          return {
            transform: `scaleX(${progress})`
          }
        }
      },
      methods: {
        async privilegeReceive(type: PrivilegeType) {
          const typeMapping = {
            1: 'bCoin',
            2: 'coupons'
          }
          if (this.privileges[typeMapping[type]].received) {
            return
          }
          this.privileges[typeMapping[type]].received = true
          const csrf = getCsrf()
          const result = await (await fetch('https://api.bilibili.com/x/vip/privilege/receive',
            {
              credentials: 'include',
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
              body: `type=${type}&csrf=${csrf}`,
              method: 'POST'
            })).json()
          console.log(result)
          if (result.code === 0) {
            if (typeMapping[type] === 'bCoin') {
              this.wallet.bcoin_balance += 5
            }
          } else if (result.code === 69801) { // 已领过
            return
          } else {
            this.privileges[typeMapping[type]].received = false
            logError(result.message)
          }
        },
      },
    })
    if (this.userInfo.isLogin) {
      const faceUrl = this.userInfo.face.replace('http', 'https')
      const noFaceUrl = 'static.hdslb.com/images/member/noface.gif'
      if (!faceUrl.includes(noFaceUrl)) { // 没上传过头像的不做缩放
        const faceBaseSize = 68
        face.setAttribute('srcset', getDpiSourceSet(faceUrl, faceBaseSize))
      } else {
        face.setAttribute('src', noFaceUrl)
      }
      if (this.userInfo.pendant.image) {
        const pendant = await SpinQuery.select('.custom-navbar .user-face-container .user-pendant') as HTMLElement
        const pendantUrl = this.userInfo.pendant.image.replace('http', 'https')
        const pendantBaseSize = 116
        pendant.setAttribute('srcset', getDpiSourceSet(pendantUrl, pendantBaseSize, 'png'))
      }
      if (this.userInfo.vipType === 2) { // 年度大会员权益
        const privileges = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/vip/privilege/my')
        if (privileges.code === 0) {
          const bCoin = privileges.data.list.find((it: { type: PrivilegeType }) => it.type === 1)
          vm.privileges.bCoin.received = bCoin.state === 1
          vm.privileges.bCoin.expire = new Date(bCoin.expire_time * 1000).toLocaleDateString()
          const coupons = privileges.data.list.find((it: { type: PrivilegeType }) => it.type === 2)
          vm.privileges.coupons.received = coupons.state === 1
          vm.privileges.coupons.expire = new Date(coupons.expire_time * 1000).toLocaleDateString()
        }
      }
    }
    else {
      face.setAttribute('src', 'https://static.hdslb.com/images/akari.jpg')
    }
  }
}
export default {
  export: {
    UserInfo,
  },
}
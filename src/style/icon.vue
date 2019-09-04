<template>
  <i class="be-icon" :class="classes"></i>
</template>

<script lang="ts">
export default {
  props: {
    icon: String,
    type: String
  },
  computed: {
    classes() {
      if (this.icon === '' || this.type === '') {
        return []
      }
      return [`be-iconfont-${this.icon}`, `be-${this.type}-iconfont`]
    }
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: 'be-main-iconfont';
  src: url('//s1.hdslb.com/bfs/seed/jinkela/header/asserts/iconfont.ttf')
    format('truetype');
}
@font-face {
  font-family: 'be-extended-iconfont';
  src: url('//s1.hdslb.com/bfs/static/jinkela/video/asserts/iconfont.4bab144.ttf')
    format('truetype');
}
@font-face {
  font-family: 'be-home-iconfont';
  src: url('//s1.hdslb.com/bfs/static/jinkela/international-home/asserts/iconfont.ttf')
    format('truetype');
}
.be-icon {
  color: inherit;
  font-size: 24px;
  font-style: normal;
  &.be-main-iconfont {
    font-family: 'be-main-iconfont' !important;
  }
  &.be-extended-iconfont {
    font-family: 'be-extended-iconfont' !important;
  }
  &.be-home-iconfont {
    font-family: 'be-home-iconfont' !important;
  }

  &.be-iconfont-logo::before {
    content: '\E725';
  }
  &.be-iconfont-lv0::before {
    content: '\E6CB';
    color: #9a9a9a;
  }
  &.be-iconfont-lv1::before {
    content: '\E6CC';
    color: #646464;
  }
  body.dark &.be-iconfont-lv0::before {
    color: #777;
  }
  body.dark &.be-iconfont-lv1::before {
    color: #ddd;
  }
  &.be-iconfont-lv2::before {
    content: '\E6CD';
    color: #1bc861;
  }
  &.be-iconfont-lv3::before {
    content: '\E6CE';
    color: #22baea;
  }
  &.be-iconfont-lv4::before {
    content: '\E6CF';
    color: #eaa722;
  }
  &.be-iconfont-lv5::before {
    content: '\E6D0';
    color: #ff7631;
  }
  &.be-iconfont-lv6::before {
    content: '\E6D1';
    color: #ff3131;
  }
  &.be-iconfont-profile::before {
    content: '\E722';
  }
  &.be-iconfont-posts::before {
    content: '\E723';
  }
  &.be-iconfont-wallet::before {
    content: '\E71F';
  }
  &.be-iconfont-live-center::before {
    content: '\E720';
  }
  &.be-iconfont-order-center::before {
    content: '\E71E';
  }
  &.be-iconfont-logout::before {
    content: '\E721';
  }
  &.be-iconfont-ok::before {
    content: '\E749';
  }
  &.be-iconfont-cancel::before {
    content: '\E74A';
  }
  &.be-iconfont-bind-phone::before {
    content: '\E733';
  }
  &.be-iconfont-bind-email::before {
    content: '\E735';
  }
  &.be-iconfont-coin::before {
    content: '\E734';
  }
  &.be-iconfont-b-coin::before {
    content: '\E736';
  }
  &.be-iconfont-activity::before {
    content: '\E732';
  }
  &.be-iconfont-message::before {
    content: '\E731';
  }
  &.be-iconfont-favorite::before {
    content: '\E730';
  }
  &.be-iconfont-history::before {
    content: '\E72F';
  }
  &.be-iconfont-vip::before {
    content: '\E72E';
  }
  &.be-iconfont-play::before {
    content: '\E6E6';
  }
  &.be-iconfont-danmaku::before {
    content: '\E6E7';
  }
  &.be-iconfont-like::before {
    content: '\E6E0';
  }
}
</style>
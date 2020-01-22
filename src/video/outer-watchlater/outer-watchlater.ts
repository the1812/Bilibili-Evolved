(async () => {
  if (!document.URL.includes('//www.bilibili.com/video/av')) {
    return
  }
  await SpinQuery.condition(() => dq('.video-toolbar .ops .collect'), it => {
    return it !== null && (it as HTMLElement).innerText !== '--'
  })
  const favoriteButton = dq('.video-toolbar .ops .collect')
  if (!favoriteButton) {
    return
  }
  favoriteButton.insertAdjacentHTML('afterend', /*html*/`
    <span title='稍后再看' class='watchlater' :class="{on: isInWatchlater}" @click="toggle()">
      <i class='mdi mdi-timetable'></i>
      稍后再看
      <div class='tip' :class="{show: tipShowing}">{{tipText}}</div>
    </span>
  `)
  const watchlaterButton = dq('.ops .watchlater')
  const tip = dq('.ops .watchlater .tip')
  if (!watchlaterButton || !tip) {
    return
  }
  const vm = new Vue({
    el: watchlaterButton,
    store,
    data: {
      aid: unsafeWindow.aid,
      tipText: '',
      tipShowing: false,
      tipHandle: 0,
    },
    computed: {
      ...Vuex.mapState(['watchlaterList']),
      isInWatchlater() {
        return this.watchlaterList.includes(parseInt(this.aid))
      }
    },
    methods: {
      ...Vuex.mapActions(['toggleWatchlater']),
      showTip(text: string) {
        this.tipText = text
        this.tipShowing = true
        if (this.tipHandle) {
          clearTimeout(this.tipHandle)
        }
        this.tipHandle = setTimeout(() => {
          this.tipShowing = false
        }, 2000);
      },
      async toggle() {
        await this.toggleWatchlater(this.aid)
        this.showTip(this.isInWatchlater ? '已添加至稍后再看' : '已从稍后再看移除')
      }
    }
  })
  Observer.videoChange(() => {
    vm.aid = unsafeWindow.aid
  })
})()

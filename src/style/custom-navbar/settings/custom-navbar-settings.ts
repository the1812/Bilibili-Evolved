export const initSettingsPanel = async () => {
  await SpinQuery.select('.custom-navbar-settings')
  const { Slip } = await import('../../../touch/slip')
  const button = dq('#custom-navbar-settings') as HTMLDivElement
  button.addEventListener('click', async () => {
    const settingsPanel = dq('.custom-navbar-settings')
    if (settingsPanel) {
      settingsPanel.classList.toggle('show');
      (dq('.gui-settings-mask') as HTMLElement).click()
    }
  })
  button.addEventListener('mouseover', () => {
    const displayNames: { [key in keyof CustomNavbarComponents]: string } = {
      blank1: '弹性空白1',
      logo: 'Logo',
      category: '主站',
      rankingLink: '排行',
      drawingLink: '相簿',
      musicLink: '音频',
      gamesIframe: '游戏中心',
      livesIframe: '直播',
      shopLink: '会员购',
      mangaLink: '漫画',
      blank2: '弹性空白2',
      search: '搜索框',
      userInfo: '用户信息',
      messages: '消息',
      activities: '动态',
      bangumi: '订阅',
      watchlaterList: '稍后再看',
      favoritesList: '收藏',
      historyList: '历史',
      upload: '投稿入口',
      blank3: '弹性空白3',
    }
    Vue.component('order-item', {
      props: ['item'],
      template: /*html*/`
        <li @mouseenter="viewBorder(true)"
            @mouseleave="viewBorder(false)"
            :class="{hidden: hidden()}">
          <i class="mdi mdi-menu"></i>
          {{item.displayName}}
          <button @click="toggleHidden()">
            <i v-if="hidden()" class="mdi mdi-eye-off"></i>
            <i v-else class="mdi mdi-eye"></i>
          </button>
        </li>
      `,
      methods: {
        hidden() {
          return settings.customNavbarHidden.includes(this.item.name)
        },
        viewBorder(view: boolean) {
          const navbarItem = dq(`.custom-navbar li[data-name='${this.item.name}']`)
          if (navbarItem !== null) {
            navbarItem.classList.toggle('view-border', view)
          }
        },
        toggleHidden() {
          const isHidden = this.hidden()
          if (isHidden === false) {
            settings.customNavbarHidden.push(this.item.name)
            settings.customNavbarHidden = settings.customNavbarHidden
          }
          else {
            const index = settings.customNavbarHidden.indexOf(this.item.name)
            if (index === -1) {
              return
            }
            settings.customNavbarHidden.splice(index, 1)
            settings.customNavbarHidden = settings.customNavbarHidden
          }
          this.$forceUpdate()
          const navbarItem = dq(`.custom-navbar li[data-name='${this.item.name}']`) as HTMLElement
          if (navbarItem !== null) {
            navbarItem.style.display = isHidden ? 'flex' : 'none'
          }
        }
      }
    })

    const updateBoundsPadding = _.debounce(value => {
      settings.customNavbarBoundsPadding = value
      document.body.style.setProperty('--navbar-bounds-padding', `0 ${value}%`)
    }, 200)
    new Vue({
      el: '.custom-navbar-settings',
      mounted() {
        const list = dq('.custom-navbar-settings .order-list') as HTMLElement
        const reorder = ({ sourceItem, targetItem, orderBefore, orderAfter }: {
          sourceItem: HTMLElement, targetItem: HTMLElement, orderBefore: number, orderAfter: number
        }) => {
          if (orderBefore === orderAfter) {
            return
          }
          const entires = Object.entries(settings.customNavbarOrder).filter(([key,]) => key in customNavbarDefaultOrders)
          const names = entires.sort((a, b) => a[1] - b[1]).map(it => it[0]) as Array<keyof CustomNavbarOrders>
          if (orderBefore < orderAfter) {
            for (let i = orderBefore + 1; i <= orderAfter; i++) {
              const name = names[i]
              settings.customNavbarOrder[name] = i - 1
              const targetElement = dq(`.custom-navbar li[data-name='${name}']`) as HTMLElement
              targetElement.style.order = (i - 1).toString()
            }
          } else {
            for (let i = orderBefore - 1; i >= orderAfter; i--) {
              const name = names[i]
              settings.customNavbarOrder[name] = i + 1
              const targetElement = dq(`.custom-navbar li[data-name='${name}']`) as HTMLElement
              targetElement.style.order = (i + 1).toString()
            }
          }
          settings.customNavbarOrder[names[orderBefore]] = orderAfter
          const oldElement = dq(`.custom-navbar li[data-name='${names[orderBefore]}']`) as HTMLElement
          oldElement.style.order = orderAfter.toString()
          settings.customNavbarOrder = settings.customNavbarOrder
          list.insertBefore(sourceItem, targetItem)
        }
        new Slip(list)
        list.addEventListener('slip:beforewait', e => {
          if ((e.target as HTMLElement).classList.contains('mdi-menu')) {
            e.preventDefault()
          }
        }, false)
        list.addEventListener('slip:beforeswipe', e => e.preventDefault(), false)
        list.addEventListener('slip:reorder', (e: any) => {
          reorder({
            sourceItem: e.target,
            targetItem: e.detail.insertBefore,
            orderBefore: e.detail.originalIndex,
            orderAfter: e.detail.spliceIndex,
          })
          return false
        }, false)
      },
      computed: {
        orderList() {
          const orders = Object.entries(settings.customNavbarOrder) as [keyof CustomNavbarOrders, number][]
          return orders.filter(it => it[0] in displayNames).sort((a, b) => a[1] - b[1]).map(it => {
            return {
              displayName: displayNames[it[0]],
              name: it[0],
              order: it[1],
            }
          })
        },
      },
      data: {
        boundsPadding: settings.customNavbarBoundsPadding,
      },
      watch: {
        boundsPadding(value) {
          updateBoundsPadding(value)
        },
      },
      methods: {
        close() {
          (dq('.custom-navbar-settings') as HTMLElement).classList.remove('show')
        },
        restoreDefault() {
          if (typeof customNavbarDefaultOrders === 'undefined') {
            Toast.error('未找到默认值设定, 请更新您的脚本.', '自定义顶栏', 3000)
            return
          }
          if (confirm('确定要恢复默认顶栏布局吗? 恢复后页面将刷新.')) {
            this.boundsPadding = 5
            settings.customNavbarOrder = customNavbarDefaultOrders
            location.reload()
          }
        },
      },
    })
  }, { once: true })
}
export default {
  export: {
    initSettingsPanel,
  }
}
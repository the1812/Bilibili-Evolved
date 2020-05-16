import { NavbarComponent } from './custom-navbar-component'
const supportedUrls = [
  '//www.bilibili.com',
  '//t.bilibili.com',
  '//search.bilibili.com',
  '//space.bilibili.com',
  '//account.bilibili.com',
  '//pay.bilibili.com',
  '//member.bilibili.com',
  '//big.bilibili.com',
  '//message.bilibili.com',
  '//app.bilibili.com',
  '//passport.bilibili.com',
  '//game.bilibili.com',
  '//live.bilibili.com/blackboard/',
]
const unsupportedUrls = [
  '//t.bilibili.com/vote/h5/index/#/result',
  '//t.bilibili.com/lottery/h5/index/#/result',
  '//member.bilibili.com/video/upload',
  '//space.bilibili.com/ajax/',
  '//www.bilibili.com/h5/comment/',
  '//www.bilibili.com/blackboard/',
  '//member.bilibili.com/v2',
]
const loadSettings = () => {
  document.documentElement.style.setProperty('--navbar-bounds-padding', `0 ${settings.customNavbarBoundsPadding}%`)
  document.documentElement.style.setProperty('--navbar-blur-opacity', (settings.customNavbarBlurOpacity || 0.7).toString())
  addSettingsListener('customNavbarBlurOpacity', value => {
    document.documentElement.style.setProperty('--navbar-blur-opacity', value)
  })
}
const classHandler = (key: string, value: boolean, element: HTMLElement) => {
  element.classList.toggle(key, value)
}
const darkHandler = (force: boolean) => {
  (dq('.custom-navbar') as HTMLElement).classList.toggle('dark', force);
  (dq('.custom-navbar-settings') as HTMLElement).classList.toggle('dark', force)
}
export default (() => {
  if (isIframe()) {
    return
  }
  loadSettings()
  const showWidget = !(!supportedUrls.some(it => document.URL.includes(it))
    || unsupportedUrls.some(it => document.URL.includes(it)))
    || document.URL.includes('//www.bilibili.com/blackboard/bnj2020.html') // 拜年祭2020
    || document.URL.includes('//www.bilibili.com/blackboard/help.html') // 帮助中心
  if (showWidget) {
    document.body.classList.add('custom-navbar-loading');
    (async () => {
      const html = await import((() => 'customNavbarHtml')())
      document.body.insertAdjacentHTML('beforeend', html)
      addSettingsListener('useDarkStyle', darkHandler, true)
      const getNavbarElement = () => dq('.custom-navbar') as HTMLElement
      ['Fill', 'Shadow', 'Compact', 'Blur'].forEach(item => {
        const key = 'customNavbar' + item as keyof BilibiliEvolvedSettings
        addSettingsListener(
          key,
          value => classHandler(item.toLowerCase(), value, getNavbarElement()),
          true
        )
      })
      SpinQuery.condition(() => dq('#banner_link,.international-header .bili-banner'),
        banner => banner === null ? false : Boolean((banner as HTMLElement).style.backgroundImage),
        (banner: HTMLElement) => {
          Observer.attributes(banner, () => {
            const blurLayers = dqa('.custom-navbar .blur-layer') as HTMLElement[]
            blurLayers.forEach(blurLayer => {
              blurLayer.style.backgroundImage = banner.style.backgroundImage
              blurLayer.setAttribute('data-image', banner.style.backgroundImage)
            })
            addSettingsListener('customNavbarTransparent', value => {
              if (!settings.hideBanner) {
                getNavbarElement().classList.toggle('transparent', value)
              }
            }, true)
            addSettingsListener('hideBanner', value => {
              if (settings.customNavbarTransparent) {
                getNavbarElement().classList.toggle('transparent', !value)
              }
            })
          })
        })
      const { Blank } = await import('./simple/custom-navbar-blank')
      const { Logo } = await import('./simple/custom-navbar-logo')
      const { Category } = await import('./category/custom-navbar-category')
      const { SimpleLink } = await import('./simple/custom-navbar-simple-link')
      const { UserInfo } = await import('./simple/custom-navbar-user-info')
      const { SearchBox } = await import('./simple/custom-navbar-search-box')
      const { Iframe } = await import('./simple/custom-navbar-iframe')
      const components = [
        new Blank(1),
        new Logo(),
        new Category(),
        new SimpleLink('排行', 'https://www.bilibili.com/ranking', 'ranking'),
        new SimpleLink('相簿', 'https://h.bilibili.com', 'drawing'),
        new SimpleLink('音频', 'https://www.bilibili.com/audio/home/', 'music'),
        new Iframe('游戏中心', 'https://game.bilibili.com/', {
          src: `https://www.bilibili.com/page-proxy/game-nav.html`,
          width: `680px`,
          height: `260px`,
          lazy: true,
          iframeName: 'games',
        }),
        new Iframe('直播', 'https://live.bilibili.com', {
          src: `https://live.bilibili.com/blackboard/dropdown-menu.html`,
          width: `528px`,
          height: `266px`,
          lazy: true,
          iframeName: 'lives',
        }),
        new SimpleLink('会员购', 'https://show.bilibili.com', 'shop'),
        new SimpleLink('漫画', 'https://manga.bilibili.com', 'manga'),
        new Blank(2),
        new SearchBox(),
        new UserInfo(),
      ]
      if (getUID()) {
        const { WatchlaterList } = await import('./watchlater-list/custom-navbar-watchlater-list')
        const { Messages } = await import('./simple/custom-navbar-messages')
        const { Activities } = await import('./activities/custom-navbar-activities')
        const { Subscriptions } = await import('./subscriptions/custom-navbar-subscriptions')
        const { FavoritesList } = await import('./favorites-list/custom-navbar-favorites-list')
        const { HistoryList } = await import('./history-list/custom-navbar-history-list')
        components.push(
          new Messages(),
          new Subscriptions(),
          new Activities(),
          new WatchlaterList(),
          new FavoritesList(),
          new HistoryList(),
        )
      }
      const { Upload } = await import('./simple/custom-navbar-upload')
      const { DarkMode } = await import('./simple/custom-navbar-dark-mode')
      components.push(new Upload(), new Blank(3), new DarkMode())
      new Vue({
        el: '.custom-navbar',
        data: {
          components,
        },
        methods: {
          async requestPopup(component: NavbarComponent) {
            if (!component.requestedPopup && !component.disabled /* && !component.active */) {
              this.$set(component, `requestedPopup`, true)
              // component.initialPopup && component.initialPopup()
              if (component.initialPopup) {
                component.initialPopup()
              }
              // console.log('lazy popup: ', component.name)
            }
            if (component.onPopup) {
              component.onPopup()
            }
            // component.checkPosition()
          }
        },
        mounted() {
          document.body.classList.remove('custom-navbar-loading')
          const orderedComponents = [...components].sort(ascendingSort(c => c.order))
          const checkPosition = () => {
            const checkPositions = () => {
              // console.log('recalculate positions')
              // components.forEach(c => c.checkPosition())
              let left = 0
              let leftResult = true
              let right = orderedComponents.length - 1
              let rightResult = true
              while (left < right && (leftResult || rightResult)) {
                if (leftResult === true) {
                  leftResult = orderedComponents[left].checkPosition()
                  if (leftResult === true) {
                    left++
                  } else {
                    // console.log(`Stop left checking at ${left}`, orderedComponents[left].name)
                  }
                }
                if (rightResult === true) {
                  rightResult = orderedComponents[right].checkPosition()
                  if (rightResult === true) {
                    right--
                  } else {
                    // console.log(`Stop right checking at ${right}`, orderedComponents[right].name)
                  }
                }
              }
            }
            addSettingsListener('customNavbarOrder', checkPositions, true)
            addSettingsListener('customNavbarHidden', checkPositions)
            addSettingsListener('customNavbarBoundsPadding', checkPositions)
            window.addEventListener('resize', checkPositions)
          }
          if ('requestIdleCallback' in unsafeWindow && GM.info.scriptHandler !== 'Violentmonkey') {
            unsafeWindow.requestIdleCallback(checkPosition)
          } else {
            setTimeout(checkPosition)
          }
        },
      })
    })()
  }
  return {
    widget: {
      content: /*html*/`
        <div class="gui-settings-flat-button" id="custom-navbar-settings">
          <i class="mdi mdi-24px mdi-auto-fix"></i>
          <span>顶栏布局</span>
        </div>`,
      condition: () => showWidget,
      success: async () => {
        const { initSettingsPanel } = await import('./settings/custom-navbar-settings')
        await initSettingsPanel()
      },
    },
    unload: () => {
      const navbar = dqa('.custom-navbar,.custom-navbar-settings')
      navbar.forEach((it: HTMLElement) => it.style.display = 'none')
      resources.removeStyle('customNavbarStyle')
    },
    reload: () => {
      const navbar = dqa('.custom-navbar,.custom-navbar-settings')
      navbar.forEach((it: HTMLElement) => it.style.display = 'flex')
      resources.applyImportantStyle('customNavbarStyle')
    },
  }
})()

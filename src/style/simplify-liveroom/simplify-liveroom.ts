const displayNames = {
  vip: "老爷图标",
  fansMedal: "粉丝勋章",
  title: "活动头衔",
  userLevel: "用户等级",
  guard: "舰长图标",
  systemMessage: "全区广播",
  welcomeMessage: "欢迎信息",
  giftMessage: "礼物弹幕",
  guardPurchase: "上舰提示",
  giftPanel: "付费礼物",
  kanban: "看板娘",
  eventsBanner: "活动横幅",
  popup: "抽奖提示",
  skin: "房间皮肤",
}
class SkinManager {
  skinDisabled = settings.simplifyLiveroomSettings.skin
  skinSelectors: string[]
  skinClass: string
  constructor(skinSelectors: string[], skinClass: string) {
    this.skinSelectors = skinSelectors
    this.skinClass = skinClass
    skinSelectors.forEach(selector => {
      SpinQuery.select(
        selector,
        skin => {
          Observer.attributes(selector, records => {
            records.forEach(record => {
              if (record.attributeName === 'class') {
                if (this.skinDisabled && skin.classList.contains(skinClass)) {
                  skin.classList.remove(skinClass)
                }
                else if (!this.skinDisabled && !skin.classList.contains(skinClass)) {
                  skin.classList.add(skinClass)
                }
              }
            })
          })
        })
    })
  }
  setSkin(enable: boolean) {
    this.skinDisabled = !enable
    this.skinSelectors.forEach(selector => {
      SpinQuery.select(
        selector,
        skin => skin.classList[enable ? 'add' : 'remove'](this.skinClass)
      )
    })
  }
}
const skins = [
  new SkinManager([
    '#head-info-vm',
    '#gift-control-vm',
    '#rank-list-vm',
    '#rank-list-ctnr-box',
    '.gift-panel.base-panel',
    '.gift-panel.extend-panel',
    '.seeds-wrap>div:first-child',
    '.gift-section>div:last-child',
    '.z-gift-package>div>div',
    '.right-action'
  ], 'live-skin-coloration-area'),
  new SkinManager([
    '.rank-list-ctnr .tabs'
  ], 'isHundred'),
  new SkinManager([
    '.rank-list-ctnr .tab-content > div'
  ], 'hundred'),
]
const setBodyClass = (checked: boolean, key: string) => {
  document.body.classList[checked ? "add" : "remove"](`simplify-${key}`);
  if (key === "skin") {
    skins.forEach(it => it.setSkin(!checked))
  }
};
const isLiveroom = () => document.URL.startsWith(`https://live.bilibili.com/`)
if (isLiveroom()) {
  Object.keys(displayNames).forEach(key => {
    const checked = settings.simplifyLiveroomSettings[key];
    setBodyClass(checked, key);
  })
}
export default {
  widget: {
    condition: isLiveroom,
    content: /*html*/`
      <div class="gui-settings-flat-button" style="position: relative" id="simplify-liveroom">
        <i class="mdi mdi-24px mdi-settings"></i>
        <span>简化直播间</span>
        <div class="simplify-liveroom-settings popup">
          <ul>
            <li v-for="item in items" v-on:click="itemClick(item)">
              <i class="mdi mdi-18px" v-bind:class="{'mdi-eye': !item.checked, 'mdi-eye-off': item.checked}"></i>
              {{item.name}}
            </li>
          </ul>
        </div>
      </div>
    `,
    success: () => {
      const button = document.querySelector("#simplify-liveroom") as HTMLButtonElement
      const mask = document.querySelector(".gui-settings-mask") as HTMLElement
      button.addEventListener("click", e => {
        const settingsList = document.querySelector(".simplify-liveroom-settings") as HTMLElement
        if (settingsList.contains(e.target as Node) || e.target === settingsList) {
          return;
        }
        settingsList.classList.toggle("opened");
      });
      button.addEventListener("mouseenter", () => mask.classList.add("transparent"));
      button.addEventListener("mouseleave", () => mask.classList.remove("transparent"));
      new Vue({
        el: ".simplify-liveroom-settings",
        data: {
          items: Object.entries(displayNames).map(([key, name]) => {
            const checked = settings.simplifyLiveroomSettings[key];
            setBodyClass(checked, key);
            return {
              key, name, checked
            };
          }),
        },
        methods: {
          itemClick(item: { key: string, name: string, checked: boolean }) {
            item.checked = !item.checked;
            setBodyClass(item.checked, item.key);
            settings.simplifyLiveroomSettings = Object.assign(
              settings.simplifyLiveroomSettings, {
              [item.key]: item.checked,
            });
          },
        },
      });
    },
  },
};

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
  popup: "抽奖提示",
  skin: "房间皮肤",
}
export default {
  widget: {
    condition: () => document.URL.startsWith(`https://live.bilibili.com/`),
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
      const button = document.querySelector("#simplify-liveroom");
      const mask = document.querySelector(".gui-settings-mask");
      button.addEventListener("click", e => {
        const settingsList = document.querySelector(".simplify-liveroom-settings");
        if (settingsList.contains(e.target) || e.target === settingsList) {
          return;
        }
        settingsList.classList.toggle("opened");
      });
      button.addEventListener("mouseenter", () => mask.classList.add("transparent"));
      button.addEventListener("mouseleave", () => mask.classList.remove("transparent"));
      let skinDisabled = settings.simplifyLiveroomSettings.skin;
      const skinSelectors = [
        "#head-info-vm",
        "#gift-control-vm",
        "#rank-list-vm",
        "#rank-list-ctnr-box",
        ".gift-panel.base-panel",
        ".gift-panel.extend-panel",
        ".seeds-wrap>div:first-child",
        ".gift-section>div:last-child",
        ".z-gift-package>div>div",
        ".right-action"
      ];
      const skinClass = "live-skin-coloration-area";
      skinSelectors.forEach(selector => {
        SpinQuery.select(
          selector,
          skin => {
            Observer.attributes(selector, records => {
              records.forEach(record => {
                if (record.attributeName === "class") {
                  // console.log("Observed class change: ", record);
                  if (skinDisabled && skin.classList.contains(skinClass)) {
                    skin.classList.remove(skinClass);
                  }
                  else if (!skinDisabled && !skin.classList.contains(skinClass)) {
                    skin.classList.add(skinClass);
                  }
                }
              });
            });
          });
      });
      const setBodyClass = (checked, key) => {
        document.body.classList[checked ? "add" : "remove"](`simplify-${key}`);
        if (key === "skin") {
          skinDisabled = checked;
          skinSelectors.forEach(selector => {
            SpinQuery.select(
              selector,
              skin => skin.classList[checked ? "remove" : "add"]("live-skin-coloration-area")
            );
          });
        }
      };
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
          itemClick (item) {
            item.checked = !item.checked;
            setBodyClass(item.checked, item.key);
            settings.simplifyLiveroomSettings = Object.assign(
              settings.simplifyLiveroomSettings, {
                [item.key]: item.checked,
              });
            // settings.simplifyLiveroomSettings[item.key] = item.checked;
            // GM_setValue("simplifyLiveroomSettings", settings.simplifyLiveroomSettings);
          },
        },
      });
    },
  },
};

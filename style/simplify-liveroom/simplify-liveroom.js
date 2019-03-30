const displayNames = {
    vip: "姥爷图标",
    fansMedal: "粉丝勋章",
    title: "活动头衔",
    userLevel: "用户等级",
    guard: "舰长图标",
    systemMessage: "全区广播",
    welcomeMessage: "欢迎信息",
    popup: "抽奖提示",
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
        success: () =>
        {
            document.querySelector("#simplify-liveroom").addEventListener("click", e =>
            {
                const settingsList = document.querySelector(".simplify-liveroom-settings");
                if (settingsList.contains(e.target) || e.target === settingsList)
                {
                    return;
                }
                settingsList.classList.toggle("opened");
            });
            const setBodyClass = (checked, key) =>
            {
                const method = checked ? "add" : "remove";
                document.body.classList[method](`simplify-${key}`);
            };
            new Vue({
                el: ".simplify-liveroom-settings",
                data: {
                    items: Object.entries(displayNames).map(([key, name]) =>
                    {
                        const checked = settings.simplifyLiveroomSettings[key];
                        setBodyClass(checked, key);
                        return {
                            key, name, checked
                        };
                    }),
                },
                methods: {
                    itemClick(item)
                    {
                        item.checked = !item.checked;
                        setBodyClass(item.checked, item.key);
                        settings.simplifyLiveroomSettings[item.key] = item.checked;
                        GM_setValue("simplifyLiveroomSettings", settings.simplifyLiveroomSettings);
                    },
                },
            });
        },
    },
};
(async () => {
    if (!document.URL.includes("//www.bilibili.com/video/av")) {
        return;
    }
    await SpinQuery.condition(() => document.querySelector(".video-toolbar .ops .collect"), it => {
        return it !== null && it.innerText !== "--";
    });
    const csrf = document.cookie.replace(/(?:(?:^|.*;\s*)bili_jct\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    const favoriteButton = document.querySelector(".video-toolbar .ops .collect");
    if (!favoriteButton) {
        return;
    }
    favoriteButton.insertAdjacentHTML("afterend", /*html*/ `
        <span title="稍后再看" class="watchlater">
            <i class="mdi mdi-timetable"></i>
            稍后再看
            <div class="tip"></div>
        </span>
    `);
    const watchlaterButton = document.querySelector(".ops .watchlater");
    const tip = document.querySelector(".ops .watchlater .tip");
    if (!watchlaterButton || !tip) {
        return;
    }
    let aid;
    const loadWatchlaterInfo = async () => {
        const aid = await SpinQuery.select(() => unsafeWindow.aid);
        const json = await Ajax.getJsonWithCredentials("https://api.bilibili.com/x/v2/history/toview/web");
        if (json.code !== 0) {
            json.data = { list: [] };
        }
        const watchlaterList = json.data.list.map((it) => it.aid);
        if (watchlaterList.includes(parseInt(aid))) {
            watchlaterButton.classList.add("on");
        }
        else {
            watchlaterButton.classList.remove("on");
        }
        return aid;
    };
    Observer.videoChange(async () => {
        aid = await loadWatchlaterInfo();
    });
    let tipShowing = 0;
    const toggleWatchlater = async ({ url, tipText }) => {
        const responseText = await Ajax.postTextWithCredentials(url, `aid=${aid}&csrf=${csrf}`);
        const response = JSON.parse(responseText);
        if (response.code !== 0) {
            logError(`稍后再看操作失败: ${responseText}`);
        }
        else {
            tip.innerHTML = tipText;
            tip.classList.add("show");
            if (tipShowing !== 0) {
                clearTimeout(tipShowing);
            }
            tipShowing = setTimeout(() => tip.classList.remove("show"), 2000);
        }
    };
    watchlaterButton.addEventListener("click", () => {
        watchlaterButton.classList.toggle("on");
        if (watchlaterButton.classList.contains("on")) {
            toggleWatchlater({
                url: "https://api.bilibili.com/x/v2/history/toview/add",
                tipText: "已添加至稍后再看",
            });
        }
        else {
            toggleWatchlater({
                url: "https://api.bilibili.com/x/v2/history/toview/del",
                tipText: "已从稍后再看移除",
            });
        }
    });
})();

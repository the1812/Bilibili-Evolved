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
        </span>
    `);
    const watchlaterButton = document.querySelector(".ops .watchlater");
    if (!watchlaterButton) {
        return;
    }
    const aid = await SpinQuery.select(() => unsafeWindow.aid);
    const json = await Ajax.getJsonWithCredentials("https://api.bilibili.com/x/v2/history/toview/web");
    if (json.code !== 0) {
        json.data = { list: [] };
    }
    const watchlaterList = json.data.list.map((it) => it.aid);
    if (watchlaterList.includes(parseInt(aid))) {
        watchlaterButton.classList.add("on");
    }
    watchlaterButton.addEventListener("click", () => {
        watchlaterButton.classList.toggle("on");
        if (watchlaterButton.classList.contains("on")) {
            Ajax.postTextWithCredentials("https://api.bilibili.com/x/v2/history/toview/add", `aid=${aid}&csrf=${csrf}`);
        }
        else {
            Ajax.postTextWithCredentials("https://api.bilibili.com/x/v2/history/toview/del", `aid=${aid}&csrf=${csrf}`);
        }
    });
})();

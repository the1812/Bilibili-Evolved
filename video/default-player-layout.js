(() =>
{
    return (settings, resources) =>
    {
        (async () =>
        {
            const videoDropdown = await SpinQuery.select(() => document.querySelector(`input[key=defaultPlayerLayout]`));
            const bangumiDropdown = await SpinQuery.select(() => document.querySelector(`input[key=defaultBangumiLayout]`));
            if (!videoDropdown || !bangumiDropdown)
            {
                logError("无法加载播放器布局选项.");
                return;
            }
            class LayoutCookie
            {
                setCookie(key, value)
                {
                    document.cookie = `${key}=${value};path=/;domain=.bilibili.com;max-age=31536000`;
                }
                clearCookie(key)
                {
                    document.cookie = `${key}=;path=/;domain=.bilibili.com;max-age=0`;
                }
                getValue(key)
                {
                    return document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)${key}\\s*\\=\\s*([^;]*).*$)|^.*$`), "$1");
                }
                useNewLayout() { }
                useOldLayout() { }
                setLayout(newLayout)
                {
                    if (newLayout)
                    {
                        this.useNewLayout();
                    }
                    else
                    {
                        this.useOldLayout();
                    }
                }
            }
            class VideoLayoutCookie extends LayoutCookie
            {
                constructor()
                {
                    super();
                    this.cookieKey = "stardustvideo";
                }
                useNewLayout()
                {
                    this.setCookie(this.cookieKey, 1);
                }
                useOldLayout()
                {
                    this.setCookie(this.cookieKey, -1);
                }
            }
            class BangumiLayoutCookie extends LayoutCookie
            {
                constructor()
                {
                    super();
                    this.cookieKey = "stardustpgcv";
                }
                useNewLayout()
                {
                    this.setCookie(this.cookieKey, "0606");
                }
                useOldLayout()
                {
                    this.clearCookie(this.cookieKey);
                }
            }

            const videoCookie = new VideoLayoutCookie();
            $(videoDropdown).on("input", () =>
            {
                videoCookie.setLayout(videoDropdown.value === "新版");
            });
            const bangumiCookie = new BangumiLayoutCookie();
            $(bangumiDropdown).on("input", () =>
            {
                bangumiCookie.setLayout(bangumiDropdown.value === "新版");
            });
        })();
    };
})();
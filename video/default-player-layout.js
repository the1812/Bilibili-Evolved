(() =>
{
    return (settings, resources) =>
    {
        (async () =>
        {
            const dropdown = await SpinQuery.select(() => document.querySelector(`input[key=defaultPlayerLayout]`));
            if (!dropdown)
            {
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
                static getAll()
                {
                    return [
                        new VideoLayoutCookie(),
                        new BangumiLayoutCookie(),
                    ];
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

            const cookies = LayoutCookie.getAll();
            $(dropdown).on("change", () =>
            {
                cookies.forEach(it => it.setLayout(dropdown.value === "新版"));
            });
        })();
    };
})();
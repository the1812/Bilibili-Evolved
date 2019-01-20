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
                static get cookieKey() { return "stardustvideo"; }
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
                static get cookieKey() { return "stardustpgcv"; }
                useNewLayout()
                {
                    this.setCookie(this.cookieKey, "0606");
                }
                useOldLayout()
                {
                    this.clearCookie(this.cookieKey);
                }
            }
            // const isNewLayout = document.cookie.split(";")
            //     .filter(it => it.includes(`${VideoLayoutCookie.cookieKey}=1`)
            //         || it.includes(BangumiLayoutCookie.cookieKey)).length > 0
            //     ? false : true;

            const cookies = LayoutCookie.getAll();
            $(dropdown).on("change", () =>
            {
                cookies.forEach(it => it.setLayout(dropdown.value === "新版"));
            });
        })();
    };
})();
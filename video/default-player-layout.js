(async () =>
{
    const videoDropdown = await SpinQuery.select(() => document.querySelector(`input[key=defaultPlayerLayout]`));
    const bangumiDropdown = await SpinQuery.select(() => document.querySelector(`input[key=defaultBangumiLayout]`));
    // const navbarOption = await SpinQuery.select(() => document.querySelector(`input[key=overrideNavBar]`));
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
        checkSettings()
        {
            return settings.useDefaultPlayerLayout;
        }
        checkCookies()
        {
            if (!this.checkSettings())
            {
                return;
            }
        }
        useNewLayout()
        {
            if (!this.checkSettings())
            {
                return;
            }
        }
        useOldLayout()
        {
            if (!this.checkSettings())
            {
                return;
            }
        }
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
        checkCookies()
        {
            super.checkCookies();
            const value = this.getValue(this.cookieKey);
            if (value === "" || parseInt(value) < 0 && settings.defaultPlayerLayout !== "旧版")
            {
                this.useNewLayout();
            }
            else if (settings.defaultPlayerLayout !== "新版")
            {
                this.useOldLayout();
            }
        }
        constructor()
        {
            super();
            this.cookieKey = "stardustvideo";
            this.checkCookies();
        }
        useNewLayout()
        {
            super.useNewLayout();
            this.setCookie(this.cookieKey, 1);
            // navbarOption.disabled = false;
            // $(navbarOption).change();
        }
        useOldLayout()
        {
            super.useOldLayout();
            this.setCookie(this.cookieKey, -1);
            // if (settings.overrideNavBar)
            // {
            //     navbarOption.checked = false;
            //     navbarOption.disabled = true;
            //     $(navbarOption).change();
            //     settings.overrideNavBar = false;
            //     saveSettings(settings);
            //     Toast.info(`已关闭<span>搜索栏置顶</span>功能, 因为旧版视频播放器布局不兼容此功能.`, "提示", 5000);
            // }
        }
    }
    class BangumiLayoutCookie extends LayoutCookie
    {
        checkCookies()
        {
            super.checkCookies();
            const value = this.getValue(this.cookieKey);
            if (value === "" || parseInt(value) <= 0 && settings.defaultBangumiLayout !== "旧版")
            {
                this.useNewLayout();
            }
            else if (settings.defaultBangumiLayout !== "新版")
            {
                this.useOldLayout();
            }
        }
        constructor()
        {
            super();
            this.cookieKey = "stardustpgcv";
            this.checkCookies();
        }
        useNewLayout()
        {
            super.useNewLayout();
            this.setCookie(this.cookieKey, "0606");
        }
        useOldLayout()
        {
            super.useOldLayout();
            this.setCookie(this.cookieKey, 0);
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
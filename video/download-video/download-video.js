(() =>
{
    return () =>
    {
        class VideoFormat
        {
            constructor(quality, internalName, displayName)
            {
                this.quality = quality;
                this.internalName = internalName;
                this.displayName = displayName;
            }
            static get availableFormats()
            {
                return new Promise((resolve, reject) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${unsafeWinodw.aid}&cid=${unsafeWinodw.cid}&otype=json`;
                    downloadText(url, json =>
                    {
                        const data = JSON.parse(json).data;

                        const qualities = data.accept_quality;
                        const internalNames = data.accept_format.split(",");
                        const displayNames = data.accept_description;
                        const formats = [];
                        while (qualities.length > 0)
                        {
                            const format = new VideoFormat(
                                qualities.pop(),
                                internalNames.pop(),
                                displayNames.pop()
                            );
                            formats.push(format);
                        }
                        resolve(formats);
                    }, error => reject(`获取清晰度信息失败: ${error}`));
                });
            }
        }
        class VideoInfoFragment
        {
            constructor(length, size, url, backupUrls)
            {
                this.length = length;
                this.size = size;
                this.url = url;
                this.backupUrls = backupUrls;
            }
        }
        class VideoInfo
        {
            constructor(format, fragments)
            {
                this.format = format;
                this.fragments = fragments || [];
            }
            fetchVideoInfo()
            {
                return new Promise((resolve, reject) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${unsafeWinodw.aid}&cid=${unsafeWinodw.cid}&qn=${this.format.quality}&otype=json`;
                    downloadText(url, json =>
                    {
                        const data = JSON.parse(json).data;
                        if (data.quality !== this.format.quality)
                        {
                            reject("获取下载链接失败, 请确认当前账号有下载权限后重试.");
                        }
                        const urls = data.durl;
                        this.fragments = urls.map(it => new VideoInfoFragment(
                            it.length, it.size, it.url, it.backup_url
                        ));
                        if (this.fragments.length > 1)
                        {
                            reject("暂不支持分段视频的下载.");
                        }
                        resolve();
                    });
                });
            }
        }
    };
})();
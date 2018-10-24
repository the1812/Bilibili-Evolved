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
                return new Promise((resolve) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${unsafeWinodw.aid}&cid=${unsafeWinodw.cid}&qn=${this.format.quality}&otype=json`;
                    downloadText(url, json =>
                    {
                        const data = JSON.parse(json).data.durl;

                    });
                });
            }
        }
        function fetchAvailableFormats()
        {
            return new Promise((resolve) =>
            {
                const url = `https://api.bilibili.com/x/player/playurl?avid=${unsafeWinodw.aid}&cid=${unsafeWinodw.cid}&otype=json`;
                downloadText(url, json => resolve(json));
            });
        }
    };
})();
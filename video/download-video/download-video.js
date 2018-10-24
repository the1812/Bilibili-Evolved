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
        class VideoInfo
        {
            constructor(format, length, size, url, backupUrls)
            {
                this.format = format;
                this.length = length;
                this.size = size;
                this.url = url;
                this.backupUrls = backupUrls;
            }
            fetchVideoInfo()
            {
                return new Promise((resolve) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${unsafeWinodw.aid}&cid=${unsafeWinodw.cid}&qn=${this.format.quality}&otype=json`;

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
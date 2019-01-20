(() =>
{
    return (settings, resources) =>
    {
        class Medal
        {
            constructor({ medal_id, status, level, medalName, uname })
            {
                this.id = medal_id;
                this.isActive = status === 1;
                this.level = level;
                this.name = medalName;
                this.upName = uname;
            }
            static async getList()
            {
                const json = JSON.parse(await Ajax.getTextWithCredentials("https://api.live.bilibili.com/i/api/medal?page=1&pageSize=256"));
                if (json.code !== 0)
                {
                    logError("无法获取勋章列表.");
                    return [];
                }
                return json.data.fansMedalList.map(it => new Medal(it));
            }

        }
    };
})();
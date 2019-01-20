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
            static parseJson(text, { successAction, errorMessage, errorAction })
            {
                const json = JSON.parse(text);
                if (json.code !== 0)
                {
                    logError(`${errorMessage} 错误码:${json.code} ${json.message || ""}`);
                    return errorAction(json);
                }
                return successAction(json);
            }
            static async getList()
            {
                return Medal.parseJson(
                    await Ajax.getTextWithCredentials("https://api.live.bilibili.com/i/api/medal?page=1&pageSize=256"),
                    {
                        successAction: json => json.data.fansMedalList.map(it => new Medal(it)),
                        errorAction: () => [],
                        errorMessage: "无法获取勋章列表.",
                    });
            }
            async activate()
            {
                return Medal.parseJson(
                    await Ajax.getTextWithCredentials(`https://api.live.bilibili.com/i/ajaxWearFansMedal?medal_id=${this.id}`),
                    {
                        successAction: () => true,
                        errorAction: () => false,
                        errorMessage: "佩戴勋章失败.",
                    });
            }
            async deactivate()
            {
                return Medal.parseJson(
                    await Ajax.getTextWithCredentials(`https://api.live.bilibili.com/i/ajaxCancelWear`),
                    {
                        successAction: () => true,
                        errorAction: () => false,
                        errorMessage: "卸下勋章失败.",
                    });
            }
        }
    };
})();
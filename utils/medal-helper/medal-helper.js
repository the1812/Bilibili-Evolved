(() =>
{
    return (settings, resources) =>
    {
        class Badge
        {
            constructor(isActive)
            {
                this.isActive = isActive;
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
        }
        class Medal extends Badge
        {
            constructor({ medal_id, status, level, medalName, uname })
            {
                super(status === 1);
                this.id = medal_id;
                this.level = level;
                this.name = medalName;
                this.upName = uname;
            }
            static async getList()
            {
                return Badge.parseJson(
                    await Ajax.getTextWithCredentials("https://api.live.bilibili.com/i/api/medal?page=1&pageSize=256"),
                    {
                        successAction: json => json.data.fansMedalList.map(it => new Medal(it)),
                        errorAction: () => [],
                        errorMessage: "无法获取勋章列表.",
                    });
            }
            async activate()
            {
                return Badge.parseJson(
                    await Ajax.getTextWithCredentials(`https://api.live.bilibili.com/i/ajaxWearFansMedal?medal_id=${this.id}`),
                    {
                        successAction: () => true,
                        errorAction: () => false,
                        errorMessage: "佩戴勋章失败.",
                    });
            }
            async deactivate()
            {
                return Badge.parseJson(
                    await Ajax.getTextWithCredentials(`https://api.live.bilibili.com/i/ajaxCancelWear`),
                    {
                        successAction: () => true,
                        errorAction: () => false,
                        errorMessage: "卸下勋章失败.",
                    });
            }
        }
        class Title extends Badge
        {
            constructor({ id, cid, wear, css, name, source })
            {
                super(wear);
                this.id = id;
                this.cid = cid;
                this.imageId = css;
                this.name = name;
                this.source = source;
                Title.getImageMap().then(it =>
                {
                    this.imageUrl = it[this.imageId];
                });
            }
            static async getImageMap()
            {
                if (Title.imageMap === undefined)
                {
                    return Badge.parseJson(
                        await Ajax.getTextWithCredentials("https://api.live.bilibili.com/rc/v1/Title/webTitles"),
                        {
                            successAction(json)
                            {
                                Title.imageMap = {};
                                json.data.forEach(it =>
                                {
                                    Title.imageMap[it.identification] = it.web_pic_url;
                                });
                                return Title.imageMap;
                            },
                            errorAction: () => { return {}; },
                            errorMessage: "获取头衔图片失败.",
                        });
                }
                else
                {
                    return Title.imageMap;
                }
            }
            static async getList()
            {
                return Badge.parseJson(
                    await Ajax.getTextWithCredentials("https://api.live.bilibili.com/i/api/ajaxTitleInfo?page=1&pageSize=256&had=1"),
                    {
                        successAction: json => json.data.list.map(it => new Title(it)),
                        errorAction: () => [],
                        errorMessage: "无法获取头衔列表.",
                    });
            }
            async activate()
            {
                return Badge.parseJson(
                    await Ajax.postTextWithCredentials(`https://api.live.bilibili.com/i/ajaxWearTitle`, `id=${this.id}&cid=${this.cid}`),
                    {
                        successAction: () => true,
                        errorAction: () => false,
                        errorMessage: "佩戴头衔失败.",
                    });
            }
            async deactivate()
            {
                return Badge.parseJson(
                    await Ajax.postTextWithCredentials(`https://api.live.bilibili.com/i/ajaxCancelWearTitle`, ""),
                    {
                        successAction: () => true,
                        errorAction: () => false,
                        errorMessage: "卸下头衔失败.",
                    });
            }
        }
        return {
            export: {
                Badge,
                Medal,
                Title,
            },
        };
    };
})();
(() =>
{
    return (settings, resources) =>
    {
        class Badge
        {
            constructor(isActive, id)
            {
                this.isActive = isActive;
                this.id = id;
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
                super(status === 1, medal_id);
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
            static getContainer()
            {
                return $("#medal-helper .popup ul");
            }
            static getItemTemplate(medal)
            {
                return `<li data-id='${medal.id}' ${medal.isActive ? "class='active'" : ""}>
                <label title='${medal.upName}'>
                    <input name='medal' type='radio' ${medal.isActive ? "checked" : ""}>
                    <div class='fans-medal-item level-${medal.level}'>
                        <span class='label'>${medal.name}</span>
                        <span class='level'>${medal.level}</span>
                    </div>
                </label>
                </li>`;
            }
            async activate()
            {
                return Badge.parseJson(
                    await Ajax.getTextWithCredentials(`https://api.live.bilibili.com/i/ajaxWearFansMedal?medal_id=${this.id}`),
                    {
                        successAction: () =>
                        {
                            this.isActive = true;
                            return true;
                        },
                        errorAction: () => false,
                        errorMessage: "佩戴勋章失败.",
                    });
            }
            async deactivate()
            {
                return Badge.parseJson(
                    await Ajax.getTextWithCredentials(`https://api.live.bilibili.com/i/ajaxCancelWear`),
                    {
                        successAction: () =>
                        {
                            this.isActive = false;
                            return true;
                        },
                        errorAction: () => false,
                        errorMessage: "卸下勋章失败.",
                    });
            }
        }
        class Title extends Badge
        {
            constructor({ id, cid, wear, css, name, source })
            {
                super(wear, css);
                this.tid = id;
                this.cid = cid;
                this.name = name;
                this.source = source;
                Title.getImageMap().then(it =>
                {
                    this.imageUrl = it[this.id];
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
            static getContainer()
            {
                return $("#title-helper .popup ul");
            }
            static getItemTemplate(title)
            {
                return `<li data-id='${title.id}' ${title.isActive ? "class='active'" : ""}>
                <label title='${title.name}'>
                    <input name='medal' type='radio' ${title.isActive ? "checked" : ""}>
                    <img src='${title.imageUrl}' class="title-image">
                </label>
                </li>`;
            }
            async activate()
            {
                return Badge.parseJson(
                    await Ajax.postTextWithCredentials(`https://api.live.bilibili.com/i/ajaxWearTitle`, `id=${this.tid}&cid=${this.cid}`),
                    {
                        successAction: () =>
                        {
                            this.isActive = true;
                            return true;
                        },
                        errorAction: () => false,
                        errorMessage: "佩戴头衔失败.",
                    });
            }
            async deactivate()
            {
                return Badge.parseJson(
                    await Ajax.postTextWithCredentials(`https://api.live.bilibili.com/i/ajaxCancelWearTitle`, ""),
                    {
                        successAction: () =>
                        {
                            this.isActive = false;
                            return true;
                        },
                        errorAction: () => false,
                        errorMessage: "卸下头衔失败.",
                    });
            }
        }
        async function loadBadges(BadgeClass)
        {
            const badgeContainer = BadgeClass.getContainer();
            const badges = await BadgeClass.getList();
            const updateList = async () =>
            {
                const badges = await BadgeClass.getList();
                badges.forEach(badge =>
                {
                    const li = badgeContainer.find(`li[data-id=${badge.id}]`);
                    if (badge.isActive)
                    {
                        li.addClass("active");
                    }
                    else
                    {
                        li.removeClass("active");
                    }
                    li.find(`input`).prop("checked", badge.isActive);
                });
            };
            badges.forEach(badge =>
            {
                const item = $(BadgeClass.getItemTemplate(badge));
                badgeContainer.append(item);
                const input = item.find("input")[0];
                item.on("click", e =>
                {
                    if (e.target === input)
                    {
                        return;
                    }
                    if (badge.isActive)
                    {
                        badge.deactivate().then(updateList);
                    }
                    else
                    {
                        const activeBadge = badges.find(it => it.isActive);
                        if (activeBadge)
                        {
                            activeBadge.isActive = false;
                        }
                        badge.activate().then(updateList);
                    }
                });
            });
        }
        return {
            export: {
                Badge,
                Medal,
                Title,
            },
            widget: {
                condition: () => document.domain === "live.bilibili.com",
                content: resources.data.medalHelperDom.text,
                success: () =>
                {
                    $(".medal-helper").each((_, it) =>
                    {
                        const $it = $(it);
                        const popup = $it.find(".popup")[0];
                        $it.on("click", e =>
                        {
                            if (!popup.contains(e.target))
                            {
                                popup.classList.toggle("opened");
                            }
                        });
                    });
                    loadBadges(Medal);
                    Title.getImageMap().then(() => loadBadges(Title));
                },
            }
        };
    };
})();
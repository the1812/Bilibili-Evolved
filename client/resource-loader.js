export function loadResources()
{
    Resource.root = "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/";
    Resource.all = {};
    Resource.displayNames = {};
    Resource.reloadables = {
        useDarkStyle: "useDarkStyle",
        hideBanner: "hideBanner",
        customNavbar: "customNavbar",
        playerShadow: "playerShadow",
        narrowDanmaku: "narrowDanmaku",
        compactLayout: "compactLayout",
        useCommentStyle: "useCommentStyle",
        removeVideoTopMask: "removeVideoTopMask",
        hideOldEntry: "hideOldEntry",
        hideBangumiReviews: "hideBangumiReviews",
    };
    for (const [key, data] of Object.entries(Resource.manifest))
    {
        const resource = new Resource(data.path, data.styles);
        resource.key = key;
        resource.dropdown = data.dropdown;
        if (data.displayNames)
        {
            resource.displayName = data.displayNames[key];
            Object.assign(Resource.displayNames, data.displayNames);
        }
        if (data.style)
        {
            const styleKey = key + "Style";
            const style = Resource.all[styleKey] = new Resource(data.path.replace(".js", ".css"));
            style.key = styleKey;
            switch (data.style)
            {
                case "instant":
                    {
                        resource.styles.push(styleKey);
                        break;
                    }
                case true:
                    {
                        resource.dependencies.push(style);
                        break;
                    }
                case "important":
                    {
                        resource.styles.push({
                            key: styleKey,
                            important: true,
                        });
                        break;
                    }
                default:
                    {
                        if (typeof data.style === "object")
                        {
                            resource.styles.push(Object.assign({ key: styleKey }, data.style));
                        }
                        break;
                    }
            }
        }
        if (data.html === true)
        {
            const htmlKey = key + "Html";
            const html = Resource.all[htmlKey] = new Resource(data.path.replace(".js", ".html"));
            html.key = htmlKey;
            resource.dependencies.push(html);
        }
        Resource.all[key] = resource;
    }
    for (const [key, data] of Object.entries(Resource.manifest))
    {
        if (data.dependencies)
        {
            Resource.all[key].dependencies.push(...data.dependencies.map(name => Resource.all[name]));
        }
    }
}

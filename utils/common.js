const colors = {
    red: "#E53935",
    pink: "#F06292",
    purple: "#AB47BC",
    deepPurple: "#7E57C2",
    indigo: "#7986CB",
    blue: "#1E88E5",
    lightBlue: "#00A0D8",
    cyan: "#00ACC1",
    teal: "#26A69A",
    green: "#66BB6A",
    lightGreen: "#8BC34A",
    lime: "#CDDC39",
    yellow: "#FFEB3B",
    amber: "#FFC107",
    orange: "#FF9800",
    deepOrange: "#FF5722",
    brown: "#795548",
    grey: "#757575",
    blueGrey: "#607D8B"
};
// User settings will overwrite default settings below
const userSettings = {
    customStyleColor: colors.pink,
    showBanner: false,
    useDarkMode: true
};
settings = {
    // remove ads
    removeAds: true,
    // max retry count used for query elements
    maxQueryRetry: 30,
    // query retry interval (ms)
    queryInterval: 500,
    // touch support for nav bar (not compatible with Edge)
    touchNavBar: true,
    // (Experimental) touch support for video player
    touchVideoPlayer: true,
    // redirect to original sites in watchlater list
    watchLaterRedirect: true,
    // auto expand danmaku list
    expandDanmakuList: true,
    // use new styles for nav bar and player
    useNewStyles: true,
    // [New Styles]
    // set theme color (must in #rrggbb format, not compatible with Edge)
    customStyleColor: colors.pink,
    // [New Styles]
    // set background blur opacity of nav bar
    blurBackgroundOpacity: 0.382,
    // [New Styles]
    // (Not Implemented) use dark mode
    useDarkMode: true,
    // [New Styles]
    // (Experimental) use new nav bar in old sites
    overrideNavBar: true,
    // [New Styles -> Override Nav Bar]
    // show top banner
    showBanner: true
};
for (const key in userSettings)
{
    settings[key] = userSettings[key];
}
function waitForQuery()
{
    const MaxRetry = settings.maxQueryRetry;
    let retry = 0;
    const tryQuery = (query, condition, action, failed) =>
    {
        if (retry >= MaxRetry)
        {
            if (failed)
            {
                failed();
            }
        }
        else
        {
            const result = query();
            if (condition(result))
            {
                action(result);
            }
            else
            {
                retry++;
                setTimeout(() => tryQuery(query, condition, action, failed), settings.queryInterval);
            }
        }
    };
    return tryQuery;
}
function getStyle(name)
{
    const style = GM_getResourceText(name);
    function replaceCustomColor(style)
    {
        const foreground = (() =>
        {
            const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(settings.customStyleColor);
            const color = regex ? {
                r: parseInt(regex[1], 16),
                g: parseInt(regex[2], 16),
                b: parseInt(regex[3], 16)
            } : undefined;
            if (color)
            {
                const grey = 1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
                if (grey < 0.35)
                {
                    return "#000";
                }
                else
                {
                    return "#fff";
                }
            }
            else
            {
                return "#fff";
            }
        })();
        settings.brightness = `${foreground === "#000" ? "100" : "0"}%`;
        settings.filterBrightness = foreground === "#000" ? "0" : "100";
        for (name of settings)
        {
            style = style.replace(`$${name}`, settings[name]);
        }
        return style;
    }
    return replaceCustomColor(style, foreground);
}

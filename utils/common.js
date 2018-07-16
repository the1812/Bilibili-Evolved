function waitForQuery()
{
    const MaxRetry = 30;
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
                setTimeout(() => tryQuery(query, condition, action, failed), 500);
            }
        }
    };
    return tryQuery;
}
function getStyle(key, settings)
{
    const style = GM_getResourceText(key);
    const replaceCustomColor = (style, settings) =>
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
        settings.foreground = foreground;
        settings.brightness = `${foreground === "#000" ? "100" : "0"}%`;
        settings.filterBrightness = foreground === "#000" ? "0" : "100";
        for (key of Object.keys(settings))
        {
            style = style.replace(new RegExp("\\$" + key, "g"), settings[key]);
        }
        return style;
    };
    return replaceCustomColor(style, settings);
}

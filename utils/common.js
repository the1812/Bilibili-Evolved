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

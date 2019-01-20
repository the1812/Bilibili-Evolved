(() =>
{
    return (settings, resources) =>
    {
        (async () =>
        {
            const dropdown = await SpinQuery.select(() => document.querySelector(`input[key=defaultPlayerLayout]`));
            if (!dropdown)
            {
                return;
            }
            const cookieKey = "stardustvideo";
            const oldLayout = "旧版";
            const newLayout = "新版";
            const cookieValues = {
                [oldLayout]: -1,
                [newLayout]: 1,
            };
            const currentLayout = document.cookie.split(";")
                .filter(it => it.includes(cookieKey + "=" + cookieValues.oldLayout)).length > 0 ? oldLayout : newLayout;

            function setLayout(layoutName)
            {
                document.cookie = `${cookieKey}=${cookieValues[layoutName]};path=/;domain=.bilibili.com;max-age=31536000`;
                window.location.reload();
            }
            $(dropdown).on("change", () =>
            {
                setLayout(dropdown.value);
            });
            if (settings.defaultPlayerLayout !== currentLayout)
            {
                setLayout(settings.defaultPlayerLayout);
            }
        })();
    };
})();
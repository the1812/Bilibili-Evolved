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
            const cookieValues = {
                "旧版": 0,
                "新版1": 1,
                "新版2": 2,
            };
            dropdown.addEventListener("change", () =>
            {
                document.cookie = `${cookieKey}${cookieValues[dropdown.value]};path=/;domain=.bilibili.com;max-age=31536000`;
                window.location.reload();
            });
        })();
    };
})();
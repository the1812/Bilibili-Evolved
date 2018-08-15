(() =>
{
    return () =>
    {
        const id = "bilibili-live-watermark";
        if ($(id).length === 0)
        {
            $("html").prepend(`
            <style id='${id}'>
                .bilibili-live-player-video-logo
                {
                    display: none !important;
                }
            </style>
            `);
        }
        return {
            ajaxReload: false
        };
    };
})();

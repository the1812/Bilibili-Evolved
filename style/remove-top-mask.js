(() =>
{
    return (_, resources) =>
    {
        const id = "bilibili-video-top-mask";
        if ($(`#${id}`).length === 0)
        {
            resources.applyStyleFromText(`
            <style id='${id}'>
                .bilibili-player-video-top
                {
                    display: none !important;
                }
            </style>
            `);
        }
    };
})();
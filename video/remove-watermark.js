(() =>
{
    return (_, resources) =>
    {
        const id = "bilibili-live-watermark";
        if ($(`#${id}`).length === 0)
        {
            resources.applyStyleFromText(`
            <style id='${id}'>
                .bilibili-live-player-video-logo
                {
                    display: none !important;
                }
            </style>
            `);
        }
    };
})();

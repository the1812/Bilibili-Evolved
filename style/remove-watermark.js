const id = "bilibili-live-watermark";
if ($(`#${id}`).length === 0)
{
    resources.applyStyleFromText(/*html*/`
        <style id='${id}'>
            .bilibili-live-player-video-logo
            {
                display: none !important;
            }
        </style>
        `);
}
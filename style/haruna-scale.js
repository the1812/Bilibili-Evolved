const id = "bilibili-haruna-scale";
if ($(id).length === 0)
{
    resources.applyStyleFromText(/*html*/`
        <style id='${id}'>
            .haruna-ctnr,
            .avatar-btn
            {
                transform: scale(${1 / window.devicePixelRatio}) !important;
            }
        </style>
        `);
}
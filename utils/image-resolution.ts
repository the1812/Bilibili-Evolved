const regex = /@(\d+)[Ww]_(\d+)[Hh]/;
const dpi = settings.imageResolutionScale === "auto" ? window.devicePixelRatio : parseInt(settings.imageResolutionScale);
const excludeSelectors = [
    "#certify-img1",
    "#certify-img2",
];
const imageFormats = [
    ".jpg",
    ".png",
    ".gif",
    ".webp"
]
export function imageResolution(element: HTMLImageElement)
{
    const replaceSource = () =>
    {
        if (excludeSelectors.some(it => element.matches(it)))
        {
            return;
        }
        if (!imageFormats.some(it => element.src.endsWith(it)))
        {
            return;
        }
        const match = element.src.match(regex);
        if (!match)
        {
            return;
        }
        let [, width, height] = match;
        let lastWidth = parseInt(element.getAttribute("data-resolution-width") || "0");
        if (parseInt(width) >= lastWidth && lastWidth !== 0)
        {
            return;
        }
        if (element.getAttribute("width") === null && element.getAttribute("height") === null)
        {
            element.setAttribute("width", width);
        }
        width = (dpi * parseInt(width)).toString();
        height = (dpi * parseInt(height)).toString();
        element.setAttribute("data-resolution-width", width);
        element.src = element.src.replace(regex, `@${width}w_${height}h`);

    };
    Observer.observe(element, () =>
    {
        replaceSource();
    }, { attributeFilter: ["src"], attributes: true });
}
document.querySelectorAll("img").forEach(it => imageResolution(it));
Observer.childListSubtree(document.body, records =>
{
    for (const record of records)
    {
        for (const node of record.addedNodes)
        {
            if (node.nodeName.toLowerCase() === "img")
            {
                imageResolution(node as HTMLImageElement);
            }
            else if (node instanceof Element)
            {
                node.querySelectorAll("img").forEach(it => imageResolution(it));
            }
        }
    }
});
export default {
    export: { imageResolution }
};
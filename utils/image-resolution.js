const regex = /@(\d+)[Ww]_(\d+)[Hh]/;
const dpi = settings.imageResolutionScale === "auto" ? window.devicePixelRatio : parseFloat(settings.imageResolutionScale);
const excludeSelectors = [
    "#certify-img1",
    "#certify-img2",
];
// const imageFormats = [
//     ".jpg",
//     ".png",
//     ".gif",
//     ".webp"
// ];
const walk = (rootElement, action) => {
    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_ELEMENT, null, false);
    let node = walker.nextNode();
    while (node) {
        action(node);
        node = walker.nextNode();
    }
};
export async function imageResolution(element) {
    const replaceSource = (getValue, setValue) => {
        const value = getValue(element);
        if (value === null) {
            return;
        }
        if (excludeSelectors.some(it => element.matches(it))) {
            return;
        }
        // if (!imageFormats.some(it => value.endsWith(it)))
        // {
        //     return;
        // }
        const match = value.match(regex);
        if (!match) {
            return;
        }
        let [, width, height] = match;
        let lastWidth = parseInt(element.getAttribute("data-resolution-width") || "0");
        if (parseInt(width) >= lastWidth && lastWidth !== 0) {
            return;
        }
        if (element.getAttribute("width") === null && element.getAttribute("height") === null) {
            element.setAttribute("width", width);
        }
        width = Math.round(dpi * parseInt(width)).toString();
        height = Math.round(dpi * parseInt(height)).toString();
        element.setAttribute("data-resolution-width", width);
        setValue(element, value.replace(regex, `@${width}w_${height}h`));
    };
    Observer.attributes(element, () => {
        replaceSource(e => e.getAttribute("src"), (e, v) => e.setAttribute("src", v));
        replaceSource(e => e.style.backgroundImage, (e, v) => e.style.backgroundImage = v);
    });
}
const startResolution = async () => {
    walk(document.body, it => imageResolution(it));
    Observer.childListSubtree(document.body, records => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node instanceof HTMLElement) {
                    imageResolution(node);
                    if (node.nodeName.toUpperCase() !== "IMG") {
                        walk(node, it => imageResolution(it));
                    }
                }
            }
        }
    });
};
startResolution();
// if (document.readyState === "complete")
// {
//     startResolution();
// }
// else
// {
//     unsafeWindow.addEventListener('load', () => startResolution());
// }
export default {
    export: { imageResolution }
};

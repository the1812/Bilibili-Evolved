const regex = /(.*?)@(.*)\./;
export function imageResolution(element)
{
    const observer = new Observer(element, () =>
    {
        const src = element.getAttribute("src");
        const match = src.match(regex);
        if (match && match[1])
        {
            element.setAttribute("src", match[1]);
            observer.stop();
        }
    });
    observer.options = {
        childList: false,
        attributes: true,
        subtree: false,
    };
    observer.start();
}
document.querySelectorAll("img").forEach(it => imageResolution(it));
Observer.childListSubtree("body", mutations =>
{
    for (const mutation of mutations)
    {
        for (const node of mutation.addedNodes)
        {
            if (node.nodeName.toLowerCase() === "img")
            {
                imageResolution(node);
            }
        }
    }
});
export default {
    export: { imageResolution }
};
const regex = /(.*?)@(.*)\./;
const excludeIds = [
    "certify-img1",
    "certify-img2",
];
const MaxChangedTimes = 8;
export function imageResolution(element)
{
    if (excludeIds.includes(element.id))
    {
        return;
    }
    let changedTimes = 0;
    const observer = new Observer(element, () =>
    {
        changedTimes++;
        if (changedTimes > MaxChangedTimes)
        {
            observer.stop();
            return;
        }
        const src = element.getAttribute("src");
        const match = src.match(regex);
        if (match && match[1])
        {
            observer.stop();
            element.setAttribute("src", match[1]);
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
            node.querySelectorAll && node.querySelectorAll("img").forEach(it => imageResolution(it));
        }
    }
});
export default {
    export: { imageResolution }
};
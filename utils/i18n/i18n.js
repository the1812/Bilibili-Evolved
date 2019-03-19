(async () =>
{
    const { map: englishMap } = await import("./i18n.en-US");
    // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
    const getAllTextNodes = rootElement =>
    {
        const nodes = [];
        const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);
        let node = walker.nextNode();
        while (node)
        {
            nodes.push(node);
            node = walker.nextNode();
        }
        return nodes;
    };
    const translateTextNode = textNode =>
    {
        const translation = englishMap.get(textNode.nodeValue.trim());
        if (translation !== undefined)
        {
            textNode.nodeValue = translation;
        }
    };
    getAllTextNodes(document.body).forEach(translateTextNode);
    Observer.childListSubtree("body", records =>
    {
        records.forEach(it => [...it.addedNodes].forEach(node =>
        {
            if (node.nodeType === Node.TEXT_NODE)
            {
                translateTextNode(node);
            }
            else
            {
                getAllTextNodes(node).forEach(translateTextNode);
            }
        }));
    });
})();
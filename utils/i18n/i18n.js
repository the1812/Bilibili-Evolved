(async () =>
{
    const map = await import(`./i18n.${settings.i18nLanguage}`);
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
        const translation = map.get(textNode.nodeValue.trim());
        if (translation !== undefined)
        {
            if (typeof translation === "string")
            {
                textNode.nodeValue = translation;
            }
            else
            {
                const { text, selector } = translation;
                if (textNode.parentElement.matches(selector))
                {
                    textNode.nodeValue = text;
                }
            }
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
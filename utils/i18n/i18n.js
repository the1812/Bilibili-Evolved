(async () =>
{
    const languageCodeMap = {
        "日本語": "ja-JP",
        "English": "en-US",
    };
    const { map } = await import(`./i18n.${languageCodeMap[settings.i18nLanguage]}`);
    // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
    const forEachTextNode = (rootElement, action) =>
    {
        const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);
        let node = walker.nextNode();
        while (node)
        {
            action(node);
            node = walker.nextNode();
        }
    };
    const translateCssMatches = () =>
    {
        for (const { selector, text } of map.get("*"))
        {
            const element = document.querySelector(selector);
            if (element)
            {
                forEachTextNode(element, it => it.nodeValue = text);
            }
        }
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
            else if (Array.isArray(translation))
            {
                let finalTranslation = null;
                for (const subTranslation of translation)
                {
                    if (typeof subTranslation === "string")
                    {
                        finalTranslation = subTranslation;
                    }
                    else
                    {
                        const { text, selector } = subTranslation;
                        if (textNode.parentElement.matches(selector))
                        {
                            finalTranslation = text;
                        }
                    }
                }
                if (finalTranslation !== null)
                {
                    textNode.nodeValue = finalTranslation;
                }
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
    forEachTextNode(document.body, translateTextNode);
    translateCssMatches();
    Observer.childListSubtree("body", records =>
    {
        records.forEach(it =>
        {
            if (it.addedNodes.length > 0)
            {
                translateCssMatches();
            }
            it.addedNodes.forEach(node =>
            {
                if (node.nodeType === Node.TEXT_NODE)
                {
                    translateTextNode(node);
                }
                else
                {
                    forEachTextNode(node, translateTextNode);
                }
            });
        });
    });
})();
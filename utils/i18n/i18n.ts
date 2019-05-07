const languageCodeMap: { [key: string]: string } = {
    "日本語": "ja-JP",
    "English": "en-US",
    "Deutsch": "de-DE",
};
export class Translator
{
    static textNode: TextNodeTranslator;
    static title: TitleTranslator;
    static placeholder: PlaceholderTranslator;
    static allTranslators: Translator[];
    static map: Map<string, any>;
    static regex: [RegExp, string][];

    accepts(node: Node) { return node.nodeType === Node.ELEMENT_NODE; }
    getValue(node: Node) { return node.nodeValue; }
    setValue(node: Node, value: string) { node.nodeValue = value; }
    getElement(node: Node) { return node as Element; }
    translate(node: Node)
    {
        const value = this.getValue(node);
        if (!value || typeof value !== "string" || value === "*")
        {
            return;
        }
        const translation = Translator.map.get(value.trim());
        if (translation === undefined)
        {
            const result = Translator.regex.find(([r]) => r.test(value));
            if (result)
            {
                const [regex, replacement] = result;
                this.setValue(node, value.replace(regex, replacement));
            }
        }
        else if (typeof translation === "string")
        {
            this.setValue(node, translation);
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
                    const { text, selector, not } = subTranslation;
                    if (this.getElement(node).matches(selector) !== Boolean(not))
                    {
                        finalTranslation = text;
                    }
                }
            }
            if (finalTranslation !== null)
            {
                this.setValue(node, finalTranslation);
            }
        }
        else
        {
            const { text, selector, not } = translation;
            if (this.getElement(node).matches(selector) !== Boolean(not))
            {
                this.setValue(node, text);
            }
        }
    }
    // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
    static walk(rootElement: Node, action: (node: Node) => void)
    {
        const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
        let node = walker.nextNode();
        while (node)
        {
            action(node);
            node = walker.nextNode();
        }
    }
    static translate(rootElement: Node)
    {
        if (rootElement.nodeType === Node.TEXT_NODE)
        {
            Translator.textNode.translate(rootElement);
            return;
        }
        Translator.walk(rootElement, node =>
        {
            for (const translator of Translator.allTranslators)
            {
                if (translator.accepts(node))
                {
                    translator.translate(node);
                }
            }
        });
    }
    static translateCssMatches()
    {
        const selectors = Translator.map.get("*");
        if (!selectors)
        {
            return;
        }
        for (const { selector, text } of selectors)
        {
            const element = document.querySelector(selector);
            if (element)
            {
                [...element.childNodes].filter(it => it.nodeType === Node.TEXT_NODE).forEach(it => it.nodeValue = text);
            }
        }
    }
}
export class TextNodeTranslator extends Translator
{
    accepts(node: Node) { return node.nodeType === Node.TEXT_NODE; }
    getElement(node: Node)
    {
        return node.parentElement!;
    }
}
export class TitleTranslator extends Translator
{
    getValue(node: Node) { return (node as Element).getAttribute("title"); }
    setValue(node: Node, value: string)
    {
        (node as Element).setAttribute("title", value);
    }
}
export class PlaceholderTranslator extends Translator
{
    // accepts(node: Node) { return node.nodeName === "INPUT" && (node as HTMLInputElement).type.toUpperCase() === "TEXT" || node.nodeName === "TEXTAREA"; }
    getValue(node: Node) { return (node as Element).getAttribute("placeholder"); }
    setValue(node: Node, value: string)
    {
        (node as Element).setAttribute("placeholder", value);
    }
}

Translator.textNode = new TextNodeTranslator;
Translator.title = new TitleTranslator;
Translator.placeholder = new PlaceholderTranslator;
Translator.allTranslators = [Translator.textNode, Translator.title, Translator.placeholder];

(async () =>
{
    const languageCode = languageCodeMap[settings.i18nLanguage];
    const { map, regex } = await import(`./i18n.${languageCode}`);
    document.documentElement.setAttribute("lang", languageCode);
    Translator.map = map as Map<string, any>;
    Translator.regex = [...regex.entries()] as Array<[RegExp, string]>;

    Translator.translate(document.body);
    Translator.translateCssMatches();
    Observer.observe("body", records =>
    {
        records.forEach(it =>
        {
            if (it.type === "childList")
            {
                if (it.addedNodes.length > 0)
                {
                    Translator.translateCssMatches();
                }
                it.addedNodes.forEach(node =>
                {
                    Translator.translate(node);
                });
            }
            else if (it.type === "characterData")
            {
                Translator.textNode.translate(it.target);
            }
        });
    }, { characterData: true, childList: true, subtree: true });
})();

export default {
    export: {
        Translator,
        TextNodeTranslator,
        TitleTranslator,
        PlaceholderTranslator,
    },
    // dropdown: {
    //     key: "i18nLanguage",
    //     // items: Object.keys(languageCodeMap),
    //     items: [`日本語`],
    // },
};
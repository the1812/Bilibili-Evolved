const languageCodeMap = {
    "日本語": "ja-JP",
    "English": "en-US",
    "Deutsch": "de-DE",
};
export class Translator {
    accepts(node) { return node.nodeType === Node.ELEMENT_NODE; }
    getValue(node) { return node.nodeValue; }
    setValue(node, value) { node.nodeValue = value; }
    getElement(node) { return node; }
    translate(node) {
        const value = this.getValue(node);
        if (!value || typeof value !== "string" || value === "*") {
            return;
        }
        const translation = Translator.map.get(value.trim());
        if (translation === undefined) {
            return;
        }
        if (typeof translation === "string") {
            this.setValue(node, translation);
        }
        else if (Array.isArray(translation)) {
            let finalTranslation = null;
            for (const subTranslation of translation) {
                if (typeof subTranslation === "string") {
                    finalTranslation = subTranslation;
                }
                else {
                    const { text, selector, not } = subTranslation;
                    if (this.getElement(node).matches(selector) !== Boolean(not)) {
                        finalTranslation = text;
                    }
                }
            }
            if (finalTranslation !== null) {
                this.setValue(node, finalTranslation);
            }
        }
        else {
            const { text, selector, not } = translation;
            if (this.getElement(node).matches(selector) !== Boolean(not)) {
                this.setValue(node, text);
            }
        }
    }
    // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
    static walk(rootElement, action) {
        const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
        let node = walker.nextNode();
        while (node) {
            action(node);
            node = walker.nextNode();
        }
    }
    static translate(rootElement) {
        if (rootElement.nodeType === Node.TEXT_NODE) {
            Translator.textNode.translate(rootElement);
            return;
        }
        Translator.walk(rootElement, node => {
            for (const translator of Translator.allTranslators) {
                if (translator.accepts(node)) {
                    translator.translate(node);
                }
            }
        });
    }
    static translateCssMatches() {
        const selectors = Translator.map.get("*");
        if (!selectors) {
            return;
        }
        for (const { selector, text } of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                [...element.childNodes].filter(it => it.nodeType === Node.TEXT_NODE).forEach(it => it.nodeValue = text);
            }
        }
    }
}
export class TextNodeTranslator extends Translator {
    accepts(node) { return node.nodeType === Node.TEXT_NODE; }
    getElement(node) {
        return node.parentElement;
    }
}
export class TitleTranslator extends Translator {
    getValue(node) { return node.getAttribute("title"); }
    setValue(node, value) {
        node.setAttribute("title", value);
    }
}
export class PlaceholderTranslator extends Translator {
    // accepts(node: Node) { return node.nodeName === "INPUT" && (node as HTMLInputElement).type.toUpperCase() === "TEXT" || node.nodeName === "TEXTAREA"; }
    getValue(node) { return node.getAttribute("placeholder"); }
    setValue(node, value) {
        node.setAttribute("placeholder", value);
    }
}
Translator.textNode = new TextNodeTranslator;
Translator.title = new TitleTranslator;
Translator.placeholder = new PlaceholderTranslator;
Translator.allTranslators = [Translator.textNode, Translator.title, Translator.placeholder];
(async () => {
    const { map } = await import(`./i18n.${languageCodeMap[settings.i18nLanguage]}`);
    Translator.map = map;
    Translator.translate(document.body);
    Translator.translateCssMatches();
    Observer.childListSubtree("body", records => {
        records.forEach(it => {
            if (it.addedNodes.length > 0) {
                Translator.translateCssMatches();
            }
            it.addedNodes.forEach(node => {
                Translator.translate(node);
            });
        });
    });
})();
export default {
    export: {
        Translator,
        TextNodeTranslator,
        TitleTranslator,
        PlaceholderTranslator,
    },
};

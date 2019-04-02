export class StyleManager
{
    constructor(resources)
    {
        this.resources = resources;
    }
    getDefaultStyleId(key)
    {
        return key.replace(/([a-z][A-Z])/g,
            g => `${g[0]}-${g[1].toLowerCase()}`);
    }
    applyStyle(key, id)
    {
        if (id === undefined)
        {
            id = this.getDefaultStyleId(key);
        }
        Resource.all[key].applyStyle(id, false);
    }
    removeStyle(key)
    {
        const style = document.querySelector(`#${this.getDefaultStyleId(key)}`);
        style && style.remove();
    }
    applyImportantStyle(key, id)
    {
        if (id === undefined)
        {
            id = this.getDefaultStyleId(key);
        }
        Resource.all[key].applyStyle(id, true);
    }
    applyStyleFromText(text)
    {
        document.head.insertAdjacentHTML("afterbegin", text);
    }
    applyImportantStyleFromText(text)
    {
        document.body.insertAdjacentHTML("beforeend", text);
    }
    getStyle(key, id)
    {
        return Resource.all[key].getStyle(id);
    }
    fetchStyleByKey(key)
    {
        if (settings[key] !== true)
        {
            return;
        }
        Resource.all[key].styles
            .filter(it => it.condition !== undefined ? it.condition() : true)
            .forEach(it =>
            {
                const important = typeof it === "object" ? it.important : false;
                const key = typeof it === "object" ? it.key : it;
                Resource.all[key].download().then(() =>
                {
                    if (important)
                    {
                        contentLoaded(() => this.applyImportantStyle(key));
                    }
                    else
                    {
                        this.applyStyle(key);
                    }
                });
            });
    }
    prefetchStyles()
    {
        for (const key in Resource.all)
        {
            if (typeof offlineData !== "undefined" || settings.useCache && settings.cache[key])
            {
                this.fetchStyleByKey(key);
            }
        }
    }
}
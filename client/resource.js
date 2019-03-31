export class Resource
{
    get downloaded()
    {
        return this.text !== null;
    }
    constructor(url, styles = [])
    {
        this.url = Resource.root + "min/" + url;
        this.dependencies = [];
        // this.priority = priority;
        this.styles = styles;
        this.text = null;
        this.key = null;
        this.type = ResourceType.fromUrl(url);
        this.displayName = "";
    }
    flatMapPolyfill()
    {
        if (Array.prototype.flatMap === undefined)
        {
            const flatMap = function (mapFunc)
            {
                return this
                    .map(mapFunc)
                    .reduce((acc, it) => acc.concat(it), []);
            };
            return flatMap;
        }
        else
        {
            return Array.prototype.flatMap;
        }
    }
    loadCache()
    {
        const key = this.key;
        if (!settings.cache || !settings.cache[key])
        {
            return null;
        }
        else
        {
            return settings.cache[key];
        }
    }
    async download()
    {
        const key = this.key;
        return new Promise((resolve, reject) =>
        {
            if (this.downloaded)
            {
                resolve(this.text);
            }
            else
            {
                const flattenStyles = this.flatMapPolyfill()
                    .bind(this.styles)(it => typeof it === "object" ? it.key : it);
                Promise.all(this.dependencies
                    .concat(flattenStyles.map(it => Resource.all[it]))
                    .map(r => r.download())
                )
                    .then(() =>
                    {
                        // +#Offline build placeholder
                        if (settings.useCache)
                        {
                            const cache = this.loadCache(key);
                            if (cache !== null)
                            {
                                this.text = cache;
                                resolve(cache);
                            }
                            Ajax.getText(this.url).then(text =>
                            {
                                this.text = this.type.preprocessor(text);
                                if (text === null)
                                {
                                    reject("download failed");
                                }
                                if (cache !== this.text)
                                {
                                    if (cache === null)
                                    {
                                        resolve(this.text);
                                    }
                                    if (typeof offlineData === "undefined")
                                    {
                                        settings.cache[key] = this.text;
                                        saveSettings(settings);
                                    }
                                }
                            }).catch(error => reject(error));
                        }
                        else
                        {
                            Ajax.getText(this.url)
                                .then(text =>
                                {
                                    this.text = this.type.preprocessor(text);
                                    resolve(this.text);
                                })
                                .catch(error => reject(error));
                        }
                        // -#Offline build placeholder
                    });
            }
        });
    }
    getStyle(id)
    {
        const style = this.text;
        if (style === null)
        {
            logError("Attempt to get style which is not downloaded.");
        }
        let attributes = `id='${id}'`;
        // if (this.priority !== undefined)
        // {
        //     attributes += ` priority='${this.priority}'`;
        // }
        return `<style ${attributes}>${style}</style>`;
    }
    getPriorStyle()
    {
        if (this.priority !== undefined)
        {
            let insertPosition = this.priority - 1;
            let formerStyle = $(`style[priority='${insertPosition}']`);
            while (insertPosition >= 0 && formerStyle.length === 0)
            {
                formerStyle = $(`style[priority='${insertPosition}']`);
                insertPosition--;
            }
            if (insertPosition < 0)
            {
                return null;
            }
            else
            {
                return formerStyle;
            }
        }
        else
        {
            return null;
        }
    }
    applyStyle(id, important)
    {
        if (!document.querySelector(`#${id}`))
        {
            const style = this.getStyle(id);
            // const priorStyle = this.getPriorStyle();
            // if (priorStyle === null)
            // {
            //     if (important)
            //     {
            //         $("html").append(element);
            //     }
            //     else
            //     {
            //         $("head").prepend(element);
            //     }
            // }
            // else
            // {
            //     priorStyle.after(element);
            // }
            if (important)
            {
                document.body.insertAdjacentHTML("beforeend", style);
            }
            else
            {
                document.head.insertAdjacentHTML("afterbegin", style);
            }
        }
    }
}
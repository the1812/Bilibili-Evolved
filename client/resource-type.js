export class ResourceType
{
    constructor(name, preprocessor)
    {
        this.name = name;
        this.preprocessor = preprocessor || (text => text);
    }
    static fromUrl(url)
    {
        if (url.indexOf(".css") !== -1)
        {
            return this.style;
        }
        else if (url.indexOf(".html") !== -1 || url.indexOf(".htm") !== -1)
        {
            return this.html;
        }
        else if (url.indexOf(".js") !== -1)
        {
            return this.script;
        }
        else if (url.indexOf(".txt") !== -1)
        {
            return this.text;
        }
        else
        {
            return this.unknown;
        }
    }
    static get style()
    {
        return new ResourceType("style");
    }
    static get html()
    {
        return new ResourceType("html");
    }
    static get script()
    {
        return new ResourceType("script");
    }
    static get text()
    {
        return new ResourceType("text");
    }
    static get unknown()
    {
        return new ResourceType("unknown");
    }
}
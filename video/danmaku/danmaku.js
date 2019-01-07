(() =>
{
    return (settings, resources) =>
    {
        class XmlDanmaku
        {
            constructor(element)
            {
                this.pData = element.getAttribute("p");
                [this.time, this.type, this.fontSize, this.color] = this.pData.split(",");
                this.content = element.innerText;
            }
        }
        class XmlDanmakuDocument
        {
            constructor(xml)
            {
                this.xml = xml;
                const document = new DOMParser().parseFromString(xml, "application/xml").documentElement;
                this.danmakus = [...document.querySelectorAll("d[p]")].map(it => new XmlDanmaku(it));
            }
        }
    };
})();
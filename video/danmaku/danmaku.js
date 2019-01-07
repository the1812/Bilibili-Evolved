(() =>
{
    return (settings, resources) =>
    {
        class Danmaku
        {
            constructor(content, time, type, fontSize, color)
            {
                this.content = content;
                this.time = time;
                this.type = type;
                this.fontSize = fontSize;
                this.color = color;
            }
        }
        class XmlDanmaku extends Danmaku
        {
            constructor({ content, time, type, fontSize, color, timeStamp, pool, userHash, rowId })
            {
                super(content, time, type, fontSize, color);
                this.timeStamp = timeStamp;
                this.pool = pool;
                this.userHash = userHash;
                this.rowId = rowId;
                this.pDataArray = [time, type, fontSize, color, timeStamp, pool, userHash, rowId];
            }
            text()
            {
                const pData = this.pDataArray.join(",");
                return `<d p="${pData}">${this.content}</d>`;
            }
            static parse(element)
            {
                const pData = element.getAttribute("p");
                [time, type, fontSize, color, timeStamp, pool, userHash, rowId] = pData.split(",");
                const content = element.innerText;
                return new XmlDanmaku({ content, time, type, fontSize, color, timeStamp, pool, userHash, rowId });
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
        class AssDanmaku extends Danmaku
        {
            constructor({ content, time, type, fontSize, color, typeTag, endTime })
            {
                super(content, time, type, fontSize, color);
                this.typeTag = typeTag;
                this.endTime = endTime;
            }
            text(fontStyles)
            {
                return `Dialogue: ${this.time}, ${this.endTime}, ${fontStyles[this.fontSize]}, {${this.typeTag}\\c&H${this.color}&}${this.content}`;
            }
        }
    };
})();
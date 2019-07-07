"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const danmaku_1 = require("./danmaku");
class XmlDanmaku extends danmaku_1.Danmaku {
    constructor({ content, time, type, fontSize, color, timeStamp, pool, userHash, rowId }) {
        super({ content, time, type, fontSize, color });
        this.timeStamp = parseInt(timeStamp);
        this.pool = parseInt(pool);
        this.userHash = userHash;
        this.rowId = parseInt(rowId);
        this.pDataArray = [time, type, fontSize, color, timeStamp, pool, userHash, rowId];
    }
    text() {
        const pData = this.pDataArray.join(',');
        return `<d p="${pData}">${this.content}</d>`;
    }
    static parse(element) {
        const pData = element.getAttribute('p');
        const [time, type, fontSize, color, timeStamp, pool, userHash, rowId] = pData.split(',');
        const content = element.innerHTML;
        return new XmlDanmaku({ content, time, type, fontSize, color, timeStamp, pool, userHash, rowId });
    }
}
exports.XmlDanmaku = XmlDanmaku;
class XmlDanmakuDocument {
    constructor(xml) {
        this.xml = xml;
        const document = new DOMParser().parseFromString(xml, 'application/xml').documentElement;
        this.danmakus = [...document.querySelectorAll('d[p]')].map(it => XmlDanmaku.parse(it));
    }
}
exports.XmlDanmakuDocument = XmlDanmakuDocument;

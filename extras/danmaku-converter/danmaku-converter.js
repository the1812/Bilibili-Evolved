"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_danmaku_1 = require("./xml-danmaku");
const ass_danmaku_1 = require("./ass-danmaku");
const danmaku_stack_1 = require("./danmaku-stack");
const danmaku_1 = require("./danmaku");
exports.getDefaultDanmakuConverterConfig = (title) => {
    return {
        title,
        font: "微软雅黑",
        alpha: 0.6,
        duration: (danmaku) => {
            switch (danmaku.type) {
                case danmaku_1.DanmakuType.Bottom:
                case danmaku_1.DanmakuType.Top:
                    return 4;
                default:
                    return 6;
            }
        },
        blockTypes: [danmaku_1.DanmakuType.Special, danmaku_1.DanmakuType.Special2],
        resolution: {
            x: 1920,
            y: 1080,
        },
        bottomMarginPercent: 0.15,
        bold: false,
    };
};
class DanmakuConverter {
    constructor({ title, font, alpha, duration, blockTypes, resolution, bottomMarginPercent, bold }) {
        this.title = title;
        this.font = font;
        this.alpha = Math.round(alpha * 100).toString(16).toUpperCase();
        this.duration = duration;
        this.blockTypes = blockTypes;
        this.resolution = resolution;
        this.bold = bold;
        this.danmakuStack = new danmaku_stack_1.DanmakuStack(font, resolution, duration, bottomMarginPercent);
    }
    get fontStyles() {
        return {
            30: `Style: Large,${this.font},64,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
            25: `Style: Medium,${this.font},52,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
            18: `Style: Small,${this.font},36,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`
        };
    }
    convertToAssDocument(xml) {
        const xmlDanmakuDocument = new xml_danmaku_1.XmlDanmakuDocument(xml);
        const assDanmakus = [];
        for (const xmlDanmaku of xmlDanmakuDocument.danmakus.sort((a, b) => a.startTime - b.startTime)) {
            // 跳过设置为屏蔽的弹幕类型
            if (this.blockTypes.indexOf(xmlDanmaku.type) !== -1 ||
                this.blockTypes.indexOf('color') !== -1 && xmlDanmaku.color !== DanmakuConverter.white) {
                continue;
            }
            const [startTime, endTime] = this.convertTime(xmlDanmaku.startTime, this.duration(xmlDanmaku));
            assDanmakus.push(new ass_danmaku_1.AssDanmaku({
                content: this.convertText(xmlDanmaku.content),
                time: startTime,
                endTime: endTime,
                type: xmlDanmaku.type.valueOf().toString(),
                fontSize: xmlDanmaku.fontSize.toString(),
                color: xmlDanmaku.color.toString(),
                typeTag: this.convertType(xmlDanmaku),
                colorTag: this.convertColor(xmlDanmaku.color)
            }));
        }
        return new ass_danmaku_1.AssDanmakuDocument(assDanmakus, this.title, this.fontStyles, this.blockTypes, this.resolution);
    }
    convertText(text) {
        const map = {
            '{': '｛',
            '}': '｝',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&apos;': "'"
        };
        for (const [key, value] of Object.entries(map)) {
            text = text.replace(new RegExp(key, 'g'), value);
        }
        return text;
    }
    convertType(danmaku) {
        return this.danmakuStack.push(danmaku).tags;
    }
    convertColor(decColor) {
        if (decColor === DanmakuConverter.white) {
            return '';
        }
        const hex = decColor.toString(16);
        const red = hex.substring(0, 2);
        const green = hex.substring(2, 4);
        const blue = hex.substring(4, 6);
        return `\\c&H${blue}${green}${red}&`;
    }
    convertTime(startTime, duration) {
        function round(number) {
            const [integer, decimal = '00'] = String(number).split('.');
            return `${integer.padStart(2, '0')}.${decimal.substr(0, 2).padEnd(2, '0')}`;
        }
        function secondsToTime(seconds) {
            let hours = 0;
            let minutes = 0;
            while (seconds >= 60) {
                seconds -= 60;
                minutes++;
            }
            while (minutes >= 60) {
                minutes -= 60;
                hours++;
            }
            return `${hours}:${String(minutes).padStart(2, '0')}:${round(seconds)}`;
        }
        return [secondsToTime(startTime), secondsToTime(startTime + duration)];
    }
}
DanmakuConverter.white = 16777215; // Dec color of white danmaku
exports.DanmakuConverter = DanmakuConverter;
exports.default = {
    export: {
        AssDanmaku: ass_danmaku_1.AssDanmaku,
        AssDanmakuDocument: ass_danmaku_1.AssDanmakuDocument,
        Danmaku: danmaku_1.Danmaku,
        DanmakuConverter,
        DanmakuStack: danmaku_stack_1.DanmakuStack,
        XmlDanmaku: xml_danmaku_1.XmlDanmaku,
        XmlDanmakuDocument: xml_danmaku_1.XmlDanmakuDocument
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DanmakuType;
(function (DanmakuType) {
    DanmakuType[DanmakuType["Normal"] = 1] = "Normal";
    DanmakuType[DanmakuType["Normal2"] = 2] = "Normal2";
    DanmakuType[DanmakuType["Normal3"] = 3] = "Normal3";
    DanmakuType[DanmakuType["Bottom"] = 4] = "Bottom";
    DanmakuType[DanmakuType["Top"] = 5] = "Top";
    DanmakuType[DanmakuType["Reversed"] = 6] = "Reversed";
    DanmakuType[DanmakuType["Special"] = 7] = "Special";
    DanmakuType[DanmakuType["Special2"] = 8] = "Special2";
})(DanmakuType = exports.DanmakuType || (exports.DanmakuType = {}));
class Danmaku {
    constructor({ content, time, type, fontSize, color }) {
        this.content = content;
        this.time = time;
        this.startTime = parseFloat(time);
        this.type = parseInt(type);
        this.fontSize = parseFloat(fontSize);
        this.color = parseInt(color);
    }
}
exports.Danmaku = Danmaku;

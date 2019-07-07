"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const danmaku_1 = require("./danmaku");
// interface MeasureText {
//   width(text: string, options: {
//     'font-family': string
//   }): number
// }
const measureText = require("bezoerb-measure-text");
class DanmakuStack {
    constructor(font, resolution, duration, bottomMarginPercent) {
        this.horizontalStack = [];
        this.horizontalTrack = [];
        this.verticalStack = [];
        this.verticalTrack = [];
        this.resolution = resolution;
        this.duration = duration;
        // XML字体大小到实际大小的表
        this.fontSizes = {
            30: `64px ${font}`,
            25: `52px ${font}`,
            18: `36px ${font}`
        };
        this.bottomMarginPercent = bottomMarginPercent;
        this.generateTracks();
    }
    generateTracks() {
        const height = 52;
        this.danmakuHeight = height;
        this.trackHeight = DanmakuStack.margin * 2 + height;
        this.trackCount = parseInt(fixed(this.resolution.y * (1 - this.bottomMarginPercent) / this.trackHeight, 0));
    }
    getTextSize(danmaku) {
        const font = this.fontSizes[danmaku.fontSize];
        const width = measureText.width(danmaku.content, { 'font-family': font });
        const x = width / 2;
        return [x, this.danmakuHeight / 2];
    }
    getTags(danmaku, { targetTrack, initTrackNumber, nextTrackNumber, willOverlay, getTrackItem, getTag }) {
        const [x, y] = this.getTextSize(danmaku);
        const width = x * 2;
        /*
          x = this.resolution.x = 屏幕宽度
          d = this.duration(danmaku) = 当前弹幕总持续时长(从出现到完全消失)
          w = width = 当前弹幕的宽度
          delay = DanmakuStack.nextDanmakuDelay = 相邻弹幕间最小的时间间隔
    
          当前弹幕的速度 v = (x + w) / d
          完全进入屏幕所需时间 = visibleTime = delay + w / v = delay + wd / (x + w)
        */
        const visibleTime = this.duration(danmaku) * width / (this.resolution.x + width) + DanmakuStack.nextDanmakuDelay;
        let trackNumber = initTrackNumber;
        let overlayDanmaku = null;
        // 寻找前面已发送的弹幕中可能重叠的
        do {
            overlayDanmaku = targetTrack.find(it => willOverlay(it, trackNumber, width));
            trackNumber += nextTrackNumber;
        } while (overlayDanmaku && trackNumber <= this.trackCount && trackNumber >= 0);
        // 如果弹幕过多, 此条就不显示了
        if (trackNumber > this.trackCount || trackNumber < 0) {
            return `\\pos(0,-999)`;
        }
        trackNumber -= nextTrackNumber; // 减回最后的自增
        targetTrack.push(getTrackItem(trackNumber, width, visibleTime));
        return getTag({ trackNumber, x, y });
    }
    getHorizontalTags(danmaku) {
        return this.getTags(danmaku, {
            targetTrack: this.horizontalTrack,
            initTrackNumber: 0,
            nextTrackNumber: 1,
            willOverlay: (it, trackNumber, width) => {
                if (it.trackNumber !== trackNumber) { // 不同轨道当然不会重叠
                    return false;
                }
                if (it.width < width) { // 弹幕比前面的弹幕长, 必须等前面弹幕走完
                    /*
                      x = this.resolution.x = 屏幕宽度
                      d = this.duration(danmaku) = 当前弹幕总持续时长(从出现到完全消失)
                      w = width = 当前弹幕的宽度
                      end = it.end = 前面的弹幕结束时间点
                      start = danmaku.startTime = 当前弹幕的开始时间点
          
                      当前弹幕的速度 v = (x + w) / d
                      当前弹幕碰到左侧边缘需要的时间 ▲t = x / v = dx / (x + w)
                      当前弹幕碰到左侧边缘的时间点 t = ▲t + start
          
                      如果会重叠, 则当前弹幕碰到左边缘时, 前面的弹幕还未结束
                      即 t <= end
                      也就是 start + dx / (x + w) <= end 或 dx / (x + w) <= end - start
                    */
                    return this.duration(danmaku) * this.resolution.x / (this.resolution.x + width) <= it.end - danmaku.startTime;
                }
                else { // 前面弹幕完全进入屏幕的时间点晚于当前弹幕的开始时间, 就一定会重叠
                    return it.visible > danmaku.startTime;
                }
            },
            getTrackItem: (trackNumber, width, visibleTime) => {
                return {
                    width: width,
                    start: danmaku.startTime,
                    visible: danmaku.startTime + visibleTime,
                    end: danmaku.startTime + this.duration(danmaku),
                    trackNumber
                };
            },
            getTag: ({ trackNumber, x, y }) => {
                return `\\move(${this.resolution.x + x},${trackNumber * this.trackHeight + DanmakuStack.margin + y},${-x},${trackNumber * this.trackHeight + DanmakuStack.margin + y},0,${this.duration(danmaku) * 1000})`;
            }
        });
    }
    getVerticalTags(danmaku) {
        const isTop = DanmakuStack.danmakuType[danmaku.type] === 'top';
        return this.getTags(danmaku, {
            targetTrack: this.verticalTrack,
            initTrackNumber: isTop ? 0 : this.trackCount - 1,
            nextTrackNumber: isTop ? 1 : -1,
            willOverlay: (it, trackNumber) => {
                if (it.trackNumber !== trackNumber) {
                    return false;
                }
                return it.end > danmaku.startTime;
            },
            getTrackItem: (trackNumber) => {
                return {
                    start: danmaku.startTime,
                    end: danmaku.startTime + this.duration(danmaku),
                    trackNumber
                };
            },
            getTag: ({ trackNumber, y }) => {
                if (isTop) {
                    return `\\pos(${this.resolution.x / 2},${trackNumber * this.trackHeight + DanmakuStack.margin + y})`;
                }
                else {
                    return `\\pos(${this.resolution.x / 2},${this.resolution.y - DanmakuStack.margin - y - (this.trackCount - 1 - trackNumber) * this.trackHeight})`;
                }
            }
        });
    }
    push(danmaku) {
        let tags = '';
        let stack = [];
        switch (DanmakuStack.danmakuType[danmaku.type]) {
            case 'normal':
            case 'reversed': // 反向先鸽了, 直接当正向了
                {
                    tags = this.getHorizontalTags(danmaku);
                    stack = this.horizontalStack;
                    break;
                }
            case 'top':
            case 'bottom':
                {
                    tags = this.getVerticalTags(danmaku);
                    stack = this.verticalStack;
                    break;
                }
            case 'special': // 高级弹幕也鸽了先
            default:
                {
                    return {
                        tags: `\\pos(0,-999)`
                    };
                }
        }
        const info = {
            tags
        };
        stack.push(info);
        return info;
    }
}
DanmakuStack.danmakuType = {
    [danmaku_1.DanmakuType.Normal]: 'normal',
    [danmaku_1.DanmakuType.Normal2]: 'normal',
    [danmaku_1.DanmakuType.Normal3]: 'normal',
    [danmaku_1.DanmakuType.Bottom]: 'bottom',
    [danmaku_1.DanmakuType.Top]: 'top',
    [danmaku_1.DanmakuType.Reversed]: 'reversed',
    [danmaku_1.DanmakuType.Special]: 'special',
    [danmaku_1.DanmakuType.Special2]: 'special'
};
DanmakuStack.margin = 4;
DanmakuStack.nextDanmakuDelay = 0.05;
exports.DanmakuStack = DanmakuStack;

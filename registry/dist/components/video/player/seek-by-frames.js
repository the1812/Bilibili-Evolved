!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/seek-by-frames"]=t():e["video/player/seek-by-frames"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,r={241:e=>{e.exports=coreApis.componentApis.video.playerAgent}},o={};function n(e){var t=o[e];if(void 0!==t)return t.exports;var a=o[e]={exports:{}};return r[e](a,a.exports,n),a.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var a=Object.create(null);n.r(a);var s={};e=e||[null,t({}),t([]),t(t)];for(var i=2&o&&r;"object"==typeof i&&!~e.indexOf(i);i=t(i))Object.getOwnPropertyNames(i).forEach((e=>s[e]=()=>r[e]));return s.default=()=>r,n.d(a,s),a},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};n.d(a,{component:()=>m});const s=coreApis.componentApis.video.videoControlBar,i=coreApis.observer,c=coreApis.utils,l=coreApis.utils.urls,d=coreApis.pluginApis.data,p=coreApis.componentApis.define,u="seek-by-frame-disable",m=(0,p.defineComponentMetadata)({name:"seekByFrames",displayName:"启用逐帧调整",tags:[componentsTags.video],description:{"zh-CN":"在播放器的时间右边增加两个按钮, 用于**较精细**调整视频时间. 装有 `快捷键扩展` 时支持键盘快捷键<kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd>.\n\n> 注: `视频的实际播放帧率`跟`视频本身的帧率`和`显示器的刷新率`有关, 很难计算一个精准的数值, 部分视频仍然会有暂停不到那种一闪而过的图的情况."},entry:async()=>{await(0,c.playerReady)();const{playerAgent:e}=await Promise.resolve().then(n.t.bind(n,241,23));(0,d.addData)("ui.icons",(e=>{e["seek-left"]='<?xml version="1.0" encoding="utf-8"?>\n\x3c!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --\x3e\n<svg version="1.1" id="图层_2_1_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"\n\t y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n<g>\n\t<path d="M15.5,20.3c-0.4,0-0.7-0.1-1-0.4l-8.3-7.5c-0.3-0.3-0.5-0.7-0.5-1.1c0-0.4,0.2-0.8,0.5-1.1l8.3-7.5\n\t\tc0.6-0.6,1.6-0.5,2.1,0.1c0.6,0.6,0.5,1.6-0.1,2.1l-7.1,6.3l7.1,6.4c0.6,0.6,0.7,1.5,0.1,2.1C16.3,20.2,15.9,20.3,15.5,20.3z"/>\n</g>\n<circle cx="16.8" cy="11.3" r="2.4"/>\n</svg>\n',e["seek-right"]='<?xml version="1.0" encoding="utf-8"?>\n\x3c!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --\x3e\n<svg version="1.1" id="图层_2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n<g>\n\t<path d="M8.2,20.3c0.4,0,0.7-0.1,1-0.4l8.3-7.5c0.3-0.3,0.5-0.7,0.5-1.1c0-0.4-0.2-0.8-0.5-1.1L9.2,2.7C8.6,2.2,7.7,2.2,7.1,2.9\n\t\tC6.6,3.5,6.6,4.4,7.3,5l7.1,6.3l-7.1,6.4c-0.6,0.6-0.7,1.5-0.1,2.1C7.4,20.2,7.8,20.3,8.2,20.3z"/>\n</g>\n<circle cx="7" cy="11.3" r="2.4"/>\n</svg>\n'}));let t=0;(0,i.attributesSubtree)(`${e.query.control.buttons.quality.selector} ul`,(()=>{const r=dq(`${e.query.control.buttons.quality.selector} .bui-select-item-active, ${e.query.control.buttons.quality.selector} .active`),o=r?parseInt(r.getAttribute("data-value")):0,n=(()=>{switch(o){case 116:case 74:return 6e4/1001;default:return 3e4/1001}})();t=1/n}));const r=r=>{e.changeTime(r*t)};(0,s.addControlBarButton)({name:"seekPrevFrame",displayName:"上一帧",icon:"seek-left",order:1,action:()=>{r(-1)}}),(0,s.addControlBarButton)({name:"seekNextFrame",displayName:"下一帧",icon:"seek-right",order:2,action:()=>{r(1)}})},reload:()=>document.body.classList.remove(u),unload:()=>document.body.classList.add(u),urlInclude:l.playerUrls,plugin:{displayName:"逐帧调整 - 快捷键支持",setup:()=>{(0,d.addData)("keymap.actions",(e=>{e.previousFrame={displayName:"上一帧",run:e=>{const{clickElement:t}=e;return t('.be-video-control-bar-extend [data-name="seekPrevFrame"]',e)}},e.nextFrame={displayName:"下一帧",run:e=>{const{clickElement:t}=e;return t('.be-video-control-bar-extend [data-name="seekNextFrame"]',e)}}})),(0,d.addData)("keymap.presets",(e=>{e.previousFrame="shift arrowLeft",e.nextFrame="shift arrowRight"}))}},commitHash:"37231b0555ca29fe46a344ca91da615c066a5e47",coreVersion:"2.10.1"});return a=a.component})()));
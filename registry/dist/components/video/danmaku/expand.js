!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/danmaku/expand"]=t():e["video/danmaku/expand"]=t()}(self,(function(){return function(){"use strict";var e={d:function(t,o){for(var n in o)e.o(o,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:o[n]})},o:function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}},t={};e.d(t,{component:function(){return a}});var o=coreApis.observer,n=coreApis.spinQuery,i=coreApis.utils,s=coreApis.utils.urls;const a={name:"expandDanmakuList",displayName:"展开弹幕列表",entry:async({settings:{options:e}})=>{(0,o.videoChange)((async()=>{if(s.mediaListUrls.some((e=>(0,i.matchUrlPattern)(e)))&&e.ignoreMediaList)return;const t=await(0,n.select)(".bui-collapse-wrap");if(t&&t.classList.contains("bui-collapse-wrap-folded")){(await(0,n.select)(".bui-collapse-header"))?.click()}}))},tags:[componentsTags.video],description:{"zh-CN":"每次加载视频时自动展开弹幕列表."},options:{ignoreMediaList:{defaultValue:!0,displayName:"合集类页面不自动展开"}},urlInclude:[...s.videoAndBangumiUrls,...s.mediaListUrls],commitHash:"6b53bf777c1668967400cd28b7c815867b9cbb38"};return t=t.component}()}));
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/danmaku/expand"]=t():e["video/danmaku/expand"]=t()}(globalThis,(()=>(()=>{var e,t,i={295:(e,t,i)=>{"use strict";i.d(t,{getDanmakuView:()=>s});const o=coreApis.runtimeLibrary,n={nested:{DmWebViewReply:{fields:{state:{type:"int32",id:1},text:{type:"string",id:2},textSide:{type:"string",id:3},dmSge:{type:"DmSegConfig",id:4},flag:{type:"DanmakuFlagConfig",id:5},specialDms:{rule:"repeated",type:"string",id:6},checkBox:{type:"bool",id:7},count:{type:"int64",id:8},commandDms:{rule:"repeated",type:"CommandDm",id:9},dmSetting:{type:"DanmuWebPlayerConfig",id:10}}},CommandDm:{fields:{id:{type:"int64",id:1},oid:{type:"int64",id:2},mid:{type:"int64",id:3},command:{type:"string",id:4},content:{type:"string",id:5},progress:{type:"int32",id:6},ctime:{type:"string",id:7},mtime:{type:"string",id:8},extra:{type:"string",id:9},idStr:{type:"string",id:10}}},DmSegConfig:{fields:{pageSize:{type:"int64",id:1},total:{type:"int64",id:2}}},DanmakuFlagConfig:{fields:{recFlag:{type:"int32",id:1},recText:{type:"string",id:2},recSwitch:{type:"int32",id:3}}},DmSegMobileReply:{fields:{elems:{rule:"repeated",type:"DanmakuElem",id:1}}},DanmakuElem:{fields:{id:{type:"int64",id:1},progress:{type:"int32",id:2},mode:{type:"int32",id:3},fontsize:{type:"int32",id:4},color:{type:"uint32",id:5},midHash:{type:"string",id:6},content:{type:"string",id:7},ctime:{type:"int64",id:8},weight:{type:"int32",id:9},action:{type:"string",id:10},pool:{type:"int32",id:11},idStr:{type:"string",id:12},attr:{type:"int32",id:13}}},DanmuWebPlayerConfig:{fields:{dmSwitch:{type:"bool",id:1},aiSwitch:{type:"bool",id:2},aiLevel:{type:"int32",id:3},blocktop:{type:"bool",id:4},blockscroll:{type:"bool",id:5},blockbottom:{type:"bool",id:6},blockcolor:{type:"bool",id:7},blockspecial:{type:"bool",id:8},preventshade:{type:"bool",id:9},dmask:{type:"bool",id:10},opacity:{type:"float",id:11},dmarea:{type:"int32",id:12},speedplus:{type:"float",id:13},fontsize:{type:"float",id:14},screensync:{type:"bool",id:15},speedsync:{type:"bool",id:16},fontfamily:{type:"string",id:17},bold:{type:"bool",id:18},fontborder:{type:"int32",id:19},drawType:{type:"string",id:20}}}}},r=lodash.curry((async(e,t)=>{const i=new Uint8Array("arrayBuffer"in Blob.prototype?await t.arrayBuffer():await new Response(t).arrayBuffer()),r=(await o.protobufLibrary).Root.fromJSON(n).lookupType(e),d=r.decode(i);return r.toObject(d)})),d=(r("DmSegMobileReply"),r("DmWebViewReply")),a=async e=>(await unsafeWindow.fetch(e,{mode:"cors",credentials:"include"})).blob(),s=async(e,t)=>{const i=await a(`https://api.bilibili.com/x/v2/dm/web/view?type=1&oid=${t}&pid=${e}`);if(!i)throw new Error("获取弹幕信息失败");return await d(i)}},666:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=666,e.exports=t},617:e=>{"use strict";e.exports="每次加载视频时自动展开弹幕列表, 如果弹幕装载量超过 `最大弹幕数量`, 则不展开以免对页面造成卡顿. (`最大弹幕数量` 是和视频的总弹幕量对比, 不一定和播放器实际装载的弹幕量相等)\n"}},o={};function n(e){var t=o[e];if(void 0!==t)return t.exports;var r=o[e]={exports:{}};return i[e](r,r.exports,n),r.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(i,o){if(1&o&&(i=this(i)),8&o)return i;if("object"==typeof i&&i){if(4&o&&i.__esModule)return i;if(16&o&&"function"==typeof i.then)return i}var r=Object.create(null);n.r(r);var d={};e=e||[null,t({}),t([]),t(t)];for(var a=2&o&&i;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>d[e]=()=>i[e]));return d.default=()=>i,n.d(r,d),r},n.d=(e,t)=>{for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};return(()=>{"use strict";n.d(r,{component:()=>s});const e=coreApis.componentApis.define,t=coreApis.observer,i=coreApis.spinQuery,o=coreApis.utils,d=coreApis.utils.log,a=coreApis.utils.urls,s=(0,e.defineComponentMetadata)({name:"expandDanmakuList",displayName:"展开弹幕列表",entry:async e=>{let{settings:{options:r}}=e;const s=(0,d.useScopedConsole)("展开弹幕列表"),{getDanmakuView:p}=await Promise.resolve().then(n.bind(n,295));(0,t.videoChange)((async e=>{let{aid:t,cid:n}=e;if(a.mediaListUrls.some((e=>(0,o.matchUrlPattern)(e)))&&r.ignoreMediaList)return;const d=(await p(t,n)).count;if(s.log(`当前弹幕量: ${d}`),null!==d&&d>r.maxDanmakuCount)return void s.log(`超过了最大弹幕数量 ${r.maxDanmakuCount}, 跳过展开`);const l=await(0,i.select)(".bui-collapse-wrap");if(dq(".multi-page-v1, .base-video-sections-v1, .video-pod")&&r.ignoreWithEpisodes)s.log("检测到选集, 跳过展开");else if(l&&l.classList.contains("bui-collapse-wrap-folded")){const e=await(0,i.select)(".bui-collapse-header");e?.click()}}))},tags:[componentsTags.video],options:{ignoreMediaList:{defaultValue:!0,displayName:"合集类页面不自动展开"},ignoreWithEpisodes:{defaultValue:!0,displayName:"有选集时不自动展开"},maxDanmakuCount:{defaultValue:500,displayName:"最大弹幕数量"}},urlInclude:[...a.videoAndBangumiUrls,...a.mediaListUrls],commitHash:"48fb8d874b0943e1ba16c545506c2fe271cc76c9",coreVersion:"2.10.1",description:(()=>{const e=n(666);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(n.t.bind(n,617,17)).then((e=>e.default))}})()})})(),r=r.component})()));
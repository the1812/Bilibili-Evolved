!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["utils/image-exporter"]=t():e["utils/image-exporter"]=t()}(globalThis,(()=>(()=>{var e,t,n={746:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>m});var i=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("DefaultWidget",{attrs:{name:"导出图片",icon:"mdi-export",disabled:e.busy},on:{click:function(t){return e.exportImages()}}})};i._withStripped=!0;var o=n(416),r=n(658);const s=coreApis.settings;var a=n(5),l=n(847);const u=coreApis.utils.log;var c=n(121);const d=coreApis.ui;var p=function(e,t,n,i,o,r,s,a){var l,u="function"==typeof e?e.options:e;if(t&&(u.render=t,u.staticRenderFns=n,u._compiled=!0),i&&(u.functional=!0),r&&(u._scopeId="data-v-"+r),s?(l=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},u._ssrRegister=l):o&&(l=a?function(){o.call(this,(u.functional?this.parent:this).$root.$options.shadowRoot)}:o),l)if(u.functional){u._injectStyles=l;var c=u.render;u.render=function(e,t){return l.call(t),c(e,t)}}else{var d=u.beforeCreate;u.beforeCreate=d?[].concat(d,l):[l]}return{exports:e,options:u}}(Vue.extend({components:{DefaultWidget:d.DefaultWidget},data:()=>({busy:!1}),methods:{async exportImages(){const{columnFormat:e}=(0,s.getComponentSettings)("imageExporter").options,t=a.Toast.info("下载中...","导出图片");this.busy=!0;try{const n=(0,c.getTitleVariablesFromDate)(new Date(
// eslint-disable-next-line no-underscore-dangle
1e3*(unsafeWindow.__INITIAL_STATE__?.readInfo?.publish_time??0))),i={cv:document.URL.match(/read\/cv(\d+)/)?.at(1),publishYear:n.year,publishMonth:n.month,publishDay:n.day,publishHour:n.hour,publishMinute:n.minute,publishSecond:n.second,publishMillisecond:n.millisecond},s=[],u=dq(".banner-image .card-image__image"),d=(0,l.retrieveImageUrl)(u);d&&(s.push({...d,name:`${(0,c.formatTitle)(e,!1,{n:"1",...i})}${d.extension}`}),console.log(u,d,s));if(dqa(".article-content :is(img.normal-img, .normal-img img)").forEach((t=>{const n=(0,l.retrieveImageUrl)(t);n&&s.push({...n,name:`${(0,c.formatTitle)(e,!1,{n:(s.length+1).toString(),...i})}${n.extension}`})})),0===s.length)return void a.Toast.info("此页面没有检测到任何可导出图片.","图片导出");let p=0;const m=await Promise.all(s.map((async e=>{let{url:n}=e;const i=await(0,o.getBlob)(n);return p++,t.message=`下载中... (${p}/${s.length})`,i}))),h=new r.DownloadPackage;m.forEach(((e,t)=>h.add(s[t].name,e))),await h.emit(`${(0,c.formatTitle)(e,!1,{n:"",...i})}.zip`)}catch(e){(0,u.logError)(e)}finally{this.busy=!1,t.close()}}}}),i,[],!1,null,null,null);const m=p.exports},371:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=371,e.exports=t},380:e=>{"use strict";e.exports="可以批量导出某个地方的图片, 目前支持动态和专栏.\n\n动态文件名变量:\n- `n`: 第 n 张图\n- `id`: 动态 ID\n- `user`: 用户名\n- `userID`: 用户 ID\n- 动态发布时间:\n  - `publishYear`\n  - `publishMonth`\n  - `publishDay`\n  - `publishHour`\n  - `publishMinute`\n  - `publishSecond`\n  - `publishMillisecond`\n- 被转发的数据 (如果不是转发类型的动态, 则和上面的对应变量相同):\n  - `originalID`: 被转发的动态 ID\n  - `originalUser`: 被转发的用户名\n  - `originalUserID`: 被转发用户 ID\n  - 被转发的动态发布时间:\n    - `originalPublishYear`\n    - `originalPublishMonth`\n    - `originalPublishDay`\n    - `originalPublishHour`\n    - `originalPublishMinute`\n    - `originalPublishSecond`\n    - `originalPublishMillisecond`\n\n专栏文件名变量:\n- `n`: 第 n 张图\n- `title`: 专栏标题\n- `cv`: 专栏 cv 号\n- 专栏发布时间:\n  - `publishYear`\n  - `publishMonth`\n  - `publishDay`\n  - `publishHour`\n  - `publishMinute`\n  - `publishSecond`\n  - `publishMillisecond`\n"},416:e=>{"use strict";e.exports=coreApis.ajax},658:e=>{"use strict";e.exports=coreApis.download},5:e=>{"use strict";e.exports=coreApis.toast},121:e=>{"use strict";e.exports=coreApis.utils.title},847:e=>{"use strict";e.exports=coreApis.utils}},i={};function o(e){var t=i[e];if(void 0!==t)return t.exports;var r=i[e]={exports:{}};return n[e](r,r.exports,o),r.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,o.t=function(n,i){if(1&i&&(n=this(n)),8&i)return n;if("object"==typeof n&&n){if(4&i&&n.__esModule)return n;if(16&i&&"function"==typeof n.then)return n}var r=Object.create(null);o.r(r);var s={};e=e||[null,t({}),t([]),t(t)];for(var a=2&i&&n;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>s[e]=()=>n[e]));return s.default=()=>n,o.d(r,s),r},o.d=(e,t)=>{for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};return(()=>{"use strict";o.d(r,{component:()=>d});const e=coreApis.componentApis.define;var t=o(847);const n=coreApis.utils.urls,i=coreApis.componentApis.feeds.api;var s=o(416),a=o(658),l=o(5),u=o(121);const c=(0,e.defineOptionsMetadata)({columnFormat:{defaultValue:"[title][ - n]",displayName:"专栏图片命名格式",multiline:!0},feedFormat:{defaultValue:"[user][ - id][ - n]",displayName:"动态图片命名格式",multiline:!0}}),d=(0,e.defineComponentMetadata)({name:"imageExporter",displayName:"图片批量导出",tags:[componentsTags.feeds,componentsTags.utils],entry:async e=>{await(async e=>{let{settings:{options:o}}=e;if(!n.feedsUrls.some((e=>(0,t.matchUrlPattern)(e))))return;(0,i.forEachFeedsCard)({added:e=>{(0,i.addMenuItem)(e,{className:"image-export",text:"导出图片",action:async()=>{const n=[];if(dqa(e.element,".main-content .img-content, .bili-album__preview__picture__img, .bili-album .preview__picture__img, .bili-dyn-gallery__image img, .bili-album__watch__track__item img").forEach((e=>{const i=(0,t.retrieveImageUrl)(e);i&&!n.some((e=>{let{url:t}=e;return t===i.url}))&&n.push(i)})),0===n.length)return void l.Toast.info("此条动态没有检测到任何图片.","导出图片");const i=l.Toast.info("下载中...","导出图片");let r=0;const c=(0,t.getVue2Data)(e.element),d=lodash.get(c,"data.modules.module_author",{}),p=lodash.get(c,"data.orig.modules.module_author",{}),m=(0,u.getTitleVariablesFromDate)(new Date(1e3*d.pub_ts)),h=(0,u.getTitleVariablesFromDate)(new Date(1e3*(p.pub_ts??d.pub_ts))),f={id:e.id,user:e.username,userID:d.mid?.toString(),originalUser:e.repostUsername??e.username,originalUserID:p.mid?.toString()??d.mid?.toString(),originalID:lodash.get(c,"data.orig.id_str",e.id),publishYear:m.year,publishMonth:m.month,publishDay:m.day,publishHour:m.hour,publishMinute:m.minute,publishSecond:m.second,publishMillisecond:m.millisecond,originalPublishYear:h.year,originalPublishMonth:h.month,originalPublishDay:h.day,originalPublishHour:h.hour,originalPublishMinute:h.minute,originalPublishSecond:h.second,originalPublishMillisecond:h.millisecond},g=await Promise.all(n.map((async e=>{let{url:t}=e;const o=await(0,s.getBlob)(t);return r++,i.message=`下载中... (${r}/${n.length})`,o}))),b=new a.DownloadPackage,{feedFormat:_}=o;g.forEach(((e,t)=>{const i={n:(t+1).toString(),...f};b.add(`${(0,u.formatTitle)(_,!1,i)}${n[t].extension}`,e)})),i.close();const y={n:"",...f};await b.emit(`${(0,u.formatTitle)(_,!1,y)}.zip`)}})}})})(e)},widget:{condition:()=>n.columnUrls.some((e=>(0,t.matchUrlPattern)(e))),component:()=>Promise.resolve().then(o.bind(o,746)).then((e=>e.default))},urlInclude:[...n.feedsUrls,...n.columnUrls],options:c,commitHash:"7b6b5b65d16bb71b2f7f006cf966e072f8ae8936",coreVersion:"2.10.0",description:(()=>{const e=o(371);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(o.t.bind(o,380,17)).then((e=>e.default))}})()})})(),r=r.component})()));
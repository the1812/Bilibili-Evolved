!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/metadata"]=t():e["video/metadata"]=t()}(globalThis,(()=>(()=>{"use strict";var e={402:(e,t,n)=>{n.d(t,{component:()=>p,u:()=>c,T:()=>l});var i=n(952);const o=coreApis.spinQuery;var a=n(391);const s=coreApis.utils.urls;var r=n(765),d=n(401);const l="保存视频元数据",c="saveVideoMetadata",u=[{name:"WakelessSloth56",link:"https://github.com/WakelessSloth56"},{name:"LainIO24",link:"https://github.com/LainIO24"}],p=(0,i.defineComponentMetadata)({name:c,displayName:l,description:"保存视频元数据（标题、描述、UP、章节等）",author:u,tags:[componentsTags.video],entry:none,urlInclude:s.videoUrls,options:d.Y,widget:{condition:o.hasVideo,component:()=>Promise.resolve().then(n.bind(n,939)).then((e=>e.default))},plugin:{displayName:`下载视频 - ${l}支持`,author:u,setup:e=>{let{addData:t}=e;t("downloadVideo.assets",(async e=>{e.push({name:c,displayName:l,getAssets:async(e,t)=>{const{type:n,enabled:i}=t;if(i){const t=a.Toast.info("获取视频元数据中...",l),i=[];for(const t of e)i.push({name:`${t.input.title}.${n}.txt`,data:await(0,r.a)(n,t.input.aid,t.input.cid),options:{}});return t.message="完成！",t.duration=1e3,i}return[]},component:()=>Promise.resolve().then(n.bind(n,19)).then((e=>e.default))})}))}},commitHash:"a74a5d29bd921d77b182a17bf54644e5f11e65ad",coreVersion:"2.9.6"})},765:(e,t,n)=>{n.d(t,{a:()=>S});const i=coreApis.componentApis.video.videoInfo,o=coreApis.ajax,a=coreApis.meta;var s=n(986),r=n(391),d=n(402),l=n(401);function c(e,t,n){return(t=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var i=n.call(e,t||"default");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function u(e,t,n){!function(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}(e,t),t.set(e,n)}function p(e,t){return function(e,t){if(t.get)return t.get.call(e);return t.value}(e,v(e,t,"get"))}function f(e,t,n){return function(e,t,n){if(t.set)t.set.call(e,n);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=n}}(e,v(e,t,"set"),n),n}function v(e,t,n){if(!t.has(e))throw new TypeError("attempted to "+n+" private field on non-instance");return t.get(e)}function m(e){return e.replace(/[=;#\\\n]/g,(e=>`\\${e}`))}var g=new WeakMap,h=new WeakMap;class b{constructor(e,t){u(this,g,{writable:!0,value:void 0}),u(this,h,{writable:!0,value:void 0}),c(this,"basic",void 0),c(this,"viewPoints",void 0),c(this,"page",void 0),c(this,"quality",void 0),f(this,g,e),f(this,h,t),this.basic=new i.VideoInfo(e)}async fetch(){await this.basic.fetchInfo(),this.page=this.basic.pages.filter((e=>e.cid===parseInt(p(this,h))))[0];const e=await(0,o.bilibiliApi)((0,o.getJsonWithCredentials)(`https://api.bilibili.com/x/player/wbi/v2?aid=${p(this,g)}&cid=${p(this,h)}`));this.viewPoints=lodash.get(e,"view_points",[])}}async function y(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:unsafeWindow.aid,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.cid;const n=new b(e,t);return await n.fetch(),n}function w(e,t){let n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return`${n?"bilibili_":""}${e}=${m(lodash.toString(t))}`}async function _(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:unsafeWindow.aid,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.cid;const n=await y(e,t),i=n.basic,{options:{fieldsMode:o}}=(0,s.getComponentSettings)(d.u),r=[";FFMETADATA1",`;generated by Bilibili-Evolved v${a.meta.compilationInfo.version}`,`;generated on ${(new Date).toLocaleString()}`,w("title",`${i.title} - ${n.page.title}`,!1),w("description",i.description,!1),w("artist",i.up.name,!1)];if(o===l.l.ALL&&(r.push(w("title",i.title),w("description",i.description),w("publish_date",new Date(1e3*i.pubdate).toLocaleString()),w("aid",i.aid),w("bvid",i.bvid),w("cid",n.page.cid),w("category_id",i.tagId),w("category_name",i.tagName),w("page_title",n.page.title),w("page",n.page.pageNumber),w("pages",i.pages.length),w("up_name",i.up.name),w("up_uid",i.up.uid)),n.quality&&(r.push(w("quality",n.quality.value)),r.push(w("quality_label",n.quality.name)))),n.viewPoints.length>0)for(const e of n.viewPoints)r.push("[CHAPTER]","TIMEBASE=1/1",w("START",e.from,!1),w("END",e.to,!1),w("title",e.content,!1));const c=r.join("\n");return console.debug(c),c}async function A(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:unsafeWindow.aid,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.cid;const{viewPoints:n}=await y(e,t);if(console.debug(n),n.length>0){const e=n.reduce(((e,t,n)=>{const i=`${n+1}`.padStart(3,"0");return[...e,`CHAPTER${i}=${new Date(1e3*t.from).toISOString().slice(11,-1)}`,`CHAPTER${i}NAME=${t.content}`]}),[]).join("\n");return console.debug(e),e}return r.Toast.info("此视频没有章节",d.T,3e3),null}async function S(e){let t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.aid,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:unsafeWindow.cid;if("ogm"===e)t=A;else t=_;return t(n,i)}},401:(e,t,n)=>{n.d(t,{Y:()=>a,l:()=>o});var i=n(952);let o=function(e){return e.ALL="全部",e.Standard="仅标准字段",e}({});const a=(0,i.defineOptionsMetadata)({fieldsMode:{defaultValue:o.ALL,displayName:"FFMETADATA 字段",dropdownEnum:o}})},19:(e,t,n)=>{n.r(t),n.d(t,{default:()=>r});var i=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"download-video-config-section"},[t("div",{staticClass:"download-video-config-item"},[t("div",[e._v("元数据：")]),e._v(" "),t("VDropdown",{attrs:{items:e.items},scopedSlots:e._u([{key:"item",fn:function({item:t}){return[e._v("\n        "+e._s(t)+"\n      ")]}}]),model:{value:e.type,callback:function(t){e.type=t},expression:"type"}})],1)])};i._withStripped=!0;var o=n(648);const a=(0,n(986).getComponentSettings)("downloadVideo").options,s=Vue.extend({components:{VDropdown:o.VDropdown},data:()=>({type:a.metadataType??"无",items:["无","ffmetadata","ogm"]}),computed:{enabled(){return"无"!==this.type}},watch:{type(e){a.metadataType=e}}});const r=(0,n(893).Z)(s,i,[],!1,null,null,null).exports},939:(e,t,n)=>{n.r(t),n.d(t,{default:()=>c});var i=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"multiple-widgets"},[t("DefaultWidget",{ref:"button",attrs:{disabled:e.disabled,name:"保存视频元数据",icon:"mdi-download"},on:{click:function(t){return e.run("ffmetadata")}}}),e._v(" "),t("DefaultWidget",{attrs:{disabled:e.disabled,name:"保存视频章节",icon:"mdi-download"},on:{click:function(t){return e.run("ogm")}}})],1)};i._withStripped=!0;var o=n(648);const a=coreApis.utils.log,s=coreApis.download,r=coreApis.utils.title;var d=n(765);const l=Vue.extend({components:{DefaultWidget:o.DefaultWidget},data:()=>({disabled:!1}),methods:{async run(e){try{this.disabled=!0,s.DownloadPackage.single(`${(0,r.getFriendlyTitle)(!0)}.${e}.txt`,await(0,d.a)(e))}catch(e){(0,a.logError)(e)}finally{this.disabled=!1}}}});const c=(0,n(893).Z)(l,i,[],!1,null,null,null).exports},893:(e,t,n)=>{function i(e,t,n,i,o,a,s,r){var d,l="function"==typeof e?e.options:e;if(t&&(l.render=t,l.staticRenderFns=n,l._compiled=!0),i&&(l.functional=!0),a&&(l._scopeId="data-v-"+a),s?(d=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},l._ssrRegister=d):o&&(d=r?function(){o.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:o),d)if(l.functional){l._injectStyles=d;var c=l.render;l.render=function(e,t){return d.call(t),c(e,t)}}else{var u=l.beforeCreate;l.beforeCreate=u?[].concat(u,d):[d]}return{exports:e,options:l}}n.d(t,{Z:()=>i})},952:e=>{e.exports=coreApis.componentApis.define},986:e=>{e.exports=coreApis.settings},391:e=>{e.exports=coreApis.toast},648:e=>{e.exports=coreApis.ui}},t={};function n(i){var o=t[i];if(void 0!==o)return o.exports;var a=t[i]={exports:{}};return e[i](a,a.exports,n),a.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i=n(402);return i=i.component})()));
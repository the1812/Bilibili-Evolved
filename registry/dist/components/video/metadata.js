!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/metadata"]=t():e["video/metadata"]=t()}(globalThis,(()=>(()=>{"use strict";var e={307:(e,t,n)=>{n.d(t,{component:()=>p,U:()=>c,D:()=>l});var i=n(253);const o=coreApis.spinQuery;var a=n(5);const s=coreApis.utils.urls;var r=n(828),d=n(994);const l="保存视频元数据",c="saveVideoMetadata",u=[{name:"WakelessSloth56",link:"https://github.com/WakelessSloth56"},{name:"LainIO24",link:"https://github.com/LainIO24"}],p=(0,i.defineComponentMetadata)({name:c,displayName:l,description:"保存视频元数据（标题、描述、UP、章节等）",author:u,tags:[componentsTags.video],entry:none,urlInclude:s.videoUrls,options:d.f,widget:{condition:o.hasVideo,component:()=>Promise.resolve().then(n.bind(n,617)).then((e=>e.default))},plugin:{displayName:`下载视频 - ${l}支持`,author:u,setup:e=>{let{addData:t}=e;t("downloadVideo.assets",(async e=>{e.push({name:c,displayName:l,getAssets:async(e,t)=>{const{type:n,enabled:i}=t;if(i){const t=a.Toast.info("获取视频元数据中...",l),i=[];for(const t of e)i.push({name:`${t.input.title}.${n}.txt`,data:await(0,r.V)(n,t.input.aid,t.input.cid),options:{}});return t.message="完成！",t.duration=1e3,i}return[]},component:()=>Promise.resolve().then(n.bind(n,276)).then((e=>e.default))})}))}},commitHash:"549fcdb16eeb45122ceaa48017a43a573598fc1a",coreVersion:"2.10.0"})},828:(e,t,n)=>{n.d(t,{V:()=>A});const i=coreApis.componentApis.video.videoInfo,o=coreApis.ajax,a=coreApis.meta;var s=n(905),r=n(5),d=n(307),l=n(994);function c(e,t,n){return(t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var i=n.call(e,t||"default");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function u(e,t,n){(function(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")})(e,t),t.set(e,n)}function p(e,t){return e.get(v(e,t))}function f(e,t,n){return e.set(v(e,t),n),n}function v(e,t,n){if("function"==typeof e?e===t:e.has(t))return arguments.length<3?t:n;throw new TypeError("Private element is not present on this object")}var h=new WeakMap,m=new WeakMap;class g{constructor(e,t){u(this,h,void 0),u(this,m,void 0),c(this,"basic",void 0),c(this,"viewPoints",void 0),c(this,"page",void 0),c(this,"quality",void 0),f(h,this,e),f(m,this,t),this.basic=new i.VideoInfo(e)}async fetch(){await this.basic.fetchInfo(),this.page=this.basic.pages.filter((e=>e.cid===parseInt(p(m,this))))[0];const e=await(0,o.bilibiliApi)((0,o.getJsonWithCredentials)(`https://api.bilibili.com/x/player/wbi/v2?aid=${p(h,this)}&cid=${p(m,this)}`));this.viewPoints=lodash.get(e,"view_points",[])}}async function b(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:unsafeWindow.aid,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.cid;const n=new g(e,t);return await n.fetch(),n}function y(e,t){return`${!(arguments.length>2&&void 0!==arguments[2])||arguments[2]?"bilibili_":""}${e}=${n=lodash.toString(t),n.replace(/[=;#\\\n]/g,(e=>`\\${e}`))}`;var n}async function w(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:unsafeWindow.aid,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.cid;const n=await b(e,t),i=n.basic,{options:{fieldsMode:o}}=(0,s.getComponentSettings)(d.U),r=[";FFMETADATA1",`;generated by Bilibili-Evolved v${a.meta.compilationInfo.version}`,`;generated on ${(new Date).toLocaleString()}`,y("title",`${i.title} - ${n.page.title}`,!1),y("description",i.description,!1),y("artist",i.up.name,!1)];if(o===l.H.ALL&&(r.push(y("title",i.title),y("description",i.description),y("publish_date",new Date(1e3*i.pubdate).toLocaleString()),y("aid",i.aid),y("bvid",i.bvid),y("cid",n.page.cid),y("category_id",i.tagId),y("category_name",i.tagName),y("page_title",n.page.title),y("page",n.page.pageNumber),y("pages",i.pages.length),y("up_name",i.up.name),y("up_uid",i.up.uid)),n.quality&&(r.push(y("quality",n.quality.value)),r.push(y("quality_label",n.quality.name)))),n.viewPoints.length>0)for(const e of n.viewPoints)r.push("[CHAPTER]","TIMEBASE=1/1",y("START",e.from,!1),y("END",e.to,!1),y("title",e.content,!1));const c=r.join("\n");return console.debug(c),c}async function _(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:unsafeWindow.aid,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.cid;const{viewPoints:n}=await b(e,t);if(console.debug(n),n.length>0){const e=n.reduce(((e,t,n)=>{const i=`${n+1}`.padStart(3,"0");return[...e,`CHAPTER${i}=${new Date(1e3*t.from).toISOString().slice(11,-1)}`,`CHAPTER${i}NAME=${t.content}`]}),[]).join("\n");return console.debug(e),e}return r.Toast.info("此视频没有章节",d.D,3e3),null}async function A(e){let t;if("ogm"===e)t=_;else t=w;return t(arguments.length>1&&void 0!==arguments[1]?arguments[1]:unsafeWindow.aid,arguments.length>2&&void 0!==arguments[2]?arguments[2]:unsafeWindow.cid)}},994:(e,t,n)=>{n.d(t,{H:()=>o,f:()=>a});var i=n(253);let o=function(e){return e.ALL="全部",e.Standard="仅标准字段",e}({});const a=(0,i.defineOptionsMetadata)({fieldsMode:{defaultValue:o.ALL,displayName:"FFMETADATA 字段",dropdownEnum:o}})},276:(e,t,n)=>{n.r(t),n.d(t,{default:()=>r});var i=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"download-video-config-section"},[t("div",{staticClass:"download-video-config-item"},[t("div",[e._v("元数据：")]),e._v(" "),t("VDropdown",{attrs:{items:e.items},scopedSlots:e._u([{key:"item",fn:function({item:t}){return[e._v("\n        "+e._s(t)+"\n      ")]}}]),model:{value:e.type,callback:function(t){e.type=t},expression:"type"}})],1)])};i._withStripped=!0;var o=n(164);const a=(0,n(905).getComponentSettings)("downloadVideo").options,s=Vue.extend({components:{VDropdown:o.VDropdown},data:()=>({type:a.metadataType??"无",items:["无","ffmetadata","ogm"]}),computed:{enabled(){return"无"!==this.type}},watch:{type(e){a.metadataType=e}}});const r=(0,n(678).A)(s,i,[],!1,null,null,null).exports},617:(e,t,n)=>{n.r(t),n.d(t,{default:()=>c});var i=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"multiple-widgets"},[t("DefaultWidget",{ref:"button",attrs:{disabled:e.disabled,name:"保存视频元数据",icon:"mdi-download"},on:{click:function(t){return e.run("ffmetadata")}}}),e._v(" "),t("DefaultWidget",{attrs:{disabled:e.disabled,name:"保存视频章节",icon:"mdi-download"},on:{click:function(t){return e.run("ogm")}}})],1)};i._withStripped=!0;var o=n(164);const a=coreApis.utils.log,s=coreApis.download,r=coreApis.utils.title;var d=n(828);const l=Vue.extend({components:{DefaultWidget:o.DefaultWidget},data:()=>({disabled:!1}),methods:{async run(e){try{this.disabled=!0,s.DownloadPackage.single(`${(0,r.getFriendlyTitle)(!0)}.${e}.txt`,await(0,d.V)(e))}catch(e){(0,a.logError)(e)}finally{this.disabled=!1}}}});const c=(0,n(678).A)(l,i,[],!1,null,null,null).exports},678:(e,t,n)=>{function i(e,t,n,i,o,a,s,r){var d,l="function"==typeof e?e.options:e;if(t&&(l.render=t,l.staticRenderFns=n,l._compiled=!0),i&&(l.functional=!0),a&&(l._scopeId="data-v-"+a),s?(d=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},l._ssrRegister=d):o&&(d=r?function(){o.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:o),d)if(l.functional){l._injectStyles=d;var c=l.render;l.render=function(e,t){return d.call(t),c(e,t)}}else{var u=l.beforeCreate;l.beforeCreate=u?[].concat(u,d):[d]}return{exports:e,options:l}}n.d(t,{A:()=>i})},253:e=>{e.exports=coreApis.componentApis.define},905:e=>{e.exports=coreApis.settings},5:e=>{e.exports=coreApis.toast},164:e=>{e.exports=coreApis.ui}},t={};function n(i){var o=t[i];if(void 0!==o)return o.exports;var a=t[i]={exports:{}};return e[i](a,a.exports,n),a.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i=n(307);return i=i.component})()));
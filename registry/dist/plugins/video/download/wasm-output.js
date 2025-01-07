!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/download/wasm-output"]=t():e["video/download/wasm-output"]=t()}(globalThis,(()=>(()=>{"use strict";var e={244:(e,t,o)=>{o.r(t),o.d(t,{default:()=>l});var a=function(){var e=this,t=e._self._c;e._self._setupProxy;return e.shouldShow?t("div",{staticClass:"download-video-config-item",staticStyle:{"flex-wrap":"wrap"}},[t("div",{staticClass:"download-video-config-title"},[e._v("写入元数据：")]),e._v(" "),t("SwitchBox",{on:{change:e.saveOptions},model:{value:e.muxWithMetadata,callback:function(t){e.muxWithMetadata=t},expression:"muxWithMetadata"}}),e._v(" "),t("div",{staticClass:"download-video-config-description",staticStyle:{width:"100%"}},[e._v("\n    仅支持元数据类型「ffmetadata」\n  ")])],1):e._e()};a._withStripped=!0;const n=coreApis.ui;var i=o(986);const{options:s}=(0,i.getComponentSettings)("downloadVideo"),r={muxWithMetadata:!1,...s};var c=function(e,t,o,a,n,i,s,r){var c,l="function"==typeof e?e.options:e;if(t&&(l.render=t,l.staticRenderFns=o,l._compiled=!0),a&&(l.functional=!0),i&&(l._scopeId="data-v-"+i),s?(c=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),n&&n.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},l._ssrRegister=c):n&&(c=r?function(){n.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:n),c)if(l.functional){l._injectStyles=c;var d=l.render;l.render=function(e,t){return c.call(t),d(e,t)}}else{var u=l.beforeCreate;l.beforeCreate=u?[].concat(u,c):[c]}return{exports:e,options:l}}(Vue.extend({components:{SwitchBox:n.SwitchBox},data(){const e=(0,i.isComponentEnabled)("saveVideoMetadata");return{shouldShow:e,muxWithMetadata:e&&r.muxWithMetadata}},methods:{saveOptions(){r.muxWithMetadata=this.muxWithMetadata,Object.assign(s,r)}}}),a,[],!1,null,null,null);const l=c.exports},986:e=>{e.exports=coreApis.settings}},t={};function o(a){var n=t[a];if(void 0!==n)return n.exports;var i=t[a]={exports:{}};return e[a](i,i.exports,o),i.exports}o.d=(e,t)=>{for(var a in t)o.o(t,a)&&!o.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};return(()=>{o.d(a,{plugin:()=>P,T:()=>k});const e=coreApis.toast,t=coreApis.download,n=coreApis.meta;var i=o(986);const s=coreApis.utils.formatters;function r(e,t,o){return(t=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var o=e[Symbol.toPrimitive];if(void 0!==o){var a=o.call(e,t||"default");if("object"!=typeof a)return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e}function c(e,t,o){!function(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}(e,t),t.set(e,o)}function l(e,t,o){return function(e,t,o){if(t.set)t.set.call(e,o);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=o}}(e,u(e,t,"set"),o),o}function d(e,t){return function(e,t){if(t.get)return t.get.call(e);return t.value}
/* eslint-disable @typescript-eslint/naming-convention */(e,u(e,t,"get"))}function u(e,t,o){if(!t.has(e))throw new TypeError("attempted to "+o+" private field on non-instance");return t.get(e)}const p=(()=>{let e=0;return()=>e++})();var f=function(e){return e.LOAD="LOAD",e.EXEC="EXEC",e.WRITE_FILE="WRITE_FILE",e.READ_FILE="READ_FILE",e.DELETE_FILE="DELETE_FILE",e.ERROR="ERROR",e.PROGRESS="PROGRESS",e}(f||{}),h=new WeakMap,m=new WeakMap,w=new WeakMap,v=new WeakMap,g=new WeakMap,E=new WeakMap;const b={cache:"cache"};async function y(e,t){return async function(){return new Promise(((e,t)=>{const o=unsafeWindow.indexedDB.open("bilibili-evolved-wasm-output",124);o.onerror=t,o.onupgradeneeded=()=>{const e=o.result;for(const t of e.objectStoreNames)e.deleteObjectStore(t);Object.values(b).forEach((t=>{e.createObjectStore(t)}))},o.onsuccess=()=>e(o.result)}))}().then((o=>new Promise(((a,n)=>{const i=o.transaction(e,t);a(i.objectStore(e)),i.onerror=n}))))}async function x(e,t,o){const a=await y(e).then((e=>async function(e,t){return new Promise(((o,a)=>{const n=e.get(t);n.onerror=a,n.onsuccess=()=>o(n.result)}))}(e,t)));if(a)return a;const n=await o(t);return await y(e,"readwrite").then((e=>async function(e,t,o){return new Promise(((a,n)=>{const i=e.put(t,o);i.onerror=n,i.onsuccess=()=>a(i.result)}))}(e,n,t))),n}const _=coreApis.runtimeLibrary;function S(e){const t=[];return(o,a)=>(n,i)=>{var r,c;t[o]=`${a}: ${r=n,c=i,`${(0,s.formatFileSize)(r)}${c>0?` / ${(0,s.formatFileSize)(c)} @ ${(0,s.formatPercent)(r/c)}`:""}`}`,e.message=t.join("\n")}}async function F(e,t){const o=await fetch(e);if(!o.ok)throw new Error(`${o.status} ${o.statusText}`);const a=o.body.getReader(),n=o.headers.get("Content-Encoding")?-1:parseInt(o.headers.get("Content-Length"));let i=0;const s=[];
// eslint-disable-next-line no-constant-condition
for(;;){const{done:e,value:o}=await a.read();if(e)break;s.push(o),i+=o.length,t(i,n)}const r=new Uint8Array(i);let c=0;for(const e of s)r.set(e,c),c+=e.length;return r}async function R(e,t,o){return x(b.cache,e,(async()=>{const e=await F(t.url,o),a=await _.RuntimeLibrary.sha256(e);if(a!==t.sha256)throw new Error(`Check integrity failed from ${t.url}, expected = ${t.sha256}, actual = ${a}`);return e}))}function L(e,t){const o=new Blob([e],{type:t});return URL.createObjectURL(o)}const A=new class{constructor(){var e=this;c(this,h,{writable:!0,value:null}),c(this,m,{writable:!0,value:{}}),c(this,w,{writable:!0,value:{}}),c(this,v,{writable:!0,value:void 0}),r(this,"loaded",!1),c(this,g,{writable:!0,value:()=>{d(this,h)&&(d(this,h).onmessage=e=>{let{data:{id:t,type:o,data:a}}=e;switch(o){case f.LOAD:this.loaded=!0,d(this,m)[t](a);break;case f.EXEC:case f.WRITE_FILE:case f.READ_FILE:case f.DELETE_FILE:d(this,m)[t](a);break;case f.PROGRESS:d(this,v)&&d(this,v).call(this,a);break;case f.ERROR:d(this,w)[t](a)}delete d(this,m)[t],delete d(this,w)[t]})}}),c(this,E,{writable:!0,value:function(t){let{type:o,data:a}=t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],i=arguments.length>2?arguments[2]:void 0;return d(e,h)?new Promise(((t,s)=>{const r=p();d(e,h)&&d(e,h).postMessage({id:r,type:o,data:a},n),d(e,m)[r]=t,d(e,w)[r]=s,i?.addEventListener("abort",(()=>{s(new DOMException(`Message # ${r} was aborted`,"AbortError"))}),{once:!0})})):Promise.reject(new Error("FFmpeg is not loaded"))}}),r(this,"load",((e,t)=>(d(this,h)||(l(this,h,new Worker(e.workerLoadURL,{type:"classic"})),d(this,g).call(this)),d(this,E).call(this,{type:f.LOAD,data:e},void 0,t)))),r(this,"exec",(function(t){let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1,a=arguments.length>2?arguments[2]:void 0;return d(e,E).call(e,{type:f.EXEC,data:{args:t,timeout:o}},void 0,a)})),r(this,"terminate",(()=>{const e=Object.keys(d(this,w));for(const t of e)d(this,w)[t](new Error("FFmpeg terminated")),delete d(this,w)[t],delete d(this,m)[t];d(this,h)&&(d(this,h).terminate(),l(this,h,null),this.loaded=!1)})),r(this,"writeFile",((e,t,o)=>{const a=[];return a.push(t.buffer),d(this,E).call(this,{type:f.WRITE_FILE,data:{path:e,data:t}},a,o)})),r(this,"readFile",((e,t)=>d(this,E).call(this,{type:f.READ_FILE,data:{path:e,encoding:"binary"}},void 0,t))),r(this,"deleteFile",((e,t)=>d(this,E).call(this,{type:f.DELETE_FILE,data:{path:e}},void 0,t)))}onProgress(e){l(this,v,e)}};async function W(o,a,n,i,r){let c=arguments.length>5&&void 0!==arguments[5]?arguments[5]:1,l=arguments.length>6&&void 0!==arguments[6]?arguments[6]:1;const d=e.Toast.info("",`${k} - ${c} / ${l}`),u=S(d),[p,f]=await Promise.all([F(a,u(0,"正在下载视频流")),F(n,u(1,"正在下载音频流"))]);await A.writeFile("video",p),await A.writeFile("audio",f);const h=["-i","video","-i","audio"];i&&(await A.writeFile("ffmetadata",(new TextEncoder).encode(i)),h.push("-i","ffmetadata","-map_metadata","2"),r||h.push("-movflags","+use_metadata_tags")),h.push("-codec","copy","-f",r?"matroska":"mp4","output"),console.debug("FFmpeg commandline args:",h.join(" ")),A.onProgress((e=>{d.message=`混流中: ${(0,s.formatPercent)(e.progress)}`})),await A.exec(h);const m=await A.readFile("output"),w=new Blob([m],{type:r?"video/x-matroska":"video/mp4"});d.message="完成！",d.duration=1e3,await Promise.all([A.deleteFile("video"),A.deleteFile("audio"),A.deleteFile("output"),i?A.deleteFile("ffmetadata"):Promise.resolve()]),await t.DownloadPackage.single(o.replace(/.[^/.]+$/,"."+(r?"mkv":"mp4")),w)}async function M(t,o){A.loaded||await async function(){const t=e.Toast.info("正在加载 FFmpeg",`${k} - 初始化`),o=S(t),[a,i,s]=await Promise.all([R("ffmpeg-worker",n.meta.compilationInfo.altCdn.library.ffmpeg.worker,o(0,"正在加载 FFmpeg Worker")),R("ffmpeg-core",n.meta.compilationInfo.altCdn.library.ffmpeg.core,o(1,"正在加载 FFmpeg Core")),R("ffmpeg-wasm",n.meta.compilationInfo.altCdn.library.ffmpeg.wasm,o(2,"正在加载 FFmpeg WASM"))]);await A.load({workerLoadURL:L(a,"text/javascript"),coreURL:L(i,"text/javascript"),wasmURL:L(s,"application/wasm")}),t.message="完成！",t.close()}();const{infos:a,extraAssets:s}=t;let r;if(o){const e=[];for(const{asset:t,instance:o}of s)r||"saveVideoMetadata"!==t.name||"ffmetadata"!==o.type?e.push({asset:t,instance:o}):r=await t.getAssets(a,o);t.extraAssets=e}const{dashAudioExtension:c,dashFlacAudioExtension:l,dashVideoExtension:d}=(0,i.getComponentSettings)("downloadVideo").options;for(let e=0;e<a.length;e++){const t=a[e],[o,n]=t.titledFragments;if(2!==t.fragments.length||o.extension!==d||n.extension!==c&&n.extension!==l)throw new Error("仅支持 DASH 格式视频和音频");await W(o.title,o.url,n.url,r?.[e]?.data,n.extension===l,e+1,a.length)}}const k="WASM 混流输出",O="使用 WASM 在浏览器中下载并合并音视频, 支持批量下载",P={name:"downloadVideo.outputs.wasm",displayName:`下载视频 - ${k}`,description:O,author:{name:"WakelessSloth56",link:"https://github.com/WakelessSloth56"},setup:t=>{let{addData:a}=t;a("downloadVideo.outputs",(t=>{t.push({name:"wasm",displayName:"WASM",description:`${O}。运行过程中请勿关闭页面，初次使用或清除缓存后需要加载约 30 MB 的 WASM 文件。`,runAction:async(t,o)=>{try{await M(t,o.muxWithMetadata)}catch(t){e.Toast.error(String(t),k)}},component:()=>Promise.resolve().then(o.bind(o,244)).then((e=>e.default))})}))},commitHash:"1f79bcbdb0483da3f8928b98edccf3cb95926d1e",coreVersion:"2.9.6"}})(),a=a.plugin})()));
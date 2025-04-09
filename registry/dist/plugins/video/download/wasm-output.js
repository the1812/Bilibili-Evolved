!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/download/wasm-output"]=t():e["video/download/wasm-output"]=t()}(globalThis,(()=>(()=>{"use strict";var e={796:(e,t,o)=>{o.r(t),o.d(t,{default:()=>d});var a=function(){var e=this,t=e._self._c;e._self._setupProxy;return e.shouldShow?t("div",{staticClass:"download-video-config-item",staticStyle:{"flex-wrap":"wrap"}},[t("div",{staticClass:"download-video-config-title"},[e._v("写入元数据：")]),e._v(" "),t("SwitchBox",{on:{change:e.saveOptions},model:{value:e.muxWithMetadata,callback:function(t){e.muxWithMetadata=t},expression:"muxWithMetadata"}}),e._v(" "),t("div",{staticClass:"download-video-config-description",staticStyle:{width:"100%"}},[e._v("\n    仅支持元数据类型「ffmetadata」\n  ")])],1):e._e()};a._withStripped=!0;const n=coreApis.ui;var i=o(905);const{options:s}=(0,i.getComponentSettings)("downloadVideo"),r={muxWithMetadata:!1,...s};var c=function(e,t,o,a,n,i,s,r){var c,d="function"==typeof e?e.options:e;if(t&&(d.render=t,d.staticRenderFns=o,d._compiled=!0),a&&(d.functional=!0),i&&(d._scopeId="data-v-"+i),s?(c=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),n&&n.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},d._ssrRegister=c):n&&(c=r?function(){n.call(this,(d.functional?this.parent:this).$root.$options.shadowRoot)}:n),c)if(d.functional){d._injectStyles=c;var l=d.render;d.render=function(e,t){return c.call(t),l(e,t)}}else{var u=d.beforeCreate;d.beforeCreate=u?[].concat(u,c):[c]}return{exports:e,options:d}}(Vue.extend({components:{SwitchBox:n.SwitchBox},data(){const e=(0,i.isComponentEnabled)("saveVideoMetadata");return{shouldShow:e,muxWithMetadata:e&&r.muxWithMetadata}},methods:{saveOptions(){r.muxWithMetadata=this.muxWithMetadata,Object.assign(s,r)}}}),a,[],!1,null,null,null);const d=c.exports},905:e=>{e.exports=coreApis.settings}},t={};function o(a){var n=t[a];if(void 0!==n)return n.exports;var i=t[a]={exports:{}};return e[a](i,i.exports,o),i.exports}o.d=(e,t)=>{for(var a in t)o.o(t,a)&&!o.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};o.d(a,{plugin:()=>j,D:()=>O});const n=coreApis.toast,i=coreApis.download,s=coreApis.meta;var r=o(905);const c=coreApis.utils.formatters;function d(e,t,o){return(t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var o=e[Symbol.toPrimitive];if(void 0!==o){var a=o.call(e,t||"default");if("object"!=typeof a)return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e}function l(e,t,o){(function(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")})(e,t),t.set(e,o)}function u(e,t,o){return e.set(h(e,t),o),o}function p(e,t){return e.get(h(e,t))}function h(e,t,o){if("function"==typeof e?e===t:e.has(t))return arguments.length<3?t:o;throw new TypeError("Private element is not present on this object")}
/* eslint-disable @typescript-eslint/naming-convention */const f=(()=>{let e=0;return()=>e++})();var m=function(e){return e.LOAD="LOAD",e.EXEC="EXEC",e.WRITE_FILE="WRITE_FILE",e.READ_FILE="READ_FILE",e.DELETE_FILE="DELETE_FILE",e.ERROR="ERROR",e.PROGRESS="PROGRESS",e}(m||{}),w=new WeakMap,g=new WeakMap,v=new WeakMap,E=new WeakMap,y=new WeakMap,b=new WeakMap;const x={cache:"cache"};async function _(e,t){return async function(){return new Promise(((e,t)=>{const o=unsafeWindow.indexedDB.open("bilibili-evolved-wasm-output",124);o.onerror=t,o.onupgradeneeded=()=>{const e=o.result;for(const t of e.objectStoreNames)e.deleteObjectStore(t);Object.values(x).forEach((t=>{e.createObjectStore(t)}))},o.onsuccess=()=>e(o.result)}))}().then((o=>new Promise(((a,n)=>{const i=o.transaction(e,t);a(i.objectStore(e)),i.onerror=n}))))}async function S(e,t,o){const a=await _(e).then((e=>async function(e,t){return new Promise(((o,a)=>{const n=e.get(t);n.onerror=a,n.onsuccess=()=>o(n.result)}))}(e,t)));if(a)return a;const n=await o(t);return await _(e,"readwrite").then((e=>async function(e,t,o){return new Promise(((a,n)=>{const i=e.put(t,o);i.onerror=n,i.onsuccess=()=>a(i.result)}))}(e,n,t))),n}const F=coreApis.runtimeLibrary;function R(e){const t=[];return(o,a)=>(n,i)=>{var s,r;t[o]=`${a}: ${s=n,r=i,`${(0,c.formatFileSize)(s)}${r>0?` / ${(0,c.formatFileSize)(r)} @ ${(0,c.formatPercent)(s/r)}`:""}`}`,e.message=t.join("\n")}}async function L(e,t){const o=await fetch(e);if(!o.ok)throw new Error(`${o.status} ${o.statusText}`);const a=o.body.getReader(),n=o.headers.get("Content-Encoding")?-1:parseInt(o.headers.get("Content-Length"));let i=0;const s=[];
// eslint-disable-next-line no-constant-condition
for(;;){const{done:e,value:o}=await a.read();if(e)break;s.push(o),i+=o.length,t(i,n)}const r=new Uint8Array(i);let c=0;for(const e of s)r.set(e,c),c+=e.length;return r}async function A(e,t,o){return S(x.cache,e,(async()=>{const e=await L(t.url,o),a=await F.RuntimeLibrary.sha256(e);if(a!==t.sha256)throw new Error(`Check integrity failed from ${t.url}, expected = ${t.sha256}, actual = ${a}`);return e}))}function W(e,t){const o=new Blob([e],{type:t});return URL.createObjectURL(o)}const M=new class{constructor(){var e=this;l(this,w,null),l(this,g,{}),l(this,v,{}),l(this,E,void 0),d(this,"loaded",!1),l(this,y,(()=>{p(w,this)&&(p(w,this).onmessage=e=>{let{data:{id:t,type:o,data:a}}=e;switch(o){case m.LOAD:this.loaded=!0,p(g,this)[t](a);break;case m.EXEC:case m.WRITE_FILE:case m.READ_FILE:case m.DELETE_FILE:p(g,this)[t](a);break;case m.PROGRESS:p(E,this)&&p(E,this).call(this,a);break;case m.ERROR:p(v,this)[t](a)}delete p(g,this)[t],delete p(v,this)[t]})})),l(this,b,(function(t){let{type:o,data:a}=t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],i=arguments.length>2?arguments[2]:void 0;return p(w,e)?new Promise(((t,s)=>{const r=f();p(w,e)&&p(w,e).postMessage({id:r,type:o,data:a},n),p(g,e)[r]=t,p(v,e)[r]=s,i?.addEventListener("abort",(()=>{s(new DOMException(`Message # ${r} was aborted`,"AbortError"))}),{once:!0})})):Promise.reject(new Error("FFmpeg is not loaded"))})),d(this,"load",((e,t)=>(p(w,this)||(u(w,this,new Worker(e.workerLoadURL,{type:"classic"})),p(y,this).call(this)),p(b,this).call(this,{type:m.LOAD,data:e},void 0,t)))),d(this,"exec",(function(t){let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1,a=arguments.length>2?arguments[2]:void 0;return p(b,e).call(e,{type:m.EXEC,data:{args:t,timeout:o}},void 0,a)})),d(this,"terminate",(()=>{const e=Object.keys(p(v,this));for(const t of e)p(v,this)[t](new Error("FFmpeg terminated")),delete p(v,this)[t],delete p(g,this)[t];p(w,this)&&(p(w,this).terminate(),u(w,this,null),this.loaded=!1)})),d(this,"writeFile",((e,t,o)=>{const a=[];return a.push(t.buffer),p(b,this).call(this,{type:m.WRITE_FILE,data:{path:e,data:t}},a,o)})),d(this,"readFile",((e,t)=>p(b,this).call(this,{type:m.READ_FILE,data:{path:e,encoding:"binary"}},void 0,t))),d(this,"deleteFile",((e,t)=>p(b,this).call(this,{type:m.DELETE_FILE,data:{path:e}},void 0,t)))}onProgress(e){u(E,this,e)}};async function P(e,t,o,a,s){let r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:1,d=arguments.length>6&&void 0!==arguments[6]?arguments[6]:1;const l=n.Toast.info("",`${O} - ${r} / ${d}`),u=R(l),[p,h]=await Promise.all([L(t,u(0,"正在下载视频流")),L(o,u(1,"正在下载音频流"))]);await M.writeFile("video",p),await M.writeFile("audio",h);const f=["-i","video","-i","audio"];a&&(await M.writeFile("ffmetadata",(new TextEncoder).encode(a)),f.push("-i","ffmetadata","-map_metadata","2"),s||f.push("-movflags","+use_metadata_tags")),f.push("-codec","copy","-f",s?"matroska":"mp4","output"),console.debug("FFmpeg commandline args:",f.join(" ")),M.onProgress((e=>{l.message=`混流中: ${(0,c.formatPercent)(e.progress)}`})),await M.exec(f);const m=await M.readFile("output"),w=new Blob([m],{type:s?"video/x-matroska":"video/mp4"});l.message="完成！",l.duration=1e3,await Promise.all([M.deleteFile("video"),M.deleteFile("audio"),M.deleteFile("output"),a?M.deleteFile("ffmetadata"):Promise.resolve()]),await i.DownloadPackage.single(e.replace(/.[^/.]+$/,"."+(s?"mkv":"mp4")),w)}async function k(e,t){M.loaded||await async function(){const e=n.Toast.info("正在加载 FFmpeg",`${O} - 初始化`),t=R(e),[o,a,i]=await Promise.all([A("ffmpeg-worker",s.meta.compilationInfo.altCdn.library.ffmpeg.worker,t(0,"正在加载 FFmpeg Worker")),A("ffmpeg-core",s.meta.compilationInfo.altCdn.library.ffmpeg.core,t(1,"正在加载 FFmpeg Core")),A("ffmpeg-wasm",s.meta.compilationInfo.altCdn.library.ffmpeg.wasm,t(2,"正在加载 FFmpeg WASM"))]);await M.load({workerLoadURL:W(o,"text/javascript"),coreURL:W(a,"text/javascript"),wasmURL:W(i,"application/wasm")}),e.message="完成！",e.close()}();const{infos:o,extraAssets:a}=e;let i;if(t){const t=[];for(const{asset:e,instance:n}of a)i||"saveVideoMetadata"!==e.name||"ffmetadata"!==n.type?t.push({asset:e,instance:n}):i=await e.getAssets(o,n);e.extraAssets=t}const{dashAudioExtension:d,dashFlacAudioExtension:l,dashVideoExtension:u}=(0,r.getComponentSettings)("downloadVideo").options;for(let e=0;e<o.length;e++){const t=o[e],[a,n]=t.titledFragments;if(2!==t.fragments.length||a.extension!==u||n.extension!==d&&n.extension!==l)throw new Error("仅支持 DASH 格式视频和音频");if(a.size+n.size>4294967295)throw new Error(`仅支持合并 4GB 内的音视频（${(0,c.formatFileSize)(a.size+n.size)}）`);await P(a.title,a.url,n.url,i?.[e]?.data,n.extension===l,e+1,o.length)}}const O="WASM 混流输出",$="使用 WASM 在浏览器中下载并合并音视频, 支持批量下载",j={name:"downloadVideo.outputs.wasm",displayName:`下载视频 - ${O}`,description:$,author:{name:"WakelessSloth56",link:"https://github.com/WakelessSloth56"},setup:e=>{let{addData:t}=e;t("downloadVideo.outputs",(e=>{e.push({name:"wasm",displayName:"WASM",description:`${$}。运行过程中请勿关闭页面，初次使用或清除缓存后需要加载约 30 MB 的 WASM 文件。由于浏览器限制，仅支持合并 4GB 以内的音视频。`,runAction:async(e,t)=>{try{await k(e,t.muxWithMetadata)}catch(e){n.Toast.error(String(e),O)}},component:()=>Promise.resolve().then(o.bind(o,796)).then((e=>e.default))})}))},commitHash:"37231b0555ca29fe46a344ca91da615c066a5e47",coreVersion:"2.10.1"};return a=a.plugin})()));
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/extend-speed"]=t():e["video/player/extend-speed"]=t()}(globalThis,(()=>(()=>{"use strict";var e={d:(t,n)=>{for(var s in n)e.o(n,s)&&!e.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:n[s]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{component:()=>Q});const n=coreApis.utils.urls,s=coreApis.settings,i=coreApis.utils.log,o=coreApis.pluginApis.hook,r=e=>"function"==typeof e?{next:e}:e,a=e=>function e(t){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,o=!1;const a=[],l=[];let c=!1;const d=()=>{for(;a.length;)a.pop()();l.length=0,c=!0},p=e=>{c||(l.forEach((t=>{t.error?.(e),(0,s.getGeneralSettings)().devMode&&console.error(e)})),d())},u=e=>{c||l.forEach((t=>{try{t.next(e)}catch(e){p(e)}}))},h=()=>{l.forEach((e=>{e.complete?.()})),d()},m=()=>{if(o)return;const e=t?.({next:u,error:p,complete:h});e&&a.push(e),o=!0},b=e=>null==e?null:(l.push(e),()=>{lodash.pull(l,e)}),f=function(){for(var t=arguments.length,n=new Array(t),s=0;s<t;s++)n[s]=arguments[s];return 0===n.length?{subscribe:e=>{const t=b(r(e));return(i?.connect??m)(),t},pipe:f,next:u,error:p,complete:h,...i}:e(n[0],{subscribe:b},i||{connect:m,next:u}).pipe(...n.slice(1))};if(n){const e=t?.({subscribe:e=>n.subscribe({error:p,complete:h,...r(e)}),next:u,error:p,complete:h});e&&a.push(e)}return f()}(e),l=(e,t)=>a((n=>{let{next:s}=n;return e.addEventListener(t,s),()=>e.removeEventListener(t,s)})),c=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),s=1;s<t;s++)n[s-1]=arguments[s];return a((t=>{let{next:s}=t;e(...n,s)}))},d=e=>new Promise(((t,n)=>{const s=e.subscribe({next:e=>{t(e),s()},error:()=>{n(),s()},complete:()=>{n(),s()}})})),p=coreApis.componentApis.video.playerAgent,u=coreApis.lifeCycle,h=coreApis.observer,m=coreApis.utils,b=coreApis.utils.sort,f=e=>t=>{let{subscribe:n,next:s,complete:i,error:o}=t;n(lodash.mapValues({next:s,complete:i,error:o},(t=>e(t))))},y=e=>function(){for(var t=arguments.length,n=new Array(t),s=0;s<t;s++)n[s]=arguments[s];Promise.resolve().then((()=>e(...n)))},v=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return a((e=>{let{next:n,error:s,complete:i}=e;return(e=>{const t=new Set;return e((e=>{lodash.castArray(e).forEach((e=>{t.add(e)}))})),()=>{t.forEach((e=>{e()}))}})((e=>{const o=[];let r=0;e(t.map(((e,a)=>e.pipe(f(y)).subscribe({next:e=>{o[a]=e,o.reduce((e=>e+1),0)===t.length&&n(o.slice())},complete:()=>{r++,r===t.length&&i()},error:s})))),e((()=>{o.length=0,r=0}))}))}))},g=e=>t=>{let{subscribe:n,next:s,error:i}=t;n(lodash.debounce((e=>{try{s(e)}catch(e){i(e)}}),e))},x=e=>t=>{let{subscribe:n,next:s}=t;n((t=>{e(t)&&s(t)}))},S=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return e=>{let{next:n,subscribe:s}=e,i=!1;s((e=>{i||t.forEach((e=>n(e))),n(e),i=!0}))}},w=coreApis.pluginApis.data,E=e=>e.split(",").map((e=>e.trim().replace(/^\./,""))).join(","),$=e=>e.split(",").join(" "),C=(e,t)=>{const n=t=>{(0,w.registerAndGetData)(e,t)[0]=t},s=(0,w.getData)(e);if(s.length)return[s[0],n];if(t){const e=t();return n(e),[e,n]}return[void 0,n]},V=function(e){return arguments.length>1&&void 0!==arguments[1]&&arguments[1]&&1===e?"倍速":Math.trunc(e)===e?`${e}.0x`:`${e}x`},M=e=>{if("倍速"===e)return 1;const t=/([0-9]*[.]?[0-9]+)x/.exec(e);if(t)return parseFloat(t[1]);throw new Error(`unknown speed text: ${e}`)};function A(e,t,n){return(t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var s=n.call(e,t||"default");if("object"!=typeof s)return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const L=p.playerAgent.provideCustomQuery({video:{speedMenuList:".bilibili-player-video-btn-speed-menu, .bpx-player-ctrl-playbackrate-menu",speedMenuItem:".bilibili-player-video-btn-speed-menu-list, .bpx-player-ctrl-playbackrate-menu-item",speedNameBtn:".bilibili-player-video-btn-speed-name, .bpx-player-ctrl-playbackrate-result",speedContainer:".bilibili-player-video-btn-speed, .bpx-player-ctrl-playbackrate",active:".bilibili-player-active, .bpx-state-active",show:".bilibili-player-speed-show, .bpx-state-show"},bangumi:{speedMenuList:".squirtle-speed-select-list, .bpx-player-ctrl-playbackrate-menu",speedMenuItem:".squirtle-select-item, .bpx-player-ctrl-playbackrate-menu-item",speedNameBtn:".squirtle-speed-select-result, .bpx-player-ctrl-playbackrate-result",speedContainer:".squirtle-speed-wrap, .bpx-player-ctrl-playbackrate",active:".active, .bpx-state-active",show:".bilibili-player-speed-show, .bpx-state-show"}});let k=function(e){return e[e.MIN=0]="MIN",e[e.CURRENT=1]="CURRENT",e[e.MAX=2]="MAX",e}({});const N=(e,t,n)=>{const s=new MutationObserver(n);return s.observe(e,t),s},j=e=>{let[t,n]=e;if(!t)throw new Error("speed container element not found!");if(!n)throw new Error("video element not found!");const s=t.querySelector(L.custom.speedNameBtn.selector),i=t.querySelector(L.custom.speedMenuList.selector);let o,r,l;const c=a(),d=a().pipe((e=>{let t,{subscribe:n,next:s}=e,i=!0;n((e=>{(i||t!==e)&&(i=!1,t=e,s(e))}))}));d.pipe(S(void 0),(e=>{let{subscribe:t,next:n}=e;const s=[];return t((e=>{2===s.length&&s.shift(),s.push(e),2===s.length&&n(s.slice())})),()=>{s.length=0}})).subscribe((e=>{let[t,n]=e;r=t,o=n}));const p=e=>{if(e)switch(e.nodeType){case Node.TEXT_NODE:d.next(M(e.data));break;case Node.ELEMENT_NODE:d.next(M(e.innerHTML));break;default:console.warn("The target parameter of updateActiveVideoSpeed must be a Node, and the node type must be one of TEXT_NODE and ELEMENT_NODE")}},u=()=>{l=lodash([...i.children]).map((e=>lodash.attempt((()=>M(e.textContent))))).reject((e=>lodash.isError(e))).sort((0,b.ascendingSort)()).value()};p(s),u();const h=N(i,{childList:!0,attributes:!0},(e=>{const{attributes:t=[],childList:n=[]}=lodash.groupBy(e,"type");n.length&&u(),c.next({attributes:t,childList:n})})),f=N(s,{childList:!0,subtree:!0},(e=>{e.forEach((e=>{const[t]=e.addedNodes;p(t)}))}));return{containerElement:t,videoElement:n,nameBtnElement:s,menuListElement:i,query:e=>(0,m.des)(`./*[(${function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"or";return e.split(",").map(E).flat().map((e=>`contains(@class, "${e}")`)).join(` ${t} `)}(L.custom.speedMenuItem.selector)}) and normalize-space()="${V(e)}"]`,i),dispose:()=>{h.disconnect(),f.disconnect()},activeVideoSpeed$:d,menuListElementMutations$:c,getActiveVideoSpeed:()=>o,getOldActiveVideoSpeed:()=>r,getAvailableSpeedValues:()=>l}},O=e=>{const{videoElement:t,menuListElement:n}=e,s=l(n,"click").pipe((i=e=>{const{innerText:t,innerHTML:n}=e.target,s=t.trim()||n.trim();return lodash.attempt((()=>M(s)))},e=>{let{subscribe:t,next:n}=e;t((e=>{n(i(e))}))}),x((e=>!lodash.isError(e))));var i;const o=a((e=>{let{next:n}=e,s=t;do{s=Object.getPrototypeOf(s)}while(null===s||!Object.prototype.hasOwnProperty.call(s,"playbackRate"));const i=Object.getOwnPropertyDescriptor(s,"playbackRate");return Object.defineProperty(s,"playbackRate",{set(e){i.set.call(this,e),n(e)}}),()=>{Object.defineProperty(s,"playbackRate",i)}})),r=s.pipe((e=>{let t,{subscribe:n,next:s}=e,i=!0;n((e=>{(i||t!==e)&&(i=!1,t=e,s(e))}))})),c=o.pipe((e=>{let t,{subscribe:n,next:s}=e,i=!0;n((e=>{(i||t!==e)&&(i=!1,t=e,s(e))}))})),d=a((e=>{let{next:t}=e;const n=v(r,c);return n.subscribe((e=>{let[n,s]=e;n===s&&t(s)})),()=>n.complete()})).pipe((e=>{let t,{subscribe:n,next:s}=e,i=!0;n((e=>{(i||t!==e)&&(i=!1,t=e,s(e))}))}));let p;c.pipe(g(200),S(void 0),(e=>{let{subscribe:t,next:n}=e;const s=[];return t((e=>{2===s.length&&s.shift(),s.push(e),2===s.length&&n(s.slice())})),()=>{s.length=0}})).subscribe((e=>{let[t]=e;p=t}));const u={menuListElementClickSpeed$:s,menuListElementClickSpeedChange$:r,playbackRate$:o,playbackRateChange$:c,videoSpeedChange$:d};return{...e,...u,dispose:()=>{lodash.values(u).forEach((e=>{e.complete()})),e.dispose()},getOldPlaybackRate:()=>p}},[T]=C("speed.NoSuchSpeedMenuItemElementError",(()=>class extends Error{constructor(e){const t=lodash.attempt((()=>V(e))),n=lodash.isError(t)?String(e):String(t);super(`There is no such speed menu item as ${n}`),this.speed=e,A(this,"formattedSpeed",void 0),this.formattedSpeed=n}})),I=e=>{const{query:t,videoElement:n,videoSpeedChange$:s,getOldActiveVideoSpeed:i,getAvailableSpeedValues:o,getActiveVideoSpeed:r}=e,a=async function(e){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:200;const o=t(e);if(null==o)throw new T(e);o.click();const r=t=>{if((t??n.playbackRate)!==e)throw new Error(`failed to set ${V(e)} video speed.`)},a=[d(s.pipe(g(Math.max(0,i||0))))];i>0&&a.push(new Promise(((e,t)=>setTimeout((()=>setTimeout(t,i)))))),await Promise.all(a).then(r).catch(r)},l=async()=>{await a(1)},c=async(e,t)=>{if(lodash.isNil(e)&&(e=!1),"boolean"==typeof e)e||1===n.playbackRate?await a(i()):await l();else{const n=o();switch(t){case k.MIN:await a(n[e]);break;case k.MAX:await a(n[n.length-1+e]);break;case k.CURRENT:default:{const t=n.indexOf(r());if(-1===t)throw new Error("Unexpected Error: The available speed values do not include the active speed value, this should be a bug, please report the issue on github!");await a(n[t+e])}}}},p=async e=>{try{await c(e,k.CURRENT)}catch(e){if(console.warn(e),!(e instanceof T))throw e}};return Object.assign(e,{set:a,force:async e=>{n.playbackRate=e},reset:l,toggle:c,step:p,increase:async()=>{await p(1)},decrease:async()=>{await p(-1)}})},P=()=>C("speed.speedContext"),R=()=>C("speed.buildArguments$",(()=>{return a().pipe((e=e=>e.settings.enabled,t=>{let{subscribe:n,next:s}=t;const i=new Set;return n((t=>{const n=i.size;e(t)?i.add(t):i.delete(t),i.size!==n&&s([...i])})),()=>{i.clear()}}));var e})),q=async function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:lodash.identity;const[t,n]=P();if(t)return t;let s,i;const[o]=C("lifeCycleComponentLoaded$",(()=>l(unsafeWindow,u.LifeCycleEventTypes.ComponentsLoaded))),[r]=R(),[p]=C("speed.videoChange$",(()=>c(h.videoChange).pipe(x((e=>{let{aid:t,cid:n}=e;return t||n}))))),[m]=C("speed.speedContext$",(()=>a((t=>{let{next:n}=t;return v(p,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return a((e=>{let{next:n,complete:s}=e;const i=[...t],o=()=>{const e=i.shift();e||s(),e.subscribe({next:n,complete:()=>{o()}})};o()}))}(function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return a((e=>{let{next:n,complete:s}=e;t.forEach((e=>{n(e)})),s()}))}([]),r),o).subscribe((t=>{let[o,r]=t;const[a]=P();a?.dispose(),i?.("context update");const l=new Promise(((e,t)=>{s=e,i=t}));Promise.all([Promise.all([L.custom.speedContainer(),L.query.video.element()]).then(s),l]).then((e=>{let[,t]=e;return t})).then(j).then(O).then(I).then((e=>Object.assign(e,{videoIdObject:o,speedContext$:m,videoChange$:p}))).then(e(r)).then(n).catch((e=>console.error(e)))}))}))));return m.subscribe(n),d(m)};function U(e,t,n){return(t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var s=n.call(e,t||"default");if("object"!=typeof s)return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const B=[.5,.75,1,1.25,1.5,2],z=.0625;class H{constructor(e,t){this.entryContext=e,this.enabled$=t,U(this,"speedContext",void 0),U(this,"settings",void 0),U(this,"coreApis",void 0),U(this,"metadata",void 0),U(this,"options",void 0),U(this,"getVideoIdObject",void 0),U(this,"getAvailableSpeedValues",void 0),U(this,"getOldActiveVideoSpeed",void 0),U(this,"forceVideoSpeed",void 0),U(this,"getVideoSpeed",void 0),U(this,"setVideoSpeed",void 0),U(this,"resetVideoSpeed",void 0),U(this,"toggleVideoSpeed",void 0),U(this,"increaseVideoSpeed",void 0),U(this,"decreaseVideoSpeed",void 0),lodash.assign(this,e,{options:e.settings.options}),this.migrate?.(),lodash.assign(this,lodash.mapValues(H.contextMap,(e=>async function(){const t=await q(),n=lodash.get(t,e);return lodash.isFunction(n)?await n(...arguments):n})))}}U(H,"create",void 0),U(H,"contextMap",{getVideoIdObject:"videoIdObject",getAvailableSpeedValues:"getAvailableSpeedValues",getOldActiveVideoSpeed:"getOldActiveVideoSpeed",getVideoSpeed:"videoElement.playbackRate",setVideoSpeed:"set",forceVideoSpeed:"force",resetVideoSpeed:"reset",toggleVideoSpeed:"toggle",increaseVideoSpeed:"increase",decreaseVideoSpeed:"decrease"}),q((e=>t=>{const n=lodash.omit(t,"dispose"),i=e.map((e=>e.getSpeedContextMixin(n)));if(i.length>1){const e=lodash.intersection(...i.map(Object.keys));if(e.length)throw new Error(`In the registered speed component, there is an implementation of getSpeedContextMixin that causes the speed context to be mixed in ambiguous.\nThe repeated key names are ${e.join(", ")}`)}lodash.assign(n,...i);const o=[];return e.forEach((e=>{const t=lodash(e.settings.options).mapValues(((t,n)=>c(s.addComponentListener,`${e.metadata.name}.${n}`).pipe((e=>{let t,{subscribe:n,next:s}=e,i=!0;n((e=>{(i||t!==e)&&(i=!1,t=e,s(e))}))})))).mapKeys(((e,t)=>`${t}$`)).value();o.push(...lodash.values(t)),e.options=new Proxy(e.settings.options,{get:(e,n,s)=>lodash.isSymbol(n)?Reflect.get(e,n,s):!Reflect.has(e,n)&&n.endsWith("$")?t[n]:Reflect.get(e,n,s)}),e.speedContext=n,e.onSpeedContext(n),e.settings.enabled&&lodash(t).entries().forEach((t=>{let[n,s]=t;s.next(e.settings.options[n.slice(0,-1)])}))})),{...n,dispose:()=>{o.forEach((e=>e.complete())),t.dispose()}}})),H.create=function(e){const t=a().pipe((e=>{let t,{subscribe:n,next:s}=e,i=!0;n((e=>{(i||t!==e)&&(i=!1,t=e,s(e))}))}));return{...e,entry:n=>{const s=lodash.attempt((()=>new this(n,t)));if(s instanceof Error)return(0,i.logError)(s),null;const[r]=R();return t.subscribe((()=>{r.next(s)})),t.next(!0),(0,o.getHook)(`speed.component.${e.name}`).after(s),s},reload:()=>t.next(!0),unload:()=>t.next(!1)}};const D=coreApis.style,X=coreApis.toast,W=e=>{let t,{style:n,name:s,container:i}=e;const o=()=>t?.remove();return{next:e=>{o();const r="function"==typeof n?n(e):n;r&&(t=(0,D.addStyle)(r,s,i))},complete:o}};function F(e,t,n){return(t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var s=n.call(e,t||"default");if("object"!=typeof s)return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const _="extend-speed-input",G="extend-speed-item",J=function(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];const n=document.createElement("div");n.innerHTML=e;const s={},i=n.children.item(0),o=e=>{t&&(e.id=`scoped-element-${Math.random().toString(36).replace(/[^a-z0-9]+/g,"")}`);const n=e.getAttribute("data-ref");n&&(s[lodash.camelCase(n)]=e);for(let t=0;t<e.children.length;t++)o(e.children.item(t))};return o(i),{...s,root:i}};class K extends H{static get activeClassName(){return E(L.custom.active.selector)}static get showClassName(){return E(L.custom.show.selector)}static get speedMenuItemClassName(){return E(L.custom.speedMenuItem.selector)}constructor(e,t){super(e,t),F(this,"elementMap",[]),F(this,"inputElement",void 0),F(this,"unpatch",void 0),F(this,"currentSpeedValue",void 0),F(this,"filterNativeSpeed",(()=>e=>{let{subscribe:t,next:n}=e;t((e=>{B.includes(e)&&n(e)}))})),this.enabled$.subscribe(W({name:"fix-after-element",style:e=>e&&".bpx-player-ctrl-playbackrate-menu:after { display: none; }"}))}addSpeedValue(e){this.options.extendSpeedList=lodash.sortedUniq(this.options.extendSpeedList.concat(e).sort((0,b.ascendingSort)()))}removeSpeedValue(e){this.options.extendSpeedList=lodash.without(this.options.extendSpeedList,e)}createInputElement(){const{input:e,root:t,icon:n}=J(`\n      <li class="${$(E(L.custom.speedMenuItem.selector))} ${_}">\n        <i data-ref="icon" class="mdi mdi-playlist-plus" style="font-size: 1.5em"></i>\n        <input data-ref="input" type="number" title="添加新的倍数值" max="16" step="0.5" style="display: none;"></input>\n      </li>\n    `),s=()=>{const t=this.speedContext.getAvailableSpeedValues().slice(-1)[0]+.5,n=lodash.toString(t>16?null:t);e.value=n,e.min=n};this.options.extendSpeedList$.pipe(f(y)).subscribe(s);const o=(0,D.addStyle)(`\n      #${e.id} {\n        font-size: inherit;\n        color: inherit;\n        line-height: inherit;\n        background: transparent;\n        outline: none;\n        width: 100%;\n        border: none;\n        text-align: center;\n        cursor: text;\n      }\n      /* https://stackoverflow.com/a/4298216 */\n      /* Chrome */\n      #${e.id}::-webkit-outer-spin-button,\n      #${e.id}::-webkit-inner-spin-button {\n        -webkit-appearance: none;\n        margin: 0;\n      }\n      /* Firefox */\n      #${e.id}[type=number] {\n        -moz-appearance:textfield;\n      }\n    `),r=lodash.over(l(e,"keydown").pipe(g(200)).subscribe((t=>{let{key:n}=t;if("Enter"!==n)return;const s=parseFloat(e.value);try{if(!lodash.isFinite(s))throw new Error("无效的倍数值");if(s<z)throw new Error("倍数值太小了");if(s>16)throw new Error("倍数值太大了");if(this.speedContext.getAvailableSpeedValues().includes(s))throw new Error("不能重复添加已有的倍数值");this.addSpeedValue(s)}catch(t){(0,i.logError)(String(t),5e3),e.focus(),e.select()}})),l(t,"mouseenter").subscribe((()=>{e.style.display="inline",n.style.display="none",s(),setTimeout((()=>e.focus()))})),l(t,"mouseleave").subscribe((()=>{e.style.display="none",n.style.display="inline"})),(()=>t.remove()),(()=>o.remove()));return{node:t,destroy:r}}createCustomSpeedMenuItemElement(e){const{closeBtn:t,root:n}=J(`\n      <li class="${$(E(L.custom.speedMenuItem.selector))} ${G}" data-value="${e}">\n        ${V(e)}\n        <i data-ref="close-btn" class="mdi mdi-close-circle"></i>\n      </li>\n    `),s=(0,D.addStyle)(`\n      .${G} [data-ref="close-btn"] {\n        color: inherit;\n        opacity: 0.5;\n        display: none;\n        position: absolute;\n        right: 4px;\n      }\n      :is(${L.custom.speedMenuItem.selector}):not(${L.custom.active.selector}):hover [data-ref="close-btn"] {\n        display: inline;\n      }\n      .${G} [data-ref="close-btn"]:hover {\n        opacity: 1;\n        transition: all .3s;\n      }\n    `),i=lodash.over(l(t,"click").subscribe((()=>{this.removeSpeedValue(e)})),(()=>n.remove()),(()=>s.remove()));return{tag:e,node:n,destroy:i}}migrate(){const{options:e}=this.settings,{options:t}=(0,s.getComponentSettings)("rememberVideoSpeed");t.extendList&&(e.extendSpeedList=Array.from(t.extendList),delete t.extendList,delete t.extend,X.Toast.success("从「倍速记忆」组件迁移旧配置成功","【扩展倍速】旧配置迁移完成",8e3))}getSpeedContextMixin(e){let{menuListElement:t}=e;return{query:e=>(0,m.des)(`./*[(${K.speedMenuItemClassName.split(",").map((e=>`contains(@class, "${e}")`)).join(" or ")}) and not(contains(@class, "${_}")) and normalize-space()="${V(e)}"]`,t)}}onSpeedContext(e){let{menuListElementClickSpeedChange$:t,playbackRate$:n}=e;this.options.extendSpeedList$.subscribe({next:e=>this.patch(((e,t)=>{let n=0,s=e.length,i=0,o=t.length;for(;n<s&&i<o&&e[n]===t[i];)n++,i++;for(;n<s&&i<o&&e[s-1]===t[o-1];)s--,o--;return[n,s-n,t.slice(i,o)]})(this.elementMap.map((e=>e.tag)),Array.from(e))),complete:()=>{this.unpatch()}}),this.options.maxMenuHeight$.subscribe(W({name:"extend-video-speed-style",style:e=>`\n                  ${L.custom.speedMenuList.selector} {\n                    display: flex !important; /* 防止3.X样式覆盖 */\n                    flex-direction: column;\n                    overflow-y: auto;\n                    max-height: ${e}px;\n                    visibility: hidden;\n                  }\n                  /* 修复2.X倍速列表显示问题 */\n                  :is(${L.custom.show.selector}) :is(${L.custom.speedMenuList.selector}){\n                    visibility: visible;\n                  }\n                  /* 修复番剧区的列表显示问题 */\n                  :is(${L.custom.speedMenuList.selector})[style*="block"] {\n                    visibility: visible;\n                  }`})),this.options.hideScrollbar$.subscribe(W({name:"extend-video-speed-no-scrollbar-style",style:e=>e&&`\n                ${L.custom.speedMenuList.selector} {\n                  scrollbar-width: none !important;\n                  overscroll-behavior: contain;\n                }\n                :is(${L.custom.speedMenuList.selector})::-webkit-scrollbar {\n                    height: 0 !important;\n                    width: 0 !important;\n                }`})),this.options.hideRemoveBtn$.subscribe(W({name:"extend-video-speed-no-remove-btn-style",style:e=>e&&`\n            .${G} [data-ref="close-btn"] {\n              display: none !important;\n            }\n            :is(${L.custom.speedMenuItem.selector}):not(${L.custom.active.selector}):hover [data-ref="close-btn"] {\n              display: none !important;\n            }`})),this.options.hideAddBtn$.subscribe(W({name:"extend-video-speed-no-add-btn-style",style:e=>e&&`\n          .${_} {\n              display: none !important;\n            }`}));let s=1;n.pipe(x((e=>B.includes(e)))).subscribe((e=>{s=e})),t.subscribe({next:e=>{this.forceVideoSpeedWithUpdateStyle(e),this.currentSpeedValue=e},complete:()=>{this.setVideoSpeed(s),this.forceVideoSpeedWithUpdateStyle(s)}}),this.currentSpeedValue&&requestIdleCallback((()=>{this.setVideoSpeed(this.currentSpeedValue,1e3)}))}async forceVideoSpeedWithUpdateStyle(e){await this.forceVideoSpeed(e),setTimeout((()=>this.forceUpdateStyle(e)))}patch(e){const[t,n,s]=e,{menuListElement:i}=this.speedContext;if(this.inputElement||(this.inputElement=this.createInputElement(),i.prepend(this.inputElement.node)),0===n&&0===s.length)return;const o=s.map((e=>this.createCustomSpeedMenuItemElement(e)));this.elementMap.splice(t,n,...o).forEach((e=>{e.destroy()})),(this.elementMap[t-1]||this.inputElement).node.after(...o.map((e=>e.node)).reverse()),i.querySelectorAll(`:is(${L.custom.speedMenuItem.selector}):not(#${this.inputElement.node.id})`).forEach((e=>{e.style.order=(1e4*(16-M(e.innerHTML))).toString()})),this.unpatch=()=>{this.inputElement.destroy(),this.inputElement=void 0,this.elementMap.forEach((e=>e.destroy())),this.elementMap.length=0}}forceUpdateStyle(e){const{menuListElement:t,containerElement:n,nameBtnElement:s,query:i}=this.speedContext;for(const e of(0,m.dea)(`./*[(${E(K.speedMenuItemClassName).split(",").map((e=>`contains(@class, "${e}")`)).join(" or ")}) and (${E(K.activeClassName).split(",").map((e=>`contains(@class, "${e}")`)).join(" or ")})]`,t))e.classList.remove(...K.activeClassName.split(","));i(e).classList.add(...K.activeClassName.split(",")),n.classList.remove(...K.showClassName.split(",")),s.innerText=V(e,!0)}}const Q=K.create({name:"extendVideoSpeed",displayName:"扩展倍速",author:{name:"JLoeve",link:"https://github.com/LonelySteve"},description:{"zh-CN":"\n\n> 扩展视频播放器的倍速菜单项，可用于突破原有播放倍数的上限或下限.\n\n#### 🔧 **选项**\n\n- `隐藏滚动条`：如果添加的倍速过多，倍速菜单将出现滚动条，在 Windows 下，若没有安装并启用「细滚动条」组件会显得比较挤，建议开启此选项隐藏滚动条.\n\n- `隐藏移除图标`：如果认为倍速右侧的移除倍速图标有些突兀，可以开启此选项隐藏.\n\n- `隐藏新增图标`：如果认为顶部的新增倍速图标有些突兀，可以开启此选项隐藏.\n\n#### **新增倍速**\n\n开启组件后，在默认情况下，播放器的倍速菜单就会新增 2.5x 和 3.0x 两个倍速选项.\n\n如果需要添加更多倍速，只需将鼠标指针移到菜单顶部的新增图标上，图标将变成一个输入框，根据需要键入新的倍速值，或通过滚轮增减数值，或直接使用推荐的数值，回车确认即可.\n\n新增倍速的范围要求在 0.0625 到 16 之间，数量则不受限制.\n\n**不推荐设置超高倍速（>3.0x）**：原生播放器内部没有针对超高倍速进行优化，可能导致音画不同步、播放卡顿、声音嘈杂/消失等一系列问题.\n\n#### **删除倍速**\n\n将鼠标指针移到**自定义**的倍速菜单项上，其右侧将会显示一个移除图标，单击即可删除相应的倍速.\n\n"},tags:[componentsTags.video],urlInclude:n.playerUrls,options:{maxMenuHeight:{displayName:"倍速菜单最大高度",defaultValue:360,hidden:!0,validator:e=>Math.max(parseInt(e),360)||360},hideScrollbar:{displayName:"隐藏滚动条",defaultValue:!1},hideRemoveBtn:{displayName:"隐藏移除图标",defaultValue:!1},hideAddBtn:{displayName:"隐藏新增图标",defaultValue:!1},extendSpeedList:{displayName:"扩展倍速列表",defaultValue:[2.5,3],hidden:!0}},commitHash:"bec07f07c88f7e6f2050ec4bfe797ce74dec45a7",coreVersion:"2.10.0"});return t=t.component})()));
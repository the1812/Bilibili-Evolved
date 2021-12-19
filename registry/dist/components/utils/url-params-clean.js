!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["utils/url-params-clean"]=t():e["utils/url-params-clean"]=t()}(self,(function(){return function(){"use strict";var e,t,r={270:function(e){e.exports=coreApis.lifeCycle},156:function(e){e.exports=coreApis.observer}},o={};function n(e){var t=o[e];if(void 0!==t)return t.exports;var i=o[e]={exports:{}};return r[e](i,i.exports,n),i.exports}t=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__},n.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var i=Object.create(null);n.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&o&&r;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((function(e){a[e]=function(){return r[e]}}));return a.default=function(){return r},n.d(i,a),i},n.d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return function(){n.d(i,{component:function(){return r}});var e=coreApis.pluginApis.data,t=coreApis.utils;const r={name:"urlParamsClean",displayName:"网址参数清理",entry:async()=>{if((0,t.isNotHtml)())return;const[r]=(0,e.registerAndGetData)("urlParamsClean.noClean",["videocard_series"]),[o]=(0,e.registerAndGetData)("urlParamsClean.params",["spm_id_from","from_source","from_spmid","from","seid","share_source","share_medium","share_plat","share_tag","share_session_id","bbid","ts","timestamp","unique_k","rt","tdsourcetag","accept_quality","broadcast_type","current_qn","current_quality","playurl_h264","playurl_h265","quality_description","network","network_status","platform_network_status","p2p_type","referfrom","visit_id","bsource","spm","hotRank"]),[i]=(0,e.registerAndGetData)("urlParamsClean.siteSpecifiedParams",[{match:/\/\/www\.bilibili\.com\/audio\/(au[\d]+|mycollection)/,param:"type"},{match:/\/\/live\.bilibili\.com\//,param:"session_id"},{match:/\/\/www\.bilibili\.com\/bangumi\//,param:"theme"}]),{fullyLoaded:a}=await Promise.resolve().then(n.t.bind(n,270,23)),{urlChange:s}=await Promise.resolve().then(n.t.bind(n,156,23));a((()=>{"text/html"===document.contentType&&s((()=>(()=>{const e=window.location.search.substring(1).split("&");if(e.some((e=>r.some((t=>e.includes(t))))))return;const t=e.filter((e=>!o.some((t=>e.startsWith(`${t}=`)))&&!i.some((({match:t,param:r})=>document.URL.match(t)&&e.startsWith(`${r}=`))))).join("&"),n=document.URL.replace(window.location.search,"")+(t?`?${t}`:"");n!==document.URL&&(console.log("[URL params clean]",document.URL,n),window.history.replaceState({},document.title,n))})()))}))},description:{"zh-CN":"自动删除网址中的多余跟踪参数."},tags:[componentsTags.utils],urlExclude:[/game\.bilibili\.com\/fgo/],commitHash:"6b53bf777c1668967400cd28b7c815867b9cbb38"}}(),i=i.component}()}));
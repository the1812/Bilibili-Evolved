// ==UserScript==
// @name         Bilibili Evolved
// @version      1.10.12
// @description  强大的哔哩哔哩增强脚本: 下载视频, 音乐, 封面, 弹幕 / 简化直播间, 评论区, 首页 / 自定义顶栏, 删除广告, 夜间模式 / 触屏设备支持
// @author       Grant Howard, Coulomb-G
// @copyright    2020, Grant Howard (https://github.com/the1812) & Coulomb-G (https://github.com/Coulomb-G)
// @license      MIT
// @match        *://*.bilibili.com/*
// @exclude      *://api.bilibili.com/*
// @exclude      *://api.*.bilibili.com/*
// @exclude      *://*.bilibili.com/api/*
// @exclude      *://member.bilibili.com/studio/bs-editor/*
// @run-at       document-start
// @updateURL    https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js
// @supportURL   https://github.com/the1812/Bilibili-Evolved/issues
// @homepage     https://github.com/the1812/Bilibili-Evolved
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js
// @icon         https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/images/logo-small.png
// @icon64       https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/images/logo.png
// ==/UserScript==

// GreasyFork 特供版, 只能提示更新到最新版, 没有实际功能
const ToastModule = (()=>{return(t,a)=>{var s;(function(t){t["Default"]="default";t["Info"]="info";t["Success"]="success";t["Error"]="error"})(s||(s={}));let e;class r{constructor(t="",a="",e=s.Default){this.creationTime=new Date;this.type=e;this.message=t;this.title=a;this.duration=3e3;this.randomKey=Math.floor(Math.random()*(Number.MAX_SAFE_INTEGER+1))}show(){r.containerVM.cards.splice(0,0,this);if(this.duration!==undefined){setTimeout(()=>this.dismiss(),this.duration)}}dismiss(){if(r.containerVM.cards.includes(this)){r.containerVM.cards.splice(r.containerVM.cards.indexOf(this),1)}}get element(){return dq(`.toast-card[data-key='${this.key}']`)}get key(){return this.creationTime.toISOString()+`[${this.randomKey}]`}static get containerVM(){if(!e){r.createToastContainer()}return e}static createToastContainer(){if(!document.querySelector(".toast-card-container")){document.body.insertAdjacentHTML("beforeend",`\n<transition-group class="toast-card-container" name="toast-card-container" tag="div">\n<toast-card v-for="card of cards" :data-key="card.key" :key="card.key" :card="card"></toast-card>\n</transition-group>`);e=new Vue({el:".toast-card-container",components:{"toast-card":{props:["card"],template:`\n<div class="toast-card icons-enabled visible" :class="'toast-' + card.type">\n<div class="toast-card-border"></div>\n<div class="toast-card-header">\n<h1 class="toast-card-title">{{card.title}}</h1>\n<div class="toast-card-dismiss" @click="card.dismiss()">\n<svg style="width:22px;height:22px" viewBox="0 0 24 24">\n<path\n d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />\n</svg>\n</div>\n</div>\n<div class="toast-card-message" v-html="card.message"></div>\n</div>\n`}},data:{cards:[]}})}}static internalShow(t,a,s,e){const n=new r(t,a,e);n.duration=s;n.show();return n}static show(t,a,e){return this.internalShow(t,a,e,s.Default)}static info(t,a,e){return this.internalShow(t,a,e,s.Info)}static success(t,a,e){return this.internalShow(t,a,e,s.Success)}static error(t,a,e){return this.internalShow(t,a,e,s.Error)}}a.applyStyle("toastStyle");return{export:r}}})()
const ToastStyle = `.toast-card-container{--corner-radius:4px;--card-min-width:240px;--card-min-width-negative:-240px;position:fixed;left:0;bottom:0;display:flex;flex-direction:column-reverse;align-items:start;padding-left:16px;z-index:100001;pointer-events:none;overflow:hidden;width:100%;height:100%;transition:.2s ease-out}.toast-card-container *{pointer-events:initial;transition:.2s ease-out}.toast-card.toast-card-container-enter,.toast-card.toast-card-container-leave-to{opacity:0;transform:translateX(var(--card-min-width-negative))}.toast-card{background:#fff;min-width:var(--card-min-width);max-width:60vw;min-height:96px;margin:8px 0;box-shadow:rgba(0,0,0,.2) 0 4px 8px 0;transform-origin:left;overflow:hidden;display:flex;flex-direction:column;border-left-style:solid;transition:.3s cubic-bezier(.18,.89,.32,1.28);position:relative;border-left-width:0;padding-left:var(--corner-radius);border-radius:var(--corner-radius)}.toast-card.toast-card-container-leave-active{position:absolute;transition:.3s cubic-bezier(.6,-.28,.74,.05)}.toast-card-header{display:flex;align-items:center}.toast-card-title{font-size:18px;color:#000;opacity:.5;margin:16px;font-weight:700;flex:1 1 auto}.toast-card-dismiss{height:24px;width:24px;flex:0 0 auto;padding:16px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:.2s ease-out;transform-origin:center;opacity:.5;box-sizing:content-box}.toast-card-dismiss:hover{transform:scale(1.2)}.toast-card-dismiss:active{transform:scale(1.1)}.toast-card-message{color:#000;font-size:14px;margin:0 16px 16px;white-space:pre-wrap;display:flex;align-items:center;line-height:1.5;flex-wrap:wrap;word-break:break-all;max-height:200px;overflow:auto}.toast-card.toast-default{border-left-color:#444}.toast-card.toast-error{border-left-color:#f44336}.toast-card.toast-info{border-left-color:#2196f3}.toast-card.toast-success{border-left-color:#8bc34a}.toast-card .toast-card-border{position:absolute;height:100%;width:4px;border-radius:var(--corner-radius);height:calc(100% - 10px);width:var(--corner-radius);top:5px;left:0}.toast-card.toast-default .toast-card-border{background-color:#444}.toast-card.toast-error .toast-card-border{background-color:#f44336}.toast-card.toast-info .toast-card-border{background-color:#2196f3}.toast-card.toast-success .toast-card-border{background-color:#8bc34a}.toast-card .link,.toast-card span{display:inline-block;padding:4px 6px;margin:0 2px;background-color:#8882;text-decoration:none;color:#000;transition:.2s ease-out;border-radius:var(--corner-radius)}.toast-card .link:hover{background-color:#8883}.toast-card .link:active{background-color:#8884}.toast-card .download-link,.toast-card .download-link:hover{color:inherit!important;text-decoration:underline;word-break:break-all}@keyframes loading{0%,100%{top:0;left:50%}25%{top:50%;left:100%}50%{top:100%;left:50%}75%{top:50%;left:0}}.toast-card .loading{width:14px;height:14px;display:inline-block;margin-right:14px;position:relative}.toast-card .loading::after{content:"";width:10px;height:10px;background-color:#8884;border-radius:50%;display:block;transform:translateX(-50%) translateY(-50%);position:absolute;top:0;left:50%;animation:1s cubic-bezier(.22,.61,.36,1) infinite loading}`
const manager = [undefined, {
  applyStyle: () => {
    if (document.querySelector('#toast-style')) {
      return
    }
    document.head.insertAdjacentHTML('beforeend', `<style id="toast-style">${ToastStyle}</style>`)
  }
}]
document.addEventListener('DOMContentLoaded', () => {
  const { export: Toast } = ToastModule(...manager)
  Toast.info(`当前安装版本过低, 请更新后使用. <a class="link" href="https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js">更新</a>`, 'Bilibili Evolved')
})

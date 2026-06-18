import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcPath = 'C:/Users/xianyu/Downloads/scripts/Bilibili_Danmaku_Merger.js'
const outPath = path.join(__dirname, 'merger-runtime.ts')

let body = fs.readFileSync(srcPath, 'utf8')
body = body.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\r?\n\r?\n/, '')
body = body.replace(/^\(function \(\) \{\r?\n    'use strict';\r?\n\r?\n/, '')
body = body.replace(/\r?\n\}\)\(\);\s*$/, '')
body = body.replace(
  /const pageWin = \(\) => \(typeof unsafeWindow !== 'undefined' \? unsafeWindow : window\);/,
  'const pageWin = () => unsafeWindow',
)
body = body.replace(/dmLog\('v1\.6 已加载', location\.href\);\r?\n\r?\n/, '')
body = body.replace(/    const dmLog = \(\.\.\.args\) => console\.log\('\[弹幕合并器\]', \.\.\.args\);\r?\n    const dmWarn = \(\.\.\.args\) => console\.warn\('\[弹幕合并器\]', \.\.\.args\);\r?\n/, '')
body = body.replace(
  /    injectPageBridge\(\);\r?\n    document\.addEventListener\('DOMContentLoaded',[\s\S]*?\}\);\r?\n\r?\n/,
  '',
)
body = body.replace(/    const boot = \(\) => init\(\);[\s\S]*$/, '')

const header = `/* eslint-disable */
// @ts-nocheck
import { useScopedConsole } from '@/core/utils/log'

const console = useScopedConsole('弹幕合并器')
const dmLog = (...args: unknown[]) => console.log(...args)
const dmWarn = (...args: unknown[]) => console.warn(...args)

export type MergerCleanup = () => void

export const initDanmakuMerger = (): MergerCleanup => {
`

const footer = `
  injectPageBridge()
  document.addEventListener('DOMContentLoaded', () => {
    if (!pageWin().__dmMergerBridge) {
      dmWarn('DOM 就绪后补注页面桥接')
      injectPageBridge()
    }
  })
  init()
  return () => {
    engine.reset()
    const btn = document.getElementById('dm-merger-btn')
    if (btn) btn.remove()
    document.querySelectorAll('.dm-quick-merge-btn').forEach(el => el.remove())
    const mask = document.getElementById('dm-merger-mask')
    if (mask) mask.remove()
    const mgr = document.getElementById('dm-manager-mask')
    if (mgr) mgr.remove()
    const toast = document.getElementById('dm-merger-toast')
    if (toast) toast.remove()
  }
}
`

const content = (header + body + footer).replace(/\n/g, '\r\n')
fs.writeFileSync(outPath, content, 'utf8')
console.log('written', outPath, (header + body + footer).length, 'chars')
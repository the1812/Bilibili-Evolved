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
body = body.replace(
  /    const dmLog = \(\.\.\.args\) => console\.log\('\[弹幕合并器\]', \.\.\.args\);\r?\n    const dmWarn = \(\.\.\.args\) => console\.warn\('\[弹幕合并器\]', \.\.\.args\);\r?\n/,
  '',
)
body = body.replace(
  /    injectPageBridge\(\);\r?\n    document\.addEventListener\('DOMContentLoaded',[\s\S]*?\}\);\r?\n\r?\n/,
  '',
)
body = body.replace(/    const boot = \(\) => init\(\);[\s\S]*$/, '')

// Bilibili Evolved 无 GM_addStyle / GM_listValues，改用 BE API 与自建索引
body = body.replace(/GM_addStyle\((`[\s\S]*?`)\);/, "addStyle($1, 'danmakuMerger');")
body = body.replace(
  /const allKeys = GM_listValues\(\);\s*\r?\n\s*const dmKeys = allKeys\.filter/,
  'const dmKeys = listMergerStorageKeys().filter',
)
body = body.replace(
  /GM_setValue\(key, JSON\.stringify\(sourcesMeta\)\);/,
  "GM_setValue(key, JSON.stringify(sourcesMeta));\n            trackMergerStorageKey(key);",
)
body = body.replace(
  /GM_setValue\(getPartModeStorageKey\(bvid\), JSON\.stringify\(state\)\);/,
  "GM_setValue(getPartModeStorageKey(bvid), JSON.stringify(state));\n            trackMergerStorageKey(getPartModeStorageKey(bvid));",
)
body = body.replace(/GM_registerMenuCommand\(/g, 'registerMergerMenu(')

const header = `/* eslint-disable */
// @ts-nocheck
import { addStyle, removeStyle } from '@/core/style'
import { useScopedConsole } from '@/core/utils/log'

const DM_MERGER_STYLE_NAME = 'danmakuMerger'
const DM_MERGER_KEYS_INDEX = 'dm_merger_keys_index'

const trackMergerStorageKey = key => {
  try {
    const keys = JSON.parse(String(GM_getValue(DM_MERGER_KEYS_INDEX, '[]')))
    if (!keys.includes(key)) {
      keys.push(key)
      GM_setValue(DM_MERGER_KEYS_INDEX, JSON.stringify(keys))
    }
  } catch (e) { /* ignore */ }
}

const listMergerStorageKeys = () => {
  try {
    return JSON.parse(String(GM_getValue(DM_MERGER_KEYS_INDEX, '[]')))
  } catch (e) {
    return []
  }
}

const console = useScopedConsole('弹幕合并器')
const dmLog = (...args) => console.log(...args)
const dmWarn = (...args) => console.warn(...args)

export type MergerCleanup = () => void

const bindMonkeyApisFromBe = () => {
  const host = (
    typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis
  )
  const monkey = host.bilibiliEvolved?.monkeyApis
  if (!monkey) return
  const g = globalThis
  for (const [name, fn] of Object.entries(monkey)) {
    if (typeof fn === 'function' && typeof g[name] !== 'function') {
      g[name] = fn
    }
  }
}

export const initDanmakuMerger = (): MergerCleanup => {
  bindMonkeyApisFromBe()
  dmLog('BE 组件版 v1.6 已加载（addStyle）')
  const menuCommandIds = []
  const registerMergerMenu = (name, fn) => {
    if (typeof GM_registerMenuCommand !== 'function') {
      dmWarn('GM_registerMenuCommand 不可用，跳过菜单项:', name)
      return
    }
    menuCommandIds.push(GM_registerMenuCommand(name, fn))
  }
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
    removeStyle(DM_MERGER_STYLE_NAME)
    if (typeof GM_unregisterMenuCommand === 'function') {
      menuCommandIds.forEach(id => GM_unregisterMenuCommand(id))
    }
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
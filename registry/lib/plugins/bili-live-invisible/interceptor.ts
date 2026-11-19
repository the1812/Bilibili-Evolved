/**
 * B站直播「隐身观看」拦截核心 —— 自独立 userscript 版 (v2.1.0) 移植。
 * 仓库: https://github.com/xly2333/bili-live-invisible
 *
 * 两层能力：
 *  1. 上报拦截：屏蔽统计/埋点/追踪请求（规则经两版真实抓包实测，遥测 26/26、误伤 0）
 *  2. 身份字段改写（语义对齐 lzghzr/BiliLiveInvisible Xposed 模块）：
 *     R1 集合含 is_anchor | hb | heart_beat → 删 access_key
 *     R2 集合含 not_mock_enter_effect → room_id → "273022"（replace 语义，仅当键已存在）
 *     R3 集合含 uid 且含 group        → uid → 0
 *
 * 覆盖 fetch / XMLHttpRequest / navigator.sendBeacon / WebSocket 四个通道
 * （含弹幕协议二进制帧），每个通道均有兜底安全网：改写逻辑异常时回落原生行为。
 */

const R1_TRIGGERS = ['is_anchor', 'hb', 'heart_beat']
const R2_TRIGGER = 'not_mock_enter_effect'
const R3_KEY = 'uid'
const R3_GATE = 'group'
const TARGET_ROOM_ID = '273022'

const DEBUG = false
const log = (...args: unknown[]) => {
  if (DEBUG) console.info('[bili-live-invisible]', ...args)
}

interface RewriteOps {
  has: (k: string) => boolean
  del: (k: string) => void
  set: (k: string, v: unknown) => void
  tag: string
}

function applyRewrites({ has, del, set, tag }: RewriteOps): string[] {
  const hits: string[] = []

  // R1: 含 is_anchor / hb / heart_beat → 删 access_key
  const trigger = R1_TRIGGERS.find(k => has(k))
  if (trigger && has('access_key')) {
    del('access_key')
    hits.push(`R1(${trigger})`)
  }

  // R2: 含 not_mock_enter_effect → room_id = 273022（仅当 room_id 已存在，replace 语义）
  if (has(R2_TRIGGER) && has('room_id')) {
    set('room_id', TARGET_ROOM_ID)
    hits.push('R2')
  }

  // R3: 含 uid 且含 group → uid = 0
  if (has(R3_KEY) && has(R3_GATE)) {
    set(R3_KEY, 0)
    hits.push('R3')
  }

  if (hits.length) {
    log(tag, hits.join('+'))
  }
  return hits
}

function rewriteUrl(rawUrl: string): string {
  let u: URL
  try {
    u = new URL(rawUrl, location.href)
  } catch (_) {
    return rawUrl
  }
  const sp = u.searchParams
  if ([...sp.keys()].length === 0) {
    return rawUrl
  }
  const hits = applyRewrites({
    has: k => sp.has(k),
    del: k => sp.delete(k),
    set: (k, v) => sp.set(k, String(v)),
    tag: 'url ' + u.pathname,
  })
  return hits.length ? u.toString() : rawUrl
}

function rewriteJsonText(text: string): string | null {
  let obj: Record<string, unknown> | null = null
  try {
    obj = JSON.parse(text) as Record<string, unknown>
  } catch (_) {
    return null
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return null
  }
  const hits = applyRewrites({
    has: k => Object.prototype.hasOwnProperty.call(obj, k),
    del: k => {
      delete obj![k]
    },
    set: (k, v) => {
      obj![k] = v
    },
    tag: 'json',
  })
  return hits.length ? JSON.stringify(obj) : null
}

function rewriteFormText(text: string): string | null {
  if (!/^[^=&\s]+=/.test(text)) {
    return null
  }
  let sp: URLSearchParams
  try {
    sp = new URLSearchParams(text)
  } catch (_) {
    return null
  }
  if ([...sp.keys()].length === 0) {
    return null
  }
  const hits = applyRewrites({
    has: k => sp.has(k),
    del: k => sp.delete(k),
    set: (k, v) => sp.set(k, String(v)),
    tag: 'form',
  })
  return hits.length ? sp.toString() : null
}

/** 返回改写后的 body；无需改写则返回 null */
function rewriteBody(body: unknown): BodyInit | null {
  if (body == null) {
    return null
  }
  if (typeof body === 'string') {
    return rewriteJsonText(body) || rewriteFormText(body)
  }
  if (body instanceof URLSearchParams) {
    const hits = applyRewrites({
      has: k => body.has(k),
      del: k => body.delete(k),
      set: (k, v) => body.set(k, String(v)),
      tag: 'urlsearchparams',
    })
    return hits.length ? body : null
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const hits = applyRewrites({
      has: k => body.has(k),
      del: k => body.delete(k),
      set: (k, v) => body.set(k, String(v)),
      tag: 'formdata',
    })
    return hits.length ? body : null
  }
  return null
}

// ══════════════════════════════════════════════════════════
// 上报拦截规则（实测口径：367 条真实 HAR，遥测 26/26，误伤 0）
// ══════════════════════════════════════════════════════════

const STATIC_ASSET = /\.(js|css|png|jpe?g|gif|webp|svg|ico|ttf|woff2?|eot|svga|mp4|m4s|m3u8|wasm|map)(\?|#|$)/i

interface BlockRule {
  name: string
  test: (u: string) => boolean
}

const RULES: BlockRule[] = [
  { name: 'bili-data-log', test: u => /^https?:\/\/data\.bilibili\.com\//.test(u) },
  { name: 'bilivideo-data-log', test: u => /^https?:\/\/data\.bilivideo\.com\//.test(u) },
  { name: 'live-trace', test: u => /^https?:\/\/live-trace\.bilibili\.com\//.test(u) },
  { name: 'tracker-conf', test: u => /^https?:\/\/api\.live\.bilibili\.com\/xlive\/open-interface\/v2\/tracker\//.test(u) },
  { name: 'rum-collect', test: u => /^https?:\/\/rumt-zh\.com\/collect\//.test(u) },
  { name: 'third-party-log', test: u => /^https?:\/\/nlog\.daxuesoutijiang\.com\//.test(u) },
  { name: 'hdslb-log', test: u => /^https?:\/\/[^/]*hdslb\.com\/.*\/log\//i.test(u) && !STATIC_ASSET.test(u) },
  { name: 'x-report', test: u => /^https?:\/\/api\.live\.bilibili\.com\/.*\/report/i.test(u) },
  { name: 'msg-report', test: u => /MsgReport/i.test(u) },
  { name: 'heartbeat-http', test: u => /\/heart[_/]?beat/i.test(u) },
]

const blockedRule = (url: string): BlockRule | undefined => {
  const u = String(url)
  const r = RULES.find(x => x.test(u))
  if (r) {
    log('blocked', r.name, u)
  }
  return r
}

const emptyOk = (): Response => new Response('{"code":0}', {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
})

/** 安装四通道拦截（幂等安全：所有改写均有 try/catch 回落） */
export function installBiliLiveInvisible(): void {
  // ── fetch ──
  const rawFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      let url = ''
      let body: unknown = null
      let isRequest = false

      if (typeof input === 'string') {
        url = input
        body = init && init.body
      } else if (input && typeof input === 'object') {
        url = (input as Request).url || ''
        isRequest = input instanceof Request
        body = init && init.body
      }

      // 1) 拦截上报（优先于改写：被拦的请求整条丢弃）
      if (blockedRule(url)) {
        return emptyOk()
      }

      // 2) 改写
      const newUrl = rewriteUrl(url)
      const newBody = rewriteBody(body)
      const urlChanged = newUrl !== url
      const bodyChanged = newBody !== null

      // Request 对象的 body 在对象自身上，必须进入异步分支才检查得到
      if (!urlChanged && !bodyChanged && !isRequest) {
        return rawFetch(input, init)
      }

      // 3) Request 对象：异步读 body，只对 JSON 形态改写（防二进制被毁），其余原样放行
      if (isRequest) {
        const req = input as Request
        const method = String(req.method || 'GET').toUpperCase()
        if (method === 'GET' || method === 'HEAD') {
          if (!urlChanged) {
            return rawFetch(req, init)
          }
          const cloned = new Request(newUrl, {
            method: req.method,
            headers: req.headers,
            mode: req.mode,
            credentials: req.credentials,
            cache: req.cache,
            redirect: req.redirect,
            referrer: req.referrer,
            integrity: req.integrity,
          })
          return rawFetch(cloned, init)
        }
        let bodyText: string | null = null
        let readFailed = false
        try {
          bodyText = await req.clone().text()
        } catch (_) {
          readFailed = true
        }
        if (readFailed) {
          return rawFetch(req, init)
        }
        const rewritten = bodyText ? rewriteJsonText(bodyText) : null
        const isJsonText = !!bodyText && /^\s*[[{]/.test(bodyText)
        if (!urlChanged && rewritten === null) {
          return rawFetch(req, init)
        }
        if (!isJsonText) {
          return rawFetch(req, init)
        }
        const cloned = new Request(newUrl, {
          method: req.method,
          headers: req.headers,
          body: rewritten !== null ? rewritten : bodyText,
          mode: req.mode,
          credentials: req.credentials,
          cache: req.cache,
          redirect: req.redirect,
          referrer: req.referrer,
          integrity: req.integrity,
        })
        return rawFetch(cloned, init)
      }

      const nextInit: RequestInit = Object.assign({}, init || {})
      if (bodyChanged) {
        nextInit.body = newBody as BodyInit
      }
      return rawFetch(newUrl, nextInit)
    } catch (e) {
      log('fetch fallback', e)
      return rawFetch(input, init)
    }
  }

  // ── XMLHttpRequest ──
  const XHR = window.XMLHttpRequest
  if (XHR) {
    const rawOpen = XHR.prototype.open
    const rawSend = XHR.prototype.send

    XHR.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
      try {
        this.__biliRawUrl = String(url)
        const args = [method, rewriteUrl(this.__biliRawUrl), ...rest] as Parameters<typeof rawOpen>
        return rawOpen.apply(this, args)
      } catch (e) {
        log('xhr.open fallback', e)
        return rawOpen.apply(this, [method, url, ...rest] as Parameters<typeof rawOpen>)
      }
    }

    XHR.prototype.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
      try {
        if (blockedRule(this.__biliRawUrl || '')) {
          const xhr = this
          setTimeout(() => {
            const text = '{"code":0}'
            Object.defineProperties(xhr, {
              readyState: { value: 4, configurable: true },
              status: { value: 200, configurable: true },
              statusText: { value: 'OK', configurable: true },
              responseText: { value: text, configurable: true },
              response: { value: text, configurable: true },
            })
            xhr.dispatchEvent(new Event('readystatechange'))
            xhr.dispatchEvent(new Event('load'))
            xhr.dispatchEvent(new Event('loadend'))
          }, 0)
          return
        }
        let newBody: BodyInit | null = null
        try {
          newBody = rewriteBody(body)
        } catch (_) {
          newBody = null
        }
        if (newBody === null) {
          return rawSend.call(this, body)
        }
        return rawSend.call(this, newBody)
      } catch (e) {
        log('xhr.send fallback', e)
        return rawSend.call(this, body)
      }
    }
  }

  // ── navigator.sendBeacon ──
  if (navigator.sendBeacon) {
    const rawBeacon = navigator.sendBeacon.bind(navigator)
    navigator.sendBeacon = (url: string | URL, data?: BodyInit | null): boolean => {
      try {
        if (blockedRule(String(url))) {
          return true
        }
        const newUrl = rewriteUrl(String(url))
        let newBody: BodyInit | null = null
        try {
          newBody = rewriteBody(data)
        } catch (_) {
          newBody = null
        }
        return rawBeacon(newUrl, newBody === null ? data : newBody)
      } catch (e) {
        log('beacon fallback', e)
        return rawBeacon(url, data)
      }
    }
  }

  // ── WebSocket：改写鉴权/心跳帧 ──
  const RawWS = window.WebSocket
  if (RawWS) {
    // 二进制字符串 → 字节；含 >0xFF 码元则不是二进制字符串
    const strToBytes = (s: string): Uint8Array | null => {
      const out = new Uint8Array(s.length)
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i)
        if (c > 0xff) {
          return null
        }
        out[i] = c
      }
      return out
    }

    const rewriteFrame = (data: unknown): string | Uint8Array | null => {
      try {
        // ① 纯 JSON 字符串帧
        if (typeof data === 'string') {
          const asJson = rewriteJsonText(data)
          if (asJson !== null) {
            return asJson
          }
        }

        // ② 统一转字节视图
        let bytes: Uint8Array | null = null
        if (typeof data === 'string') {
          if (data.length > 16) {
            bytes = strToBytes(data)
          }
        } else if (data && typeof (data as ArrayBuffer).byteLength === 'number' && typeof (data as ArrayBuffer).slice === 'function') {
          bytes = new Uint8Array(data as ArrayBuffer)
        } else if (ArrayBuffer.isView(data)) {
          const v = data as ArrayBufferView
          bytes = new Uint8Array(v.buffer, v.byteOffset, v.byteLength)
        }
        if (!bytes || bytes.length <= 16) {
          return null
        }

        const td = new TextDecoder('utf-8')
        const enc = new TextEncoder()

        // ③ 弹幕协议帧：偏移 16 起 JSON → 改写 + 重写包头总长（大端）
        const newBody = rewriteJsonText(td.decode(bytes.subarray(16)))
        if (newBody !== null) {
          const bodyBytes = enc.encode(newBody)
          const out = new Uint8Array(16 + bodyBytes.length)
          out.set(bytes.subarray(0, 16))
          new DataView(out.buffer).setUint32(0, out.length, false)
          out.set(bodyBytes, 16)
          log('ws danmu frame rewritten', newBody.slice(0, 80))
          return out
        }

        // ④ 整帧是 JSON 的字节形态
        const wholeNew = rewriteJsonText(td.decode(bytes))
        if (wholeNew !== null) {
          return enc.encode(wholeNew)
        }
        return null
      } catch (e) {
        log('ws frame error', e)
        return null
      }
    }

    const Wrapped = function (this: unknown, url: string | URL, protocols?: string | string[]) {
      const ws = protocols === undefined ? new RawWS(url) : new RawWS(url, protocols)
      const rawSend = ws.send.bind(ws)
      ws.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView): void => {
        let next: string | Uint8Array | null = null
        try {
          next = rewriteFrame(data)
        } catch (_) {
          next = null
        }
        rawSend((next === null ? data : next) as string)
      }
      return ws
    } as unknown as typeof WebSocket
    Wrapped.prototype = RawWS.prototype
    Wrapped.CONNECTING = RawWS.CONNECTING
    Wrapped.OPEN = RawWS.OPEN
    Wrapped.CLOSING = RawWS.CLOSING
    Wrapped.CLOSED = RawWS.CLOSED
    window.WebSocket = Wrapped
  }
}

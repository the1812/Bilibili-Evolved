import { createSignedUrl, NativeFetch, resetWbiKeys, warmupWbiKeys } from './wbi'

const filterAttr = 'data-be-free-video-filter'
const activeClass = 'radio-filter__item--active'
const apiPath = '/x/space/wbi/arc/search'
const paginationPageSize = 42
const pageLabelAttr = 'data-be-free-page-label'

type JsonRecord = Record<string, any>
type Context = {
  baseUrl: string
  baseParams: Record<string, string>
  pageSize: number
  rawPages: Map<number, JsonRecord>
  freeItems: JsonRecord[]
  nextRawPage: number
  rawDone: boolean
  allCount: number | null
  chargeCount: number | null
  freeCount: number | null
  templateJson: JsonRecord | null
  chain: Promise<void>
  prefetching: Set<number>
}

let observer: MutationObserver | null = null
let freeMode = false
let leavingFreeMode = false
let internalClick = false
let transitioning = false
let syntheticChargingRequests = 0
let internalPaginationJump = false
let paginationProjectionFrame = 0
let freeCurrentPage = 1
let freeTotalCount: number | null = null
let freeResponseVersion = 0
let chargingRequestVersion = 0
let allRequestVersion = 0
let currentSpaceKey: string | null = null
let originalFetch: typeof fetch | null = null
let nativeFetch: NativeFetch | null = null
let patchedFetch: typeof fetch | null = null
let knownAllCount: number | null = null
let knownChargeCount: number | null = null
let lastRawJson: JsonRecord | null = null

const contexts = new Map<string, Context>()
const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const isFreeVisualMode = () => freeMode || leavingFreeMode

const parseRequestUrl = (input: RequestInfo | URL) => {
  const raw = typeof input === 'string' || input instanceof URL ? String(input) : input?.url ?? ''
  try {
    return new URL(raw, location.href)
  } catch {
    return null
  }
}

const getBaseParams = (url: URL) => {
  const params: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    if (key !== 'w_rid' && key !== 'wts') {
      params[key] = value
    }
  })
  return params
}

const getContextKey = (url: URL, pageSize: number) => {
  const ignored = new Set(['w_rid', 'wts', 'pn', 'ps', 'special_type', 'index'])
  const entries: [string, string][] = []
  url.searchParams.forEach((value, key) => {
    if (!ignored.has(key)) {
      entries.push([key, value])
    }
  })
  entries.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]))
  return `${JSON.stringify(entries)}|ps=${pageSize}`
}

const getContext = (url: URL, pageSize: number) => {
  const key = getContextKey(url, pageSize)
  let context = contexts.get(key)
  if (!context) {
    if (contexts.size >= 8) {
      const oldestKey = contexts.keys().next().value
      if (oldestKey) {
        contexts.delete(oldestKey)
      }
    }
    context = {
      baseUrl: url.origin + url.pathname,
      baseParams: getBaseParams(url),
      pageSize,
      rawPages: new Map(),
      freeItems: [],
      nextRawPage: 1,
      rawDone: false,
      allCount: null,
      chargeCount: null,
      freeCount: null,
      templateJson: null,
      chain: Promise.resolve(),
      prefetching: new Set(),
    }
    contexts.set(key, context)
  } else {
    context.baseParams = getBaseParams(url)
  }
  return context
}

const resetContext = (context: Context) => {
  context.rawPages.clear()
  context.freeItems = []
  context.nextRawPage = 1
  context.rawDone = false
  context.allCount = null
  context.chargeCount = null
  context.freeCount = null
  context.templateJson = null
  context.chain = Promise.resolve()
  context.prefetching.clear()
}

const cacheRawJson = (context: Context, pageNumber: number, json: JsonRecord) => {
  const count = Math.max(0, Number(json?.data?.page?.count) || 0)
  if (context.allCount !== null && context.allCount !== count) {
    resetContext(context)
  }
  context.allCount = count
  context.rawPages.set(pageNumber, cloneJson(json))
  if (!context.templateJson || pageNumber === 1) {
    context.templateJson = cloneJson(json)
  }
  knownAllCount = count
  lastRawJson = cloneJson(json)
}

const fetchRawPage = async (context: Context, pageNumber: number) => {
  const cached = context.rawPages.get(pageNumber)
  if (cached) {
    return cached
  }
  if (!nativeFetch) {
    throw new Error('fetch 未初始化')
  }
  const url = await createSignedUrl(nativeFetch, context.baseUrl, context.baseParams, {
    pn: String(pageNumber),
    ps: String(context.pageSize),
    special_type: '',
  })
  const response = await nativeFetch(url, { credentials: 'include' })
  const json = await response.json()
  if (!json || json.code !== 0 || !json.data) {
    throw new Error(`获取投稿列表失败: ${json?.code ?? 'unknown'} ${json?.message ?? ''}`)
  }
  cacheRawJson(context, pageNumber, json)
  return json
}

const getFilterRow = () => document.querySelector<HTMLElement>('.video-type-filter')
const getNativeItems = (row: Element) =>
  Array.from(row.querySelectorAll<HTMLElement>(`.radio-filter__item:not([${filterAttr}])`))
const getAllItem = (row: Element) =>
  getNativeItems(row).find(item => (item.textContent ?? '').trim().startsWith('全部类型')) ?? null
const getChargeItem = (row: Element) =>
  getNativeItems(row).find(item => (item.textContent ?? '').includes('充电专属')) ?? null
const getCount = (item: Element | null) => {
  const match = (item?.textContent ?? '').replace(/,/g, '').match(/(\d+)\s*$/)
  return match ? Number.parseInt(match[1], 10) : null
}

const readCountsFromDom = () => {
  const row = getFilterRow()
  if (!row) {
    return
  }
  const all = getCount(getAllItem(row))
  const charge = getCount(getChargeItem(row))
  if (all !== null) {
    knownAllCount = all
  }
  if (charge !== null) {
    knownChargeCount = charge
  }
}

const resolveChargeCount = async (context: Context) => {
  if (context.chargeCount !== null) {
    return context.chargeCount
  }
  if (!nativeFetch) {
    throw new Error('fetch 未初始化')
  }
  const url = await createSignedUrl(nativeFetch, context.baseUrl, context.baseParams, {
    pn: '1',
    ps: '1',
    special_type: 'charging',
  })
  const response = await nativeFetch(url, { credentials: 'include' })
  const json = await response.json()
  if (!json || json.code !== 0 || !json.data) {
    throw new Error(`获取充电专属数量失败: ${json?.code ?? 'unknown'} ${json?.message ?? ''}`)
  }
  const chargeCount = Math.max(0, Number(json.data?.page?.count) || 0)
  context.chargeCount = chargeCount
  knownChargeCount = chargeCount
  return chargeCount
}

const ensureFreeItems = async (context: Context, targetEnd: number) => {
  while (context.freeItems.length < targetEnd && !context.rawDone) {
    const rawPageNumber = context.nextRawPage
    const json = await fetchRawPage(context, rawPageNumber)
    const items = Array.isArray(json?.data?.list?.vlist) ? json.data.list.vlist : []
    for (const item of items) {
      if (!item?.is_charging_arc) {
        context.freeItems.push(item)
      }
    }
    if (
      items.length < context.pageSize ||
      rawPageNumber * context.pageSize >= (context.allCount ?? 0)
    ) {
      context.rawDone = true
    }
    context.nextRawPage += 1
  }
}

const prefetchNextRawPage = (context: Context) => {
  if (context.rawDone || context.allCount === null) {
    return
  }
  const pageNumber = context.nextRawPage
  if ((pageNumber - 1) * context.pageSize >= context.allCount) {
    return
  }
  if (context.rawPages.has(pageNumber) || context.prefetching.has(pageNumber)) {
    return
  }
  context.prefetching.add(pageNumber)
  fetchRawPage(context, pageNumber)
    .catch(() => {})
    .finally(() => context.prefetching.delete(pageNumber))
}

const responseFromJson = (templateResponse: Response, json: JsonRecord) => {
  const headers = new Headers(templateResponse.headers)
  headers.delete('content-length')
  headers.delete('content-encoding')
  headers.set('content-type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(json), {
    status: templateResponse.status || 200,
    statusText: templateResponse.statusText || 'OK',
    headers,
  })
}

const syntheticResponse = (json: JsonRecord) =>
  new Response(JSON.stringify(json), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })

const getFreeTotalPages = () =>
  freeTotalCount === null ? 0 : Math.ceil(freeTotalCount / paginationPageSize)

type ProjectedPage = {
  text: string
  to: number
}

const getProjectedPages = (currentPage: number, totalPage: number): ProjectedPage[] => {
  const maxVisiblePages = 9
  const pages: ProjectedPage[] = []
  if (totalPage <= maxVisiblePages) {
    for (let i = 1; i <= totalPage; i++) {
      pages.push({ text: String(i), to: i })
    }
    return pages
  }

  const halfVisiblePages = Math.floor(maxVisiblePages / 2)
  pages.push({ text: '1', to: 1 })
  let startPage: number
  let endPage: number

  if (currentPage <= halfVisiblePages + 1) {
    startPage = 2
    endPage = maxVisiblePages - 2
    for (let i = startPage; i <= endPage; i++) {
      pages.push({ text: String(i), to: i })
    }
    pages.push({ text: '...', to: Math.min(totalPage, currentPage + 5) })
    pages.push({ text: String(totalPage), to: totalPage })
    return pages
  }

  if (currentPage >= totalPage - halfVisiblePages) {
    pages.push({ text: '...', to: Math.max(1, currentPage - 5) })
    startPage = totalPage - (maxVisiblePages - 3)
    endPage = totalPage - 1
    for (let i = startPage; i <= endPage; i++) {
      pages.push({ text: String(i), to: i })
    }
    pages.push({ text: String(totalPage), to: totalPage })
    return pages
  }

  pages.push({ text: '...', to: Math.max(1, currentPage - 5) })
  startPage = currentPage - Math.floor((maxVisiblePages - 4) / 2)
  endPage = currentPage + Math.floor((maxVisiblePages - 4) / 2)
  for (let i = startPage; i <= endPage; i++) {
    pages.push({ text: String(i), to: i })
  }
  pages.push({ text: '...', to: Math.min(totalPage, currentPage + 5) })
  pages.push({ text: String(totalPage), to: totalPage })
  return pages
}

const getNativePagination = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.video-pagination, .vui_pagenation')).find(
    element =>
      Boolean(
        (element.querySelector('.vui_pagenation--btn-num') ||
          element.querySelector('.vui_pagenation--btn-more')) &&
          element.querySelector('.vui_pagenation-go'),
      ),
  ) ?? null
const getNativePageSlots = (root: Element) =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      '.vui_pagenation--btn-num, .vui_pagenation--btn-more',
    ),
  )
const getNativeSideButtons = (root: Element) =>
  Array.from(root.querySelectorAll<HTMLButtonElement>('.vui_pagenation--btn-side'))

const schedulePaginationProjection = () => {
  if (!freeMode) {
    return
  }
  if (paginationProjectionFrame) {
    cancelAnimationFrame(paginationProjectionFrame)
  }
  paginationProjectionFrame = requestAnimationFrame(() => {
    paginationProjectionFrame = 0
    projectNativePagination()
  })
}

const projectNativePagination = () => {
  if (!freeMode || freeTotalCount === null) {
    return
  }
  const root = getNativePagination()
  if (!root) {
    return
  }
  const totalPages = getFreeTotalPages()
  if (totalPages <= 0) {
    return
  }
  const currentPage = Math.min(Math.max(1, freeCurrentPage), totalPages)
  const projectedPages = getProjectedPages(currentPage, totalPages)
  const pageSlots = getNativePageSlots(root)

  pageSlots.forEach((button, index) => {
    const projected = projectedPages[index]
    if (!projected) {
      button.style.display = 'none'
      button.removeAttribute(pageLabelAttr)
      return
    }
    button.style.removeProperty('display')
    button.setAttribute(pageLabelAttr, projected.text)
    const active = projected.text !== '...' && projected.to === currentPage
    button.classList.toggle('vui_button--active', active)
    button.classList.toggle('vui_button--active-blue', active)
    if (button instanceof HTMLButtonElement) {
      button.disabled = false
    }
    button.classList.remove('vui_button--disabled')
  })

  const countElement =
    root.querySelector<HTMLElement>('.vui_pagenation-go__count') ??
    root.querySelector<HTMLElement>('.vui_pagenation-go span')
  if (countElement) {
    countElement.textContent = `共 ${totalPages} 页 / ${freeTotalCount} 个，跳至`
  }

  const input = root.querySelector<HTMLInputElement>(
    '.vui_pagenation-go input, .vui_input__input',
  )
  if (input) {
    input.setAttribute('min', '1')
    input.setAttribute('max', String(totalPages))
  }

  getNativeSideButtons(root).forEach((button, index) => {
    const isPrevious = (button.textContent ?? '').includes('上一') || index === 0
    const disabled = isPrevious ? currentPage <= 1 : currentPage >= totalPages
    button.disabled = disabled
    button.classList.toggle('vui_button--disabled', disabled)
  })
}

const clearPaginationProjection = () => {
  if (paginationProjectionFrame) {
    cancelAnimationFrame(paginationProjectionFrame)
    paginationProjectionFrame = 0
  }
  const root = getNativePagination()
  if (!root) {
    return
  }
  getNativePageSlots(root).forEach(button => {
    button.removeAttribute(pageLabelAttr)
    button.style.removeProperty('display')
    button.classList.remove('vui_button--active-blue')
  })
  getNativeSideButtons(root).forEach(button => {
    button.disabled = false
    button.classList.remove('vui_button--disabled')
  })
  const input = root.querySelector<HTMLInputElement>(
    '.vui_pagenation-go input, .vui_input__input',
  )
  input?.removeAttribute('min')
  input?.removeAttribute('max')
}

const setInputValue = (input: HTMLInputElement, value: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  if (descriptor?.set) {
    descriptor.set.call(input, value)
  } else {
    input.value = value
  }
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const jumpNativePage = (to: number) => {
  const totalPages = getFreeTotalPages()
  if (!freeMode || !Number.isInteger(to) || to < 1 || to > totalPages || to === freeCurrentPage) {
    return false
  }
  const root = getNativePagination()
  const input = root?.querySelector<HTMLInputElement>(
    '.vui_pagenation-go input, .vui_input__input',
  )
  if (!input) {
    console.warn('[免费视频筛选] 未找到 B站原生分页的跳页输入框。')
    return false
  }
  internalPaginationJump = true
  try {
    setInputValue(input, String(to))
    for (const type of ['keydown', 'keypress', 'keyup']) {
      input.dispatchEvent(
        new KeyboardEvent(type, {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        }),
      )
    }
  } finally {
    internalPaginationJump = false
  }
  return true
}

const handlePaginationClick = (event: Event) => {
  if (!freeMode || internalPaginationJump) {
    return
  }
  const target = event.target
  if (!(target instanceof Element)) {
    return
  }
  const root = getNativePagination()
  if (!root || !root.contains(target)) {
    return
  }

  const pageSlot = target.closest<HTMLElement>(
    '.vui_pagenation--btn-num, .vui_pagenation--btn-more',
  )
  if (pageSlot) {
    const slots = getNativePageSlots(root)
    const index = slots.indexOf(pageSlot)
    if (index === -1) {
      return
    }
    const projected = getProjectedPages(freeCurrentPage, getFreeTotalPages())[index]
    if (!projected) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    jumpNativePage(projected.to)
    return
  }

  const sideButton = target.closest<HTMLButtonElement>('.vui_pagenation--btn-side')
  if (!sideButton) {
    return
  }
  const sideButtons = getNativeSideButtons(root)
  const index = sideButtons.indexOf(sideButton)
  const isPrevious = (sideButton.textContent ?? '').includes('上一') || index === 0
  const to = isPrevious ? freeCurrentPage - 1 : freeCurrentPage + 1
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
  if (to >= 1 && to <= getFreeTotalPages()) {
    jumpNativePage(to)
  }
}

const handlePaginationKeyEvent = (event: KeyboardEvent) => {
  if (!freeMode || internalPaginationJump || event.key !== 'Enter') {
    return
  }
  const target = event.target
  if (!(target instanceof HTMLInputElement)) {
    return
  }
  const root = getNativePagination()
  if (!root || !root.contains(target)) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
  if (event.type !== 'keydown') {
    return
  }
  const requested = Number.parseInt(target.value, 10)
  if (!Number.isInteger(requested)) {
    return
  }
  jumpNativePage(Math.min(getFreeTotalPages(), Math.max(1, requested)))
}

const buildFreeJson = async (url: URL, originalJson: JsonRecord) => {
  const requestedPage = Math.max(
    1,
    Number(url.searchParams.get('pn') || originalJson?.data?.page?.pn || 1),
  )
  const pageSize = Math.max(
    1,
    Number(
      url.searchParams.get('ps') ||
        originalJson?.data?.page?.ps ||
        paginationPageSize,
    ),
  )
  const context = getContext(url, pageSize)

  if (originalJson) {
    cacheRawJson(context, requestedPage, originalJson)
  }
  if (context.allCount === null) {
    await fetchRawPage(context, 1)
  }

  context.chain = context.chain.then(async () => {
    const chargeCount = await resolveChargeCount(context)
    context.freeCount = Math.max(0, (context.allCount ?? 0) - chargeCount)
    const totalPages = Math.max(1, Math.ceil(context.freeCount / pageSize))
    const logicalPage = Math.min(requestedPage, totalPages)
    const targetEnd = Math.min(logicalPage * pageSize, context.freeCount)
    await ensureFreeItems(context, targetEnd)
  })
  await context.chain

  const totalPages = Math.max(1, Math.ceil((context.freeCount ?? 0) / pageSize))
  const logicalPage = Math.min(requestedPage, totalPages)
  const start = (logicalPage - 1) * pageSize
  const targetEnd = Math.min(
    start + pageSize,
    context.freeCount ?? start + pageSize,
  )

  const template = context.templateJson || originalJson || lastRawJson
  if (!template) {
    throw new Error('缺少投稿列表响应模板')
  }

  const result = cloneJson(template)
  result.data.page.pn = logicalPage
  result.data.page.ps = pageSize
  result.data.page.count = context.freeCount
  freeTotalCount = context.freeCount
  freeCurrentPage = logicalPage

  if (!result.data.list) {
    result.data.list = {}
  }
  result.data.list.vlist = context.freeItems.slice(start, targetEnd)

  setTimeout(() => {
    schedulePaginationProjection()
    prefetchNextRawPage(context)
  }, 0)

  return result
}

const getHopJson = (url: URL) => {
  readCountsFromDom()
  const allCount = knownAllCount !== null ? Math.max(0, knownAllCount) : 0
  const chargeCount = knownChargeCount !== null ? Math.max(0, knownChargeCount) : null
  const hopCount =
    freeMode && chargeCount !== null ? Math.max(0, allCount - chargeCount) : allCount

  if (lastRawJson) {
    const json = cloneJson(lastRawJson)
    const pageSize = Math.max(
      1,
      Number(url.searchParams.get('ps') || json?.data?.page?.ps || 42),
    )
    if (!json.data) {
      json.data = {}
    }
    if (!json.data.page) {
      json.data.page = {}
    }
    json.data.page.count = hopCount
    json.data.page.pn = 1
    json.data.page.ps = pageSize
    return json
  }

  const pageSize = Math.max(1, Number(url.searchParams.get('ps') || 42))
  return {
    code: 0,
    message: '0',
    ttl: 1,
    data: {
      page: { count: hopCount, pn: 1, ps: pageSize },
      list: { tlist: {}, slist: [], vlist: [] },
    },
  }
}

const cachePassiveResponse = (url: URL, response: Response) => {
  response
    .clone()
    .json()
    .then(json => {
      if (!json || json.code !== 0 || !json.data) {
        return
      }
      const specialType = url.searchParams.get('special_type') || ''
      if (specialType === '') {
        const pageSize = Math.max(
          1,
          Number(url.searchParams.get('ps') || json.data?.page?.ps || 42),
        )
        const pageNumber = Math.max(
          1,
          Number(url.searchParams.get('pn') || json.data?.page?.pn || 1),
        )
        cacheRawJson(getContext(url, pageSize), pageNumber, json)
      } else if (specialType === 'charging') {
        knownChargeCount = Math.max(0, Number(json.data?.page?.count) || 0)
      }
      updateFilterLabel()
    })
    .catch(() => {})
}

const getCurrentSpaceKey = () => {
  const match = location.pathname.match(/^\/(\d+)(?:\/|$)/)
  return match ? match[1] : location.pathname
}

const resetSpaceState = () => {
  freeMode = false
  leavingFreeMode = false
  transitioning = false
  syntheticChargingRequests = 0
  internalPaginationJump = false
  freeCurrentPage = 1
  freeTotalCount = null
  freeResponseVersion = 0
  chargingRequestVersion = 0
  allRequestVersion = 0
  knownAllCount = null
  knownChargeCount = null
  lastRawJson = null
  clearPaginationProjection()
  contexts.clear()
  document.querySelector(`[${filterAttr}]`)?.remove()
}

const syncSpaceContext = () => {
  const nextSpaceKey = getCurrentSpaceKey()
  if (currentSpaceKey === null) {
    currentSpaceKey = nextSpaceKey
    return false
  }
  if (nextSpaceKey === currentSpaceKey) {
    return false
  }
  currentSpaceKey = nextSpaceKey
  resetSpaceState()
  return true
}

const installFetchHook = () => {
  if (patchedFetch) {
    return
  }

  originalFetch = unsafeWindow.fetch
  nativeFetch = (input, init) => originalFetch!.call(unsafeWindow, input, init)

  patchedFetch = async (input, init) => {
    const url = parseRequestUrl(input)
    if (!url) {
      return nativeFetch!(input, init)
    }

    syncSpaceContext()

    const method = String(
      init?.method || (input instanceof Request ? input.method : '') || 'GET',
    ).toUpperCase()
    const isArcSearch =
      method === 'GET' && url.hostname === 'api.bilibili.com' && url.pathname === apiPath
    if (!isArcSearch) {
      return nativeFetch!(input, init)
    }

    const specialType = url.searchParams.get('special_type') || ''

    if (specialType === 'charging') {
      chargingRequestVersion += 1
    } else if (specialType === '') {
      allRequestVersion += 1
    }

    if (syntheticChargingRequests > 0 && specialType === 'charging') {
      syntheticChargingRequests -= 1

      if (lastRawJson) {
        return syntheticResponse(getHopJson(url))
      }

      const response = await nativeFetch!(input, init)
      cachePassiveResponse(url, response)
      return response
    }

    if (freeMode && specialType === '') {
      const logicalPage = Math.max(1, Number(url.searchParams.get('pn') || 1))
      const pageSize = Math.max(
        1,
        Number(url.searchParams.get('ps') || paginationPageSize),
      )
      const context = getContext(url, pageSize)
      const cached = context.rawPages.get(logicalPage)
      let response: Response | null = null
      let originalJson = cached ? cloneJson(cached) : null

      if (!originalJson) {
        response = await nativeFetch!(input, init)
        try {
          originalJson = await response.clone().json()
        } catch {
          return response
        }
        if (!originalJson || originalJson.code !== 0 || !originalJson.data) {
          return response
        }
      }

      try {
        const freeJson = await buildFreeJson(url, originalJson)
        freeResponseVersion += 1
        updateFilterLabel()
        return response ? responseFromJson(response, freeJson) : syntheticResponse(freeJson)
      } catch (error) {
        console.error('[免费视频筛选] 生成免费视频列表失败，已恢复 B站原生筛选。', error)
        freeMode = false
        leavingFreeMode = false
        transitioning = false
        freeTotalCount = null
        freeCurrentPage = 1
        clearPaginationProjection()
        syncVisualState()
        return response || nativeFetch!(input, init)
      }
    }

    const response = await nativeFetch!(input, init)
    cachePassiveResponse(url, response)
    return response
  }

  unsafeWindow.fetch = patchedFetch
  warmupWbiKeys(nativeFetch).catch(() => {})
}

const removeFetchHook = () => {
  if (patchedFetch && originalFetch && unsafeWindow.fetch === patchedFetch) {
    unsafeWindow.fetch = originalFetch
  }
  patchedFetch = null
  originalFetch = null
  nativeFetch = null
  resetWbiKeys()
}

const updateFilterLabel = (explicitItem?: HTMLElement) => {
  const row = getFilterRow()
  if (!row) {
    return
  }

  const chargeItem = getChargeItem(row)
  if (!chargeItem) {
    return
  }

  const item = explicitItem ?? row.querySelector<HTMLElement>(`[${filterAttr}]`)
  if (!item) {
    return
  }

  const domAll = getCount(getAllItem(row))
  const domCharge = getCount(chargeItem)

  if (!freeMode && !leavingFreeMode) {
    if (domAll !== null) {
      knownAllCount = domAll
    }
    if (domCharge !== null) {
      knownChargeCount = domCharge
    }
  }

  const all = knownAllCount ?? domAll
  const charge = knownChargeCount ?? domCharge
  const free = all !== null && charge !== null && all >= charge ? all - charge : null
  const label = free === null ? '免费视频' : `免费视频 ${free}`

  if (item.textContent !== label) {
    item.textContent = label
  }
}

const ensureFilterItem = () => {
  const row = getFilterRow()
  if (!row) {
    return null
  }

  const chargeItem = getChargeItem(row)
  let item = row.querySelector<HTMLElement>(`[${filterAttr}]`)

  if (!chargeItem && transitioning) {
    return item
  }

  if (!chargeItem) {
    item?.remove()
    knownChargeCount = null
    return null
  }

  if (!item) {
    item = document.createElement('div')
    item.className = 'radio-filter__item'
    item.setAttribute(filterAttr, '')
    item.title = '仅显示可免费观看的视频'

    if (chargeItem.nextSibling) {
      row.insertBefore(item, chargeItem.nextSibling)
    } else {
      row.appendChild(item)
    }
  }

  updateFilterLabel(item)
  return item
}

const enforceFreeFilterVisualState = () => {
  if (!isFreeVisualMode()) {
    return
  }

  const row = getFilterRow()
  if (!row) {
    return
  }

  const freeItem = row.querySelector<HTMLElement>(`[${filterAttr}]`)
  if (!freeItem) {
    return
  }

  if (!freeItem.classList.contains(activeClass)) {
    freeItem.classList.add(activeClass)
  }

  getNativeItems(row).forEach(item => {
    if (item.classList.contains(activeClass)) {
      item.classList.remove(activeClass)
    }
  })
}

const enforceAllFilterVisualState = () => {
  const row = getFilterRow()
  if (!row) {
    return
  }

  const freeItem = row.querySelector<HTMLElement>(`[${filterAttr}]`)
  freeItem?.classList.remove(activeClass)

  const allItem = getAllItem(row)
  getNativeItems(row).forEach(item => {
    item.classList.toggle(activeClass, item === allItem)
  })
}

const syncVisualState = () => {
  const row = getFilterRow()
  if (!row) {
    return
  }

  const freeItem = ensureFilterItem()
  if (!freeItem) {
    return
  }

  if (isFreeVisualMode()) {
    enforceFreeFilterVisualState()
    if (freeMode && freeTotalCount !== null) {
      schedulePaginationProjection()
    }
    return
  }

  if (freeItem.classList.contains(activeClass)) {
    freeItem.classList.remove(activeClass)
  }
}

const clickNative = (item: HTMLElement | null) => {
  if (!item) {
    return
  }
  internalClick = true
  try {
    item.click()
  } finally {
    internalClick = false
  }
}

const waitFor = (predicate: () => boolean, timeout = 1500) =>
  new Promise<boolean>(resolve => {
    const started = performance.now()
    const check = () => {
      if (predicate()) {
        resolve(true)
        return
      }
      if (performance.now() - started >= timeout) {
        resolve(false)
        return
      }
      setTimeout(check, 10)
    }
    check()
  })

const waitFrames = (count = 2) =>
  new Promise<void>(resolve => {
    const step = () => {
      if (count <= 0) {
        resolve()
        return
      }
      count -= 1
      requestAnimationFrame(step)
    }
    step()
  })

const waitForFreeResponse = async (version: number) => {
  const ok = await waitFor(() => freeResponseVersion > version, 2500)
  if (ok) {
    await waitFrames(2)
    enforceFreeFilterVisualState()
    schedulePaginationProjection()
  }
  return ok
}

const forceAllReload = async () => {
  if (transitioning) {
    return
  }

  const row = getFilterRow()
  if (!row) {
    return
  }

  const chargeItem = getChargeItem(row)
  const allItem = getAllItem(row)

  if (!chargeItem || !allItem) {
    if (leavingFreeMode) {
      leavingFreeMode = false
      enforceAllFilterVisualState()
    }
    return
  }

  const enteringFree = freeMode
  const exitingFree = leavingFreeMode

  transitioning = true

  try {
    const chargeVersion = chargingRequestVersion
    syntheticChargingRequests += 1

    clickNative(chargeItem)

    await waitFor(() => chargingRequestVersion > chargeVersion, 1200)

    if (enteringFree || exitingFree) {
      enforceFreeFilterVisualState()
    }

    const responseVersion = freeResponseVersion
    const nativeAllVersion = allRequestVersion

    const latestRow = getFilterRow()
    const latestAll = latestRow ? getAllItem(latestRow) : null

    if (!latestAll) {
      if (exitingFree) {
        leavingFreeMode = false
        enforceAllFilterVisualState()
      }
      return
    }

    clickNative(latestAll)

    if (enteringFree) {
      enforceFreeFilterVisualState()

      const ok = await waitForFreeResponse(responseVersion)
      if (!ok) {
        console.warn('[免费视频筛选] 未收到免费视频列表响应，已恢复原生“全部类型”。')
        freeMode = false
        leavingFreeMode = false
        freeTotalCount = null
        freeCurrentPage = 1
        clearPaginationProjection()
        enforceAllFilterVisualState()
      }
      return
    }

    if (exitingFree) {
      enforceFreeFilterVisualState()

      await waitFor(() => allRequestVersion > nativeAllVersion, 2000)
      await waitFrames(2)

      leavingFreeMode = false
      enforceAllFilterVisualState()
      return
    }

    await waitFor(() => allRequestVersion > nativeAllVersion, 2000)
    await waitFrames(2)
  } finally {
    transitioning = false
    syntheticChargingRequests = 0
  }

  syncVisualState()
}

const activateFreeMode = async () => {
  if (freeMode || leavingFreeMode || transitioning) {
    return
  }

  syncSpaceContext()

  const row = getFilterRow()
  if (!row) {
    return
  }

  const allItem = getAllItem(row)
  const chargeItem = getChargeItem(row)

  if (!chargeItem) {
    row.querySelector(`[${filterAttr}]`)?.remove()
    return
  }

  const activeNative = getNativeItems(row).find(item =>
    item.classList.contains(activeClass),
  )

  readCountsFromDom()

  if (knownAllCount !== null && knownChargeCount !== null) {
    freeTotalCount = Math.max(0, knownAllCount - knownChargeCount)
  }

  freeCurrentPage = 1
  leavingFreeMode = false
  freeMode = true

  enforceFreeFilterVisualState()

  if (activeNative && activeNative !== allItem) {
    const responseVersion = freeResponseVersion
    transitioning = true

    try {
      clickNative(allItem)
      enforceFreeFilterVisualState()

      const ok = await waitForFreeResponse(responseVersion)
      if (!ok) {
        console.warn('[免费视频筛选] 从原生筛选切换到免费视频时未收到列表响应，已恢复全部类型。')
        freeMode = false
        leavingFreeMode = false
        freeTotalCount = null
        freeCurrentPage = 1
        clearPaginationProjection()
        enforceAllFilterVisualState()
      }
    } finally {
      transitioning = false
    }

    syncVisualState()
    return
  }

  await forceAllReload()
}

const deactivateToAll = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()

  if (!freeMode || leavingFreeMode || transitioning) {
    return
  }

  freeMode = false
  leavingFreeMode = true

  freeTotalCount = null
  freeCurrentPage = 1
  clearPaginationProjection()

  enforceFreeFilterVisualState()
  forceAllReload()
}

const handleClick = (event: Event) => {
  if (internalClick) {
    return
  }

  const target = event.target
  if (!(target instanceof Element)) {
    return
  }

  const freeItem = target.closest(`[${filterAttr}]`)
  if (freeItem) {
    event.preventDefault()
    event.stopPropagation()
    activateFreeMode()
    return
  }

  if (leavingFreeMode) {
    const nativeItem = target.closest('.video-type-filter .radio-filter__item')
    if (nativeItem) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }
    return
  }

  if (!freeMode) {
    return
  }

  const nativeItem = target.closest<HTMLElement>('.video-type-filter .radio-filter__item')
  if (!nativeItem) {
    return
  }

  const row = getFilterRow()
  const allItem = row && getAllItem(row)

  if (nativeItem === allItem) {
    deactivateToAll(event)
    return
  }

  freeMode = false
  leavingFreeMode = false
  freeTotalCount = null
  freeCurrentPage = 1
  clearPaginationProjection()
  syncVisualState()
}

const stop = () => {
  observer?.disconnect()
  observer = null

  if (paginationProjectionFrame) {
    cancelAnimationFrame(paginationProjectionFrame)
    paginationProjectionFrame = 0
  }

  document.removeEventListener('click', handleClick, true)
  document.removeEventListener('click', handlePaginationClick, true)

  for (const type of ['keydown', 'keypress', 'keyup'] as const) {
    document.removeEventListener(type, handlePaginationKeyEvent, true)
  }

  document.querySelector(`[${filterAttr}]`)?.remove()

  freeMode = false
  leavingFreeMode = false
  internalClick = false
  transitioning = false
  syntheticChargingRequests = 0
  internalPaginationJump = false
  freeTotalCount = null
  freeCurrentPage = 1
  freeResponseVersion = 0
  chargingRequestVersion = 0
  allRequestVersion = 0
  currentSpaceKey = null
  knownAllCount = null
  knownChargeCount = null

  clearPaginationProjection()
  contexts.clear()
  lastRawJson = null
  removeFetchHook()
}

const start = () => {
  stop()

  currentSpaceKey = getCurrentSpaceKey()
  installFetchHook()

  document.addEventListener('click', handlePaginationClick, true)

  for (const type of ['keydown', 'keypress', 'keyup'] as const) {
    document.addEventListener(type, handlePaginationKeyEvent, true)
  }

  document.addEventListener('click', handleClick, true)

  observer = new MutationObserver(() => {
    syncSpaceContext()
    ensureFilterItem()

    if (isFreeVisualMode()) {
      enforceFreeFilterVisualState()

      if (freeMode && freeTotalCount !== null) {
        schedulePaginationProjection()
      }
    } else {
      syncVisualState()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
    characterData: true,
  })

  readCountsFromDom()
  ensureFilterItem()
  syncVisualState()
}

export const entry = start

export const entry = start
export const reload = start
export const unload = stop

import { defineComponentMetadata } from '@/components/define'
import { getJsonWithCredentials } from '@/core/ajax'
import { childListSubtree } from '@/core/observer'
import { select } from '@/core/spin-query'
import { Toast } from '@/core/toast'
import { getUID, getVue2Data, simulateClick } from '@/core/utils'
import { feedsUrlsWithoutDetail } from '@/core/utils/urls'

const name = 'feedsUpSearchUpDynamic'

const ROW_ID = 'bili-upsearch-row'

// 动态页 UP 选择栏相关选择器集中定义, 改版时只改这里.
const SEL = {
  upList: '.bili-dyn-up-list',
  upItem: '.bili-dyn-up-list__item',
  upItemName: '.bili-dyn-up-list__item__name',
  upItemFaceImg: '.bili-dyn-up-list__item__face img',
  upItemFace: '.bili-dyn-up-list__item__face',
  upItemFaceDot: '.bili-dyn-up-list__item__face > span',
  upWindow: '.bili-dyn-up-list__window',
  upContent: '.bili-dyn-up-list__content',
}

/** 从上游 API 拿到的关注 UP 精简结构 */
interface FollowUp {
  mid: number
  uname: string
  face: string
}

/** 拉取当前登录用户全部关注 (不做持久化缓存, 与原生页面一致, 刷新即重拉) */
const loadFollowings = async (): Promise<FollowUp[]> => {
  const uid = Number(getUID())
  if (!uid) {
    throw new Error('未登录B站或登录已失效')
  }
  const pageSize = 50
  const maxPage = 40
  let pageNum = 1
  let total = Number.POSITIVE_INFINITY
  let list: FollowUp[] = []
  while (list.length < total && pageNum <= maxPage) {
    const res = await getJsonWithCredentials(
      `https://api.bilibili.com/x/relation/followings?vmid=${uid}` +
        `&pn=${pageNum}&ps=${pageSize}&order=desc&order_type=attention`,
    )
    if (!res || res.code !== 0) {
      throw new Error(`获取关注列表失败: ${(res && res.message) || '未知错误'}`)
    }
    const data = res.data || {}
    total = data.total || 0
    const page = data.list || []
    list = list.concat(
      page.map((it: any) => ({ mid: it.mid, uname: it.uname, face: it.face } as FollowUp)),
    )
    if (page.length < pageSize) {
      break
    }
    pageNum += 1
  }
  return list
}

// =====================================================================
// 复用 B 站原版 DynUpList 的 handleSelect(index) 切换动态
// 兼容 Vue 2 (`__vue__`) 与 Vue 3 (`__vueParentComponent`).
// 只调用原版自身的切换逻辑, 不创建任何动态内容.
// =====================================================================
function switchUpListTo(mid: number, uname: string, face: string) {
  const tagOf = (inst: any) => {
    if (!inst) {
      return ''
    }
    const o = inst.$options || {}
    // eslint-disable-next-line no-underscore-dangle
    const t = o.name || o._componentTag || (inst.type && (inst.type.name || inst.type.__name)) || ''
    return String(t).toLowerCase()
  }
  const propsOf = (inst: any) => {
    if (!inst) {
      return {}
    }
    return inst.props || inst.$props || (inst.proxy && inst.proxy.$props) || {}
  }
  // 复用核心工具: 依次尝试元素自身/父级/子级/父组件上的 Vue 实例, 兼容 Vue 2 与 Vue 3
  const getComp = (el: any) => getVue2Data(el) || null
  const walkUp = (inst: any) => inst && (inst.parent || inst.$parent || null)
  const isUpList = (inst: any) => {
    const p = propsOf(inst)
    return Array.isArray(p.list) && 'more' in p && 'active' in p
  }
  const isUpListTag = (inst: any) => {
    const t = tagOf(inst)
    return t.indexOf('up-list') >= 0 || t.indexOf('uplist') >= 0
  }

  const findCompIn = (inst: any, depth: number): any => {
    if (!inst || depth > 40) {
      return null
    }
    if (isUpList(inst) || isUpListTag(inst)) {
      return inst
    }
    const children = inst.$children || []
    for (let i = 0; i < children.length; i++) {
      const found = findCompIn(children[i], depth + 1)
      if (found) {
        return found
      }
    }
    return null
  }

  // 从 UP 项向上找 DynUpList 组件 (props 必含 list + more + active)
  const findUpListComp = () => {
    const item = document.querySelector(SEL.upItem)
    let inst = item ? getComp(item) : null
    let guardUp = 0
    while (inst && guardUp++ < 60) {
      if (isUpList(inst) || isUpListTag(inst)) {
        return inst
      }
      inst = walkUp(inst)
    }
    // 兜底: 从 .bili-dyn-up-list 元素或其祖先的 __vue__ 里深度搜索
    let el: any = document.querySelector(SEL.upList)
    let guardEl = 0
    while (el && guardEl++ < 120) {
      const v = getComp(el)
      if (v) {
        const found = findCompIn(v, 0)
        if (found) {
          return found
        }
      }
      el = el.parentElement
    }
    return null
  }

  const readUpList = (inst: any): any[] | null => {
    if (!inst) {
      return null
    }
    const p = propsOf(inst)
    if (Array.isArray(p.list)) {
      return p.list
    }
    const setupState = inst.setupState || {}
    try {
      for (const key in setupState) {
        if (/up.*list|list.*up/i.test(key) && Array.isArray(setupState[key])) {
          return setupState[key]
        }
      }
    } catch (error) {
      // 遍历 Vue3 setupState 可能被 Proxy 拦截报错, 忽略
    }
    const data = inst.$data || {}
    for (const key in data) {
      if (/up.*list|list.*up/i.test(key) && Array.isArray(data[key])) {
        return data[key]
      }
    }
    return null
  }

  const findUpListOfParent = (child: any): any[] | null => {
    let inst = walkUp(child)
    let guard = 0
    while (inst && guard++ < 30) {
      const arr = readUpList(inst)
      if (arr) {
        return arr
      }
      inst = walkUp(inst)
    }
    return null
  }

  // 调用原版 DynUpList 自身的切换方法, 传数组索引
  const callSelect = (child: any, idx: number) => {
    if (typeof child.handleSelect === 'function') {
      return child.handleSelect(idx)
    }
    if (child.proxy && typeof child.proxy.handleSelect === 'function') {
      return child.proxy.handleSelect(idx)
    }
    if (child.ctx && typeof child.ctx.handleSelect === 'function') {
      return child.ctx.handleSelect(idx)
    }
    if (typeof child.$emit === 'function') {
      return child.$emit('change', idx)
    }
    if (typeof child.emit === 'function') {
      return child.emit('change', idx)
    }
    throw new Error('找不到原版 handleSelect/emit 方法')
  }

  try {
    const child: any = findUpListComp()
    if (!child) {
      return { ok: false, err: '未找到原版 DynUpList 组件' }
    }
    const arr = findUpListOfParent(child) || readUpList(child)
    if (!arr) {
      return { ok: false, err: '未找到原版 upList 数组' }
    }
    let idx = -1
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] && Number(arr[i].mid) === Number(mid)) {
        idx = i
        break
      }
    }
    if (idx < 0) {
      // 该 UP 不在当前已渲染列表(B站按需加载, 只有前若干项): 临时补一条到数组尾部再切换.
      const sample = arr[0] || {}
      const entry: any = { ...sample }
      entry.mid = mid
      entry.uname = uname
      entry.face = face
      entry.has_update = false
      arr.push(entry)
      idx = arr.length - 1
    }
    callSelect(child, idx)
    return { ok: true, idx, total: arr.length, vueTag: tagOf(child) }
  } catch (error: any) {
    return { ok: false, err: (error && error.message) || String(error) }
  }
}

// =====================================================================
// UI
// =====================================================================
const state: {
  list: FollowUp[] | null
  loading: boolean
  results: HTMLElement[]
} = { list: null, loading: false, results: [] }

let bar: HTMLElement | null = null

// 前置声明: applyFilter 与 ensureData 互相调用, 先声明以便提前引用
let ensureData: () => Promise<void>

const inputEl = () => (bar ? (bar.querySelector('input') as HTMLInputElement | null) : null)
const clearBtnEl = () =>
  bar ? (bar.querySelector('.bili-upsearch-clear') as HTMLElement | null) : null

const nativeItems = (): HTMLElement[] => {
  const root = document.querySelector(SEL.upList)
  if (!root) {
    return []
  }
  return Array.from(root.querySelectorAll(SEL.upItem)) as HTMLElement[]
}

const itemName = (el: Element) => {
  const nameEl = el.querySelector(SEL.upItemName)
  return (nameEl ? nameEl.textContent : el.textContent || '').trim()
}

const clearResults = () => {
  nativeItems().forEach(el => {
    el.style.display = ''
  })
  const windowEl = document.querySelector(SEL.upWindow) as HTMLElement | null
  if (windowEl) {
    windowEl.scrollLeft = 0
  }
  state.results.forEach(el => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  })
  state.results = []
}

const clearSearch = () => {
  clearResults()
  const input = inputEl()
  if (input) {
    input.value = ''
  }
  const clearBtn = clearBtnEl()
  if (clearBtn) {
    clearBtn.classList.remove('show')
  }
}

const pickProto = () => {
  const items = nativeItems()
  return items.find(el => el.querySelector(SEL.upItemFaceImg)) || items[0] || null
}

const makeItem = (up: FollowUp, proto: HTMLElement, nativeEl: HTMLElement | null) => {
  const li = proto.cloneNode(true) as HTMLElement
  li.classList.remove('active')
  li.removeAttribute('title')
  li.style.display = ''
  li.dataset.biliUpsearch = '1'
  const nameEl = li.querySelector(SEL.upItemName)
  if (nameEl) {
    nameEl.textContent = up.uname || ''
  }
  const img = li.querySelector(SEL.upItemFaceImg)
  if (img) {
    img.setAttribute('src', (up.face || '').replace(/^http:/, 'https:'))
    img.removeAttribute('srcset')
    const picture = li.querySelector('picture')
    if (picture) {
      picture.querySelectorAll('source').forEach(source => source.remove())
    }
  }
  // 原版 item 里的 <span> 是"有新动态"的蓝点: 原生有则补, 原生没有则删
  const cloneDot = li.querySelector(SEL.upItemFaceDot)
  const realDot = nativeEl ? nativeEl.querySelector(SEL.upItemFaceDot) : null
  if (realDot) {
    if (!cloneDot) {
      const faceBox = li.querySelector(SEL.upItemFace)
      if (faceBox) {
        faceBox.appendChild(realDot.cloneNode(true))
      }
    }
  } else if (cloneDot) {
    cloneDot.remove()
  }
  li.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    if (nativeEl && nativeEl.isConnected) {
      simulateClick(nativeEl)
      clearSearch()
      return
    }
    let result: { ok: boolean; err?: string } = { ok: false, err: '未知错误' }
    try {
      result = switchUpListTo(up.mid, up.uname, up.face)
    } catch (error: any) {
      result = { ok: false, err: error.message }
    }
    if (result && result.ok) {
      clearSearch()
    } else {
      console.warn('[up切换栏搜索框] 切换失败', result)
      Toast.error(`切换失败: ${(result && result.err) || '未知错误'}`, 'up切换栏搜索框', 5000)
    }
  })
  return li
}

const applyFilter = (keyword: string) => {
  const kw = (keyword || '').trim().toLowerCase()
  const root = document.querySelector(SEL.upList)
  if (!root) {
    return
  }
  clearResults()
  if (!kw) {
    return
  }
  if (!state.list) {
    ensureData()
    return
  }
  const hits = state.list.filter(up => (up.uname || '').toLowerCase().includes(kw))
  nativeItems().forEach(el => {
    el.style.display = 'none'
  })
  if (!hits.length) {
    return
  }
  const content =
    (document.querySelector(SEL.upContent) as HTMLElement | null) ||
    (document.querySelector(SEL.upWindow) as HTMLElement | null) ||
    (root as HTMLElement)
  const nativeByName = new Map<string, HTMLElement>()
  nativeItems().forEach(el => {
    if (el.dataset && el.dataset.biliUpsearch) {
      return
    }
    const nativeName = itemName(el)
    if (nativeName && !nativeByName.has(nativeName)) {
      nativeByName.set(nativeName, el)
    }
  })
  const proto = pickProto()
  if (!proto) {
    return
  }
  const fragment = document.createDocumentFragment()
  hits.forEach(up => {
    const li = makeItem(up, proto, nativeByName.get(up.uname) || null)
    state.results.push(li)
    fragment.appendChild(li)
  })
  const firstItem = content.querySelector(SEL.upItem)
  if (firstItem) {
    content.insertBefore(fragment, firstItem)
  } else {
    content.appendChild(fragment)
  }
  const windowEl = document.querySelector(SEL.upWindow) as HTMLElement | null
  if (windowEl) {
    windowEl.scrollLeft = 0
  }
}

ensureData = async () => {
  if (state.list || state.loading) {
    return
  }
  state.loading = true
  try {
    state.list = await loadFollowings()
    const input = inputEl()
    if (input && input.value.trim()) {
      applyFilter(input.value)
    }
  } catch (error: any) {
    Toast.error(`加载关注列表失败: ${error.message}`, 'up切换栏搜索框', 5000)
  } finally {
    state.loading = false
  }
}

const mountBar = (): boolean => {
  if (bar && bar.isConnected) {
    return true
  }
  const list = document.querySelector(SEL.upList)
  if (!list) {
    return false
  }
  const row = document.createElement('div')
  row.id = ROW_ID
  bar = document.createElement('div')
  bar.className = 'bili-upsearch-bar'
  bar.title = '搜索已关注UP（按名称）'
  bar.innerHTML =
    '<svg class="bili-upsearch-icon" viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M11.2 10.1l3.1 3.1a.8.8 0 0 1-1.1 1.1l-3.1-3.1a5.2 5.2 0 1 1 1.1-1.1zM6.9 11a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2z" fill="currentColor"/>' +
    '</svg>' +
    '<input class="bili-upsearch-input" type="text" placeholder="搜索已关注UP" autocomplete="off" spellcheck="false">' +
    '<button class="bili-upsearch-clear" type="button" title="清空" aria-label="清空">×</button>'
  row.appendChild(bar)
  list.insertBefore(row, list.firstChild)

  const input = inputEl()
  const clearBtn = clearBtnEl()
  if (!input || !clearBtn) {
    return true
  }
  const updateClear = () => {
    clearBtn.classList.toggle('show', !!input.value)
  }
  input.addEventListener('focus', ensureData, { once: true })
  input.addEventListener('input', () => {
    updateClear()
    applyFilter(input.value)
  })
  clearBtn.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    input.value = ''
    updateClear()
    clearResults()
    input.focus()
  })
  return true
}

const entry = async () => {
  await select(SEL.upList)
  if (!mountBar()) {
    return
  }
  const list = document.querySelector(SEL.upList)
  if (list) {
    // B站懒加载会不断替换列表内容; 搜索条被替换掉时重新挂载
    childListSubtree(list, () => {
      if (!bar || !bar.isConnected) {
        mountBar()
      }
    })
  }
}

const unload = () => {
  clearSearch()
  const row = document.getElementById(ROW_ID)
  if (row && row.parentNode) {
    row.parentNode.removeChild(row)
  }
  bar = null
  state.list = null
  state.loading = false
  state.results = []
}

export const component = defineComponentMetadata({
  name,
  displayName: 'up切换栏搜索框',
  author: {
    name: 'QiuLiang-99 (with DeepSeek Harness)',
    link: 'https://github.com/QiuLiang-99',
  },
  tags: [componentsTags.feeds, componentsTags.utils],
  urlInclude: feedsUrlsWithoutDetail,
  entry,
  reload: entry,
  unload,
  instantStyles: [
    {
      name: 'feeds-up-search-up-dynamic',
      style: () => import('./feeds-up-search-up-dynamic.scss'),
    },
  ],
})

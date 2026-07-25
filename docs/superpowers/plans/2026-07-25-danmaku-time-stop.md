# 弹幕时停（合并源校时）实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 `subagent-driven-development`（推荐）或 `executing-plans` 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在 `danmakuMerger` 原生弹幕悬浮菜单加入「时停 / 恢复」，对同一合并源弹幕整组定格并拖进度完成 offset 累加校时。

**架构：** 新增独立时停子系统（状态机 + 菜单注入 + 画面钉住/隐藏 + 偏移应用），复用现有 `engine.updateSource({ offset })`、`rebuildList()` / `fullSyncAsync` 与 `DM_MERGER_PREFIX` 识别。运行时只允许 1 个源处于 active；场景切换 discard 不写 offset。

**技术栈：** TypeScript、Bilibili 原生弹幕 tip DOM、现有 merger SCSS、`engine` / `nativeDanmaku` API

**规格：** `docs/superpowers/specs/2026-07-25-danmaku-time-stop-design.md`

---

## 文件结构

| 文件 | 职责 |
|------|------|
| 创建 `registry/lib/components/video/danmaku/merger/time-stop/types.ts` | 时停状态类型、公开 API 类型 |
| 创建 `registry/lib/components/video/danmaku/merger/time-stop/source-id.ts` | 从 dmid / DOM 解析 sourceId |
| 创建 `registry/lib/components/video/danmaku/merger/time-stop/state.ts` | 单例状态机 idle/active、t0、pinned 列表 |
| 创建 `registry/lib/components/video/danmaku/merger/time-stop/view.ts` | 钉住、高亮、隐藏其他、清理样式 |
| 创建 `registry/lib/components/video/danmaku/merger/time-stop/menu.ts` | 向原生 tip 注入「时停/恢复」按钮 |
| 创建 `registry/lib/components/video/danmaku/merger/time-stop/controller.ts` | enter/release/discard、算 delta、写 offset、触发同步 |
| 创建 `registry/lib/components/video/danmaku/merger/time-stop/index.ts` | 导出 `initTimeStop` / `destroyTimeStop` |
| 修改 `registry/lib/components/video/danmaku/merger/ui/shared/merger-global.scss` 或 `merger.scss` | 时停高亮/隐藏 class |
| 修改 `registry/lib/components/video/danmaku/merger/runtime/index.ts` | 启动/销毁时停；video/part change 时 discard |
| 修改 `registry/lib/components/video/danmaku/merger/danmaku/inject.ts` | 如需：暴露 dmid 前缀解析辅助，或复用已有 `DM_MERGER_PREFIX` |
| 修改 `registry/lib/components/video/danmaku/merger/index.md` | 补充「时停」使用说明一行 |

不改：

- 管理面板 offset UI（只复用 `updateSource`）
- pakku 兼容路径（除非发现时停破坏）

---

### 任务 1：sourceId 解析与状态机

**文件：**
- 创建：`registry/lib/components/video/danmaku/merger/time-stop/types.ts`
- 创建：`registry/lib/components/video/danmaku/merger/time-stop/source-id.ts`
- 创建：`registry/lib/components/video/danmaku/merger/time-stop/state.ts`
- 依赖：`registry/lib/components/video/danmaku/merger/danmaku/inject.ts` 的 `DM_MERGER_PREFIX`

- [ ] **步骤 1：确认现有 dmid 约定**

读取 `inject.ts` 中：

```ts
dmid: `${DM_MERGER_PREFIX}${srcId}_${rawDmid}`
// DM_MERGER_PREFIX = 'dmmerger_'
```

`srcId` 来自 `meta.bvid || meta.id` 经字符清洗。

- [ ] **步骤 2：实现类型**

`types.ts`：

```ts
export type TimeStopStatus = 'idle' | 'active'

export interface PinnedDanmakuRef {
  dmid: string
  el: HTMLElement
  /** 钉住前的 inline style 备份，discard/release 时还原 */
  prevStyle: {
    transform: string
    left: string
    top: string
    animationPlayState: string
  }
}

export interface TimeStopIdleState {
  status: 'idle'
}

export interface TimeStopActiveState {
  status: 'active'
  sourceId: string
  /** 进入时停时的播放进度（秒） */
  t0: number
  pinned: PinnedDanmakuRef[]
  /** 可选：实时显示用 */
  deltaHintEl?: HTMLElement | null
}

export type TimeStopState = TimeStopIdleState | TimeStopActiveState

export interface TimeStopDeps {
  /** 返回当前播放进度秒 */
  getCurrentTime: () => number
  /** 源是否存在 */
  hasSource: (sourceId: string) => boolean
  /** 累加并应用 offset；内部应 updateSource + rebuild/sync */
  applyOffsetDelta: (sourceId: string, deltaSeconds: number) => void | Promise<void>
  /** 轻提示 */
  toast: (message: string, level?: 'info' | 'success' | 'error' | 'warn') => void
}
```

- [ ] **步骤 3：实现 sourceId 解析**

`source-id.ts`：

```ts
import { DM_MERGER_PREFIX } from '../danmaku/inject'

/** 从 dmid 解析合并源 ID；非合并弹幕返回 null */
export const parseSourceIdFromDmid = (dmid: string | null | undefined): string | null => {
  const raw = String(dmid || '')
  if (!raw.startsWith(DM_MERGER_PREFIX)) {
    return null
  }
  const rest = raw.slice(DM_MERGER_PREFIX.length)
  // 格式：{srcId}_{rawDmid}；srcId 可能含 BV 与下划线，取最后一个 _ 之前
  const idx = rest.lastIndexOf('_')
  if (idx <= 0) {
    return rest || null
  }
  return rest.slice(0, idx) || null
}

/** 从 tip 上下文或弹幕节点 dataset 尽量取 dmid */
export const readDmidFromContext = (node: Element | null): string | null => {
  if (!node) {
    return null
  }
  const withData =
    (node.closest('[data-dmid],[data-id-str],[data-id]') as HTMLElement | null) ||
    (node as HTMLElement)
  const dmid =
    withData.dataset?.dmid ||
    withData.dataset?.idStr ||
    withData.getAttribute('data-dmid') ||
    withData.getAttribute('data-id-str') ||
    withData.getAttribute('data-id')
  return dmid ? String(dmid) : null
}
```

实现时若 DOM 字段名与实测不同，仅改 `readDmidFromContext`，保持 `parseSourceIdFromDmid` 契约不变。

- [ ] **步骤 4：实现状态机**

`state.ts`：

```ts
import type { TimeStopActiveState, TimeStopState } from './types'

let state: TimeStopState = { status: 'idle' }

export const getTimeStopState = (): TimeStopState => state

export const isTimeStopActive = (): boolean => state.status === 'active'

export const getActiveSourceId = (): string | null =>
  state.status === 'active' ? state.sourceId : null

export const setTimeStopActive = (next: TimeStopActiveState): void => {
  state = next
}

export const setTimeStopIdle = (): void => {
  state = { status: 'idle' }
}
```

- [ ] **步骤 5：本地核对**

在 worktree 用 TypeScript 语言服务/打开文件确认无导入环依赖。  
（仓库无该子模块单测框架时，可用临时 node 片段验证解析：）

```js
// 手动核对示例
// parseSourceIdFromDmid('dmmerger_BV1xx_123_abc') === 'BV1xx_123'
// parseSourceIdFromDmid('123456') === null
```

- [ ] **步骤 6：Commit**

```bash
git add registry/lib/components/video/danmaku/merger/time-stop/types.ts \
  registry/lib/components/video/danmaku/merger/time-stop/source-id.ts \
  registry/lib/components/video/danmaku/merger/time-stop/state.ts
git commit -m "feat: 时停状态机与 sourceId 解析骨架"
```

---

### 任务 2：画面控制器（钉住 / 高亮 / 隐藏）

**文件：**
- 创建：`registry/lib/components/video/danmaku/merger/time-stop/view.ts`
- 修改：`registry/lib/components/video/danmaku/merger/merger.scss` 或 `ui/shared/merger-global.scss`

- [ ] **步骤 1：定义 class 名**

```ts
export const TIME_STOP_ACTIVE_CLASS = 'dm-merger-time-stop-active'
export const TIME_STOP_HIDDEN_CLASS = 'dm-merger-time-stop-hidden'
export const TIME_STOP_ROOT_CLASS = 'dm-merger-time-stop-on'
```

- [ ] **步骤 2：实现收集可见弹幕节点**

```ts
export const queryDanmakuElements = (): HTMLElement[] => {
  const selectors = [
    '.bili-danmaku-x-dm',
    '.bpx-player-row-dm-wrap .bili-danmaku-x-dm',
    // 实测后补充
  ]
  const set = new Set<HTMLElement>()
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (el instanceof HTMLElement) {
        set.add(el)
      }
    })
  })
  return Array.from(set)
}
```

- [ ] **步骤 3：实现 pinAndHighlight / hideOthers / clearView**

要点：

1. `document.documentElement.classList.add(TIME_STOP_ROOT_CLASS)`
2. 对 sourceId 匹配节点：
   - 备份 style
   - `getAnimations?.().forEach(a => a.pause())`
   - 固化当前 matrix/transform 为 `transform: translate(x,y)`（或保留 computed transform）
   - 加 `TIME_STOP_ACTIVE_CLASS`
3. 对其他节点加 `TIME_STOP_HIDDEN_CLASS`
4. `clearView`：移除 class、还原 style、`play()` 动画（若仍存在）

`hideOthers` 范围：所有非当前 sourceId 的合并弹幕 + 全部原生弹幕。

- [ ] **步骤 4：写 SCSS**

```scss
html.dm-merger-time-stop-on {
  .dm-merger-time-stop-hidden {
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .dm-merger-time-stop-active {
    outline: 2px solid #7ee787 !important;
    box-shadow: 0 0 12px rgba(126, 231, 135, 0.55) !important;
    border-radius: 4px;
    z-index: 20 !important;
  }
}
```

用 `visibility:hidden` 而不是 `display:none`，降低原生布局抖动概率；若实测仍飞，再改为 pause + opacity。

- [ ] **步骤 5：浏览器冒烟**

构建组件后：

1. 人为给若干弹幕节点加 active class，确认高亮可见
2. 加 hidden class，确认其他弹幕消失

- [ ] **步骤 6：Commit**

```bash
git add registry/lib/components/video/danmaku/merger/time-stop/view.ts \
  registry/lib/components/video/danmaku/merger/merger.scss
git commit -m "feat: 时停画面钉住与高亮样式"
```

---

### 任务 3：菜单注入（时停 / 恢复切换）

**文件：**
- 创建：`registry/lib/components/video/danmaku/merger/time-stop/menu.ts`

- [ ] **步骤 1：在真实页面定位 tip DOM**

用 browser-relay / DevTools 悬停合并弹幕，记录 tip 容器选择器与按钮结构。  
预期类似：

- `.bpx-player-dm-tip`
- 内部已有点赞/复制/举报按钮

把最终选择器常量写在 `menu.ts` 顶部，禁止魔法字符串散落。

- [ ] **步骤 2：实现按钮创建与文案切换**

```ts
const BTN_ATTR = 'data-dm-merger-time-stop'
const LABEL_IDLE = '时停'
const LABEL_ACTIVE = '恢复'

export const ensureTimeStopButton = (
  tipRoot: Element,
  options: {
    sourceId: string | null
    isActiveForSource: boolean
    onClick: () => void
  },
): void => {
  if (!options.sourceId) {
    tipRoot.querySelector(`[${BTN_ATTR}]`)?.remove()
    return
  }
  let btn = tipRoot.querySelector(`[${BTN_ATTR}]`) as HTMLElement | null
  if (!btn) {
    btn = document.createElement('div')
    btn.setAttribute(BTN_ATTR, '1')
    btn.className = 'dm-merger-time-stop-btn'
    btn.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      options.onClick()
    })
    // 插入到 tip 动作区最右侧
    tipRoot.appendChild(btn)
  }
  btn.textContent = options.isActiveForSource ? LABEL_ACTIVE : LABEL_IDLE
}
```

- [ ] **步骤 3：MutationObserver / 事件委托挂载**

优先：监听 tip 出现（`childList` on player area）并注入。  
次选：在 `mouseover` 弹幕节点时延迟查找 tip。

约束：

- 非合并弹幕不插入按钮
- active 且同源：显示「恢复」
- active 但异源：显示「时停」（点击将切换源）

- [ ] **步骤 4：自测**

1. 悬停合并弹幕 → 见「时停」
2. 悬停原生弹幕 → 无按钮
3. 进入 active 后同源 → 「恢复」
4. 不破坏点赞/复制/举报点击

- [ ] **步骤 5：Commit**

```bash
git add registry/lib/components/video/danmaku/merger/time-stop/menu.ts
git commit -m "feat: 原生 tip 注入时停/恢复按钮"
```

---

### 任务 4：控制器（enter / release / discard）

**文件：**
- 创建：`registry/lib/components/video/danmaku/merger/time-stop/controller.ts`
- 创建：`registry/lib/components/video/danmaku/merger/time-stop/index.ts`

- [ ] **步骤 1：实现 `enterTimeStop(sourceId)`**

```ts
export const enterTimeStop = async (sourceId: string, deps: TimeStopDeps) => {
  if (!deps.hasSource(sourceId)) {
    deps.toast('未找到合并源，无法时停', 'error')
    return
  }
  // 已有 active：先 discard（不写 offset）
  if (isTimeStopActive()) {
    discardTimeStop()
  }
  const t0 = deps.getCurrentTime()
  const pinned = pinAndHighlight(sourceId)
  if (!pinned.length) {
    clearView()
    deps.toast('无法时停该弹幕（未找到画面节点）', 'error')
    return
  }
  hideOthers(sourceId)
  setTimeStopActive({ status: 'active', sourceId, t0, pinned })
}
```

- [ ] **步骤 2：实现 `releaseTimeStop()`**

```ts
export const releaseTimeStop = async (deps: TimeStopDeps) => {
  const s = getTimeStopState()
  if (s.status !== 'active') {
    return
  }
  const t1 = deps.getCurrentTime()
  const delta = t1 - s.t0
  const { sourceId } = s
  clearView(s.pinned)
  setTimeStopIdle()
  if (!deps.hasSource(sourceId)) {
    deps.toast('源已移除', 'error')
    return
  }
  if (delta !== 0) {
    await deps.applyOffsetDelta(sourceId, delta)
  }
  deps.toast(
    `已恢复，源偏移 ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} 秒`,
    'success',
  )
}
```

- [ ] **步骤 3：实现 `discardTimeStop()`**

```ts
export const discardTimeStop = () => {
  const s = getTimeStopState()
  if (s.status !== 'active') {
    return
  }
  clearView(s.pinned)
  setTimeStopIdle()
}
```

- [ ] **步骤 4：实现点击分发**

```ts
export const handleTimeStopButtonClick = async (
  sourceId: string,
  deps: TimeStopDeps,
) => {
  const activeId = getActiveSourceId()
  if (activeId && activeId === sourceId) {
    await releaseTimeStop(deps)
    return
  }
  await enterTimeStop(sourceId, deps)
}
```

- [ ] **步骤 5：导出 init/destroy**

`index.ts`：

```ts
export const initTimeStop = (deps: TimeStopDeps) => {
  const stopMenu = startTimeStopMenu(deps)
  return () => {
    stopMenu()
    discardTimeStop()
  }
}
```

- [ ] **步骤 6：Commit**

```bash
git add registry/lib/components/video/danmaku/merger/time-stop/
git commit -m "feat: 时停控制器 enter/release/discard"
```

---

### 任务 5：接入 runtime 与 offset 应用

**文件：**
- 修改：`registry/lib/components/video/danmaku/merger/runtime/index.ts`
- 视需要修改：`registry/lib/components/video/danmaku/merger/danmaku/engine.ts`（若缺只同步单源的方法）
- 修改：`registry/lib/components/video/danmaku/merger/index.md`

- [ ] **步骤 1：在 `initDanmakuMerger` 启动时停**

构造 deps：

```ts
const timeStopCleanup = initTimeStop({
  getCurrentTime: () => {
    const p = unsafeWindow.player
    if (p && typeof p.getCurrentTime === 'function') {
      return Number(p.getCurrentTime()) || 0
    }
    const v = document.querySelector('video')
    return v ? Number(v.currentTime) || 0 : 0
  },
  hasSource: id => !!engine.sources?.has(String(id)),
  applyOffsetDelta: async (sourceId, delta) => {
    const source = engine.sources?.get(String(sourceId))
    if (!source) {
      return
    }
    const oldOffset = Number(source.meta.offset) || 0
    engine.updateSource(sourceId, { offset: oldOffset + delta })
    // updateSource 现有实现会 rebuildList() -> syncNative()
    // 若只想同步当前分P 活跃源，可改为：
    // engine.rebuildListMeta()
    // await nativeDanmaku.fullSyncAsync(engine.getActiveSources(), undefined, { allowBurstCapture: !BiliApi.isPakkuActive() })
    document.dispatchEvent(new CustomEvent('dm-sources-updated'))
  },
  toast: (message, level = 'info') => mergerToast(message, level),
})
```

在 cleanup 中调用 `timeStopCleanup()`。

- [ ] **步骤 2：场景切换 discard**

在 `mergerVideoChangeHandler`：

```ts
if (videoChanged) {
  discardTimeStop()
  // 现有 reset...
} else if (partChanged && cid !== null) {
  discardTimeStop()
  // 现有 purge + schedulePartResync...
}
```

从 `time-stop` 导出 `discardTimeStop` 供 runtime 直接调用，或通过 cleanup 句柄暴露 `discard()`。

- [ ] **步骤 3：确认 `updateSource` 副作用**

现有：

```ts
updateSource(id, updates) {
  Object.assign(source.meta, updates)
  this.rebuildList() // rebuildListMeta + syncNative
  this.saveState()
}
```

这满足「offset 累加 + 持久化 + 重注入」。  
若 `syncNative` 过重，实现阶段可改为 `rebuildListMeta + fullSyncAsync(getActiveSources)`，但行为必须与管理面板改 offset 一致。

- [ ] **步骤 4：更新 `index.md`**

追加要点：

```md
- 悬停已合并弹幕可「时停」：同源弹幕定格，拖动进度后点「恢复」完成时间偏移
```

- [ ] **步骤 5：构建**

```bash
pnpm tsx dev-tools/dev-server/command.ts build component video/danmaku/merger production
```

预期：`功能已编译: component/video/danmaku/merger`

- [ ] **步骤 6：Commit**

```bash
git add registry/lib/components/video/danmaku/merger/runtime/index.ts \
  registry/lib/components/video/danmaku/merger/time-stop \
  registry/lib/components/video/danmaku/merger/index.md
git commit -m "feat: 接入时停到弹幕合并器运行时"
```

---

### 任务 6：端到端验收

**文件：** 无新文件；浏览器验证

- [ ] **步骤 1：安装最新本地 production 包**

```text
http://localhost:23333/registry/dist/components/video/danmaku/merger.js
```

刷新视频页。

- [ ] **步骤 2：按规格验收清单逐项测**

1. 仅合并弹幕出现「时停」
2. 时停后同源高亮定格，其他隐藏
3. 拖进度后点「恢复」，offset 累加正确
4. 管理面板显示同一 offset
5. 时停 A 再时停 B：A 丢弃，B 进入
6. 切分 P / 切视频：discard，offset 不变
7. 播放状态不被强制切换
8. 恢复后无残留 class/隐藏

- [ ] **步骤 3：记录实测中的选择器修正**

若 tip 选择器或 dmid 字段名与假设不同，只改 `menu.ts` / `source-id.ts` / `view.ts` 常量，不改产品规则。

- [ ] **步骤 4：最终 commit（若有选择器修正）**

```bash
git add registry/lib/components/video/danmaku/merger/time-stop
git commit -m "fix: 按页面实测校正时停 tip/dmid 选择器"
```

- [ ] **步骤 5：类型/lint（有改动时）**

```bash
pnpm run type
pnpm run lint-check
```

预期：通过，或仅有与本改动无关的既有问题。

---

## 规格覆盖自检

| 规格项 | 任务 |
|--------|------|
| 仅合并源入口 | 任务 3、1 |
| 时停/恢复同一按钮 | 任务 3、4 |
| 同源定格高亮 | 任务 2、4 |
| 其他弹幕隐藏 | 任务 2 |
| 播放状态不改 | 任务 4（不调用 play/pause） |
| offset 累加 | 任务 4、5 |
| 与管理面板同源字段 | 任务 5 `updateSource` |
| 无取消按钮 | 任务 3/4 无 cancel API |
| 场景切换 discard | 任务 5 |
| 单源并发 | 任务 4 enter 时 discard 旧状态 |
| 文档说明 | 任务 5 `index.md` |

## 风险与回退

1. **原生动画无法稳定 pause**  
   回退：钉住改为覆盖层克隆（规格允许的实现兜底），产品行为不变。
2. **tip DOM 结构因播放器版本变化**  
   菜单注入做成多选择器探测；失败时仅缺入口，不影响合并主流程。
3. **`updateSource` 触发全量 sync 过重**  
   可优化为活跃源 fullSync，但需保持 offset 持久化与面板一致。

## 执行说明

实现时严格按任务顺序。  
每个任务结束必须 commit。  
不要在未完成任务 1–4 时先改 runtime 大段逻辑。

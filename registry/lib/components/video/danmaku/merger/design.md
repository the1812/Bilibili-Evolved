# 弹幕合并器 BE 原生重构设计

> 版本：2.0 规划 | 基线：v1.6 (`merger-runtime.ts` 单文件 ~4100 行)  
> 仓库：`Bilibili-Evolved/registry/lib/components/video/danmaku/merger/`  
> 分支：`feat/danmaku-merger`

## 1. 目标

将油猴脚本移植版彻底重构为 **Bilibili Evolved 原生组件**：

- 消除 `GM_*` 全局垫片，统一走 BE `coreApis` / `monkeyApis` 封装
- UI 改用 Vue + `@/ui`，提示改用 `Toast` / `showDialog`
- 网络改用 `@/core/ajax`，弹幕解析复用 `converter/`
- 生命周期改用 `videoChange` + `addVideoActionButton`
- 保持核心能力不变：原生播放器双写（画面 + 右侧列表）、分 P 顺延、会话恢复

## 2. 目标目录结构

```
merger/
├── design.md                 # 本文档
├── index.ts                  # defineComponentMetadata + styledComponentEntry
├── index.md                  # 用户说明（已有）
├── options.ts                # 组件设置 + 维护操作入口
├── entry.ts                  # ComponentEntry：组装依赖、启动/清理
├── merger.scss               # 组件样式（Phase 2）
├── storage.ts                # monkeyApis 存储封装
├── api/
│   ├── bilibili.ts           # B 站 HTTP API
│   └── types.ts              # 接口类型
├── bridge/
│   └── page-bridge.ts        # 主世界 Store 捕获（无 BE 替代，必须保留）
├── danmaku/
│   ├── log.ts                # useScopedConsole 封装
│   ├── parse.ts              # XML 解析（复用 converter，Phase 2）
│   ├── inject.ts             # NativeDanmaku 注入（Phase 2）
│   └── engine.ts             # DanmakuEngine（Phase 2）
├── ui/                       # Vue 组件（Phase 2）
│   ├── MergerButton.vue
│   ├── MergerModal.vue
│   ├── ManagerModal.vue
│   └── PreviewModal.vue
└── legacy/
    └── merger-runtime.ts     # Phase 1 过渡期保留，逐步瘦身
```

Phase 1 完成后 `merger-runtime.ts` 仍承载 UI 与引擎，但 **storage / api / bridge / entry** 已独立。

## 3. BE API 复用清单

| 能力 | BE API | 参考 |
|------|--------|------|
| 工具栏按钮 | `addVideoActionButton` | `quick-favorite/index.ts` |
| SPA 切页 | `videoChange` | `airborne/index.ts` |
| Toast | `Toast` from `@/core/toast` | `danmaku/download/index.ts` |
| 确认框 | `showDialog` from `@/core/dialog` | `@/core/dialog/index.ts` |
| HTTP | `getJson`, `getText` from `@/core/ajax` | `subtitle/download/utils.ts` |
| 样式 | `styledComponentEntry` + `.scss` | `airborne/index.ts` |
| 设置 | `getComponentSettings`, `options` | `quick-favorite/options.ts` |
| 日志 | `useScopedConsole` | 当前已用 |
| 播放器就绪 | `playerReady`, `hasVideo` | `video-actions.ts` |
| 持久化 | `bilibiliEvolved.monkeyApis` 经 `storage.ts` | 本组件新建 |
| 弹幕下载/解析 | `XmlDanmaku`, `danmaku-segment` | `danmaku/download/` |

**不可替换**：`bridge/page-bridge.ts`（DmListStore hook）

## 4. 分阶段计划

### Phase 1 — 基础设施（已完成 2026-06-18）

- [x] `storage.ts`：`initStorage(monkeyApis)` + `get/set/delete/listKeys`（Agent-A）
- [x] `api/bilibili.ts`：`searchVideos`, `getView`, `getPageList`, `getDanmakuXml`（Agent-A）
- [x] `options.ts`：设置项 + 维护动作占位（Agent-A）
- [x] `danmaku/log.ts`：统一 `dmLog` / `dmWarn`（Agent-A）
- [x] `bridge/page-bridge.ts`：从 runtime 抽出桥接（Agent-B，未改 runtime）
- [x] `entry.ts` + `index.ts`：标准 `ComponentEntry`，删除 GM 垫片（Agent-C）
- [x] `merger-runtime.ts`：import 上述模块，删 ~532 行（Agent-D 独占）

### Phase 2 — UI 原生化

- [ ] Vue 弹窗替换 `innerHTML` 模态
- [ ] `MergerButton.vue` + `addVideoActionButton`
- [ ] `Toast` / `showDialog` 替换自绘提示
- [ ] `merger.scss` 替换内联 `addStyle` 字符串
- [ ] `videoChange` 替换 body `MutationObserver`

### Phase 3 — 合入准备

- [ ] 油猴菜单三项迁入 `options` 维护区
- [ ] 删除 `convert-legacy.mjs`、`legacy/merger-runtime.ts`
- [ ] 去除 `eslint-disable`，补全类型
- [ ] 独立脚本 `scripts/Bilibili_Danmaku_Merger.js` 同步策略文档化

## 5. 子代理隔离原则（必读）

> **核心规则：一个文件同一时间只归一个子代理写入。`merger-runtime.ts` Phase 1 仅由 Agent-D 独占。**

### 5.1 文件所有权表（互斥）

| 文件/目录 | 独占 Agent | 其他 Agent |
|-----------|------------|------------|
| `storage.ts` | **A** | 只读 |
| `api/types.ts` | **A** | 只读 |
| `api/bilibili.ts` | **A** | 只读 |
| `danmaku/log.ts` | **A** | 只读 |
| `options.ts` | **A** | 只读 |
| `bridge/page-bridge.ts` | **B** | 只读 |
| `entry.ts` | **C** | 只读 |
| `index.ts` | **C** | 只读 |
| `merger-runtime.ts` | **D**（集成） | **禁止触碰** |
| `design.md` | 主控 | 只读 |
| `index.md` / `convert-legacy.mjs` | 主控 | 禁止改 |

### 5.2 冻结接口契约（并行阶段不得改签名）

所有并行 Agent 必须按下列契约实现，**不得自行增删 export 名称**；需变更时由主控更新本节后再派工。

```typescript
// ── storage.ts（Agent-A 实现）──
export const DM_MERGER_KEYS_INDEX = 'dm_merger_keys_index'
export type MonkeyStorageSource = {
  GM_getValue: <T>(name: string, defaultValue?: T) => T
  GM_setValue: (name: string, value: unknown) => void
  GM_deleteValue: (name: string) => void
}
export const initStorage: (source: MonkeyStorageSource) => void
export const getStorage: () => {
  get<T>(key: string, defaultValue?: T): T
  set(key: string, value: unknown): void
  delete(key: string): void
  trackKey(key: string): void
  listMergerKeys(): string[]
}

// ── api/bilibili.ts（Agent-A 实现）──
export const searchVideos: (keyword: string, page?: number) => Promise<SearchResult>
export const getView: (bvid: string) => Promise<ViewResult>
export const getPageList: (bvid: string) => Promise<PageItem[]>
export const getDanmakuXml: (cid: number | string) => Promise<string>

// ── danmaku/log.ts（Agent-A 实现）──
export const dmLog: (...args: unknown[]) => void
export const dmWarn: (...args: unknown[]) => void

// ── bridge/page-bridge.ts（Agent-B 实现）──
export const DM_MERGER_VERSION = '1.6'
export const injectPageBridge: (pageWin: () => Window) => void

// ── entry.ts（Agent-C 实现）──
export const createMergerContext: (
  context: import('@/components/types').ComponentEntryContext,
) => Promise<() => void>
```

### 5.3 并行 vs 串行

```
Wave 1（可并行，零共享写权限）
  Agent-A  →  storage / api / danmaku/log / options
  Agent-B  →  bridge/page-bridge.ts（从 runtime 复制逻辑，不改 runtime）
  Agent-C  →  entry.ts + index.ts

Wave 2（串行，独占 merger-runtime.ts）
  Agent-D  →  仅改 merger-runtime.ts：import Wave1 模块，删重复代码

Wave 3（主控）
  编译验证 + 浏览器回归
```

**Wave 1 三个 Agent 之间没有任何共同写入文件，可安全并行。**

---

## 6. 子代理任务分配（按 Wave）

### Agent-A：基础设施（Wave 1，仅新建）

**可写：** `storage.ts`, `api/types.ts`, `api/bilibili.ts`, `danmaku/log.ts`, `options.ts`  
**禁止：** 修改 `merger-runtime.ts`、`index.ts`、`entry.ts`、`bridge/`

**任务：**

1. 按 §5.2 契约实现 `storage.ts`（`monkeyApis` 由 `initStorage` 注入，禁止 `globalThis` 垫片）
2. `api/bilibili.ts` 用 `getJson` / `getText`，对照 runtime 内 `API` 对象四个方法的 URL 与返回结构
3. `danmaku/log.ts` 封装 `useScopedConsole('弹幕合并器')`
4. `options.ts` 定义 `showMaintenanceActions: { defaultValue: true }`（Phase 3 扩展）

**验收：** 五个文件可独立 `tsc` 通过；**零处** `GM_*` 直调；不 import `./merger-runtime`。

---

### Agent-B：页面桥接（Wave 1，仅新建）

**可写：** `bridge/page-bridge.ts`  
**禁止：** 修改 `merger-runtime.ts` 及任何其他文件

**任务：**

1. **只读**打开 `merger-runtime.ts`，定位 `dmMergerPageBridgeMain` 与 `injectPageBridge`
2. 将二者**完整复制**到 `bridge/page-bridge.ts`（允许 `// @ts-nocheck`）
3. 按 §5.2 导出 `DM_MERGER_VERSION`、`injectPageBridge`
4. **不在 runtime 里做 import 替换**——留给 Agent-D

**验收：** 新文件自洽可编译；逻辑与 runtime 原桥接段一致；未产生对 runtime 的 diff。

---

### Agent-C：入口层（Wave 1，仅 entry + index）

**可写：** `entry.ts`（新建）, `index.ts`（重构）  
**禁止：** 修改 `merger-runtime.ts`、`bridge/`、`api/`、`storage.ts`

**任务：**

1. 新建 `entry.ts`：
   - 从 `unsafeWindow.bilibiliEvolved.monkeyApis` 取存储 API 调 `initStorage`
   - `await import('./merger-runtime')` 后 `return initDanmakuMerger()`
2. 重构 `index.ts`：
   - 删除 `ensureMonkeyApisPolyfill` / `ensureGmAddStylePolyfill`
   - `entry` / `reload` 改为 `createMergerContext`
   - `unload` 逻辑保留（`cleanup` + `removeStyle`）
3. **不修改 merger-runtime**——即使 import 尚未接线，也等 Agent-D

**验收：** `index.ts` 不再含 GM 垫片；`entry.ts` 符合 §5.2 签名。

---

### Agent-D：集成接线（Wave 2，独占 runtime）

**可写：** 仅 `merger-runtime.ts`  
**禁止：** 修改 Wave 1 中 A/B/C 产出的任何文件（只 import，不改签名）

**前置条件：** Agent-A、B、C 均已提交完成。

**任务（按顺序执行）：**

1. 删除 `bindMonkeyApisFromBe`、`trackMergerStorageKey`、`listMergerStorageKeys` → 改用 `getStorage()`
2. 删除内联 `dmMergerPageBridgeMain` + `injectPageBridge` → `import { injectPageBridge, DM_MERGER_VERSION } from './bridge/page-bridge'`
3. 删除内联 `API` 对象 → `import * as BiliApi from './api/bilibili'`（保持原调用方参数兼容）
4. 顶部日志 → `import { dmLog, dmWarn } from './danmaku/log'`
5. 保留 UI / 引擎 / `registerMergerMenu` 跳过逻辑不动（Phase 2 再拆）

**验收：** §7 全部通过；`merger-runtime.ts` 行数减少 ≥300 行。

---

### Agent-E：Phase 2 UI（Wave 4，Phase 1 验收后）

**可写：** `ui/*.vue`, `merger.scss`（新建）  
**禁止：** 修改 `merger-runtime.ts`（由 Agent-F 集成阶段单独处理）

---

### Agent-F：Phase 2 UI 集成（Wave 5）

**可写：** 仅 `merger-runtime.ts` 的 UI 相关函数 + `index.ts` 加 `styledComponentEntry`  
**禁止：** 改 `bridge/`、`api/`、`storage.ts`

## 7. 集成顺序（主控）

```
Wave 1 并行 ──> 主控检查契约 + 无冲突 diff
                    │
                    ▼
              Agent-D（独占 runtime）
                    │
                    ▼
              主控 dev-server + 浏览器验收
                    │
                    ▼
         Phase 2: Agent-E 并行 → Agent-F 集成
```

### 主控合并前检查清单

- [ ] `git diff --name-only` 中 Wave 1 无文件被多个 Agent 修改
- [ ] `merger-runtime.ts` 的 diff 仅出现在 Agent-D 提交后
- [ ] 各 Agent 产出符合 §5.2 冻结契约
- [ ] 无 Agent 擅自修改 `design.md` 契约节

## 8. 验收清单（Phase 1）

| 项 | 标准 |
|----|------|
| 编译 | `pnpm ts-node dev-tools/dev-server/index.ts` 请求 merger.js 成功 |
| 加载 | 控制台无 GM 相关 TypeError |
| 按钮 | `#dm-merger-btn` 存在 |
| 桥接 | `__dmMergerBridge === true` |
| 存储 | 合并后可刷新恢复（`tryRestoreSession` 不报错） |
| 回归 | BV 测试页手动合并 1 个源成功 |

## 9. 测试页

`https://www.bilibili.com/video/BV15wjV6TEux/`  
本地调试：`http://localhost:23333/registry/dist/components/video/danmaku/merger.js`

## 10. 独立油猴脚本关系

`C:\Users\xianyu\Downloads\scripts\Bilibili_Danmaku_Merger.js` 继续维护。  
Phase 3 前 BE 组件以本目录为准；`convert-legacy.mjs` 在 Phase 3 删除。
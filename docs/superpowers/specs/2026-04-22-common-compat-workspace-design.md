# 公共 compat 层 workspace 化设计

> 创建日期：2026-04-22
> 最后更新：2026-04-22（并入用户原则 + 新增 cmp-graph / cmp-graph-editor 原包扫描结果）
> 状态：已通过 brainstorming，等待实施计划
> 作者：Claude（Opus 4.7）+ sxj
> 背景分支：develop @ 4ba4924（sms-web Phase D 已完成 + csc-web 已移出 + 首版 spec 已写入）

---

## 处理原则（优先级）

对每个自研包，按顺序取第一个可行项：

1. **A 档 — 能直接升级**：原包有源码（或 lib 可反编译），fork 源码、逐文件迁 Vue 3 + Element Plus，作为新版本发到 workspace
2. **B 档 — 能用原版**：原包 Vue 独立（pure JS / WebWorker / Canvas），直接 `import 'cmp-xxx'` 在 Vue 3 下用
3. **C 档 — 写 compat**：源码不可得 + 原包无法直接用 Vue 3 → 基于业务用法反向写新实现

**包命名对齐原包名**（A 档）：新版就是原包的直接替换，不是"compat layer" 的代称。动机 d（下线原自研包）因此直接实现。

---

## 动机

sms-web 迁移期间建立的自研包兼容层（`sms-web/src/common/compat/`）即将在 cmp-web / cms-web / cos-web 三个子应用重复出现。抽成 pnpm workspace 下的公共包，按上方原则处理：

1. **减少重复工作**：cmp/cms/cos 不再复制 sms-web 的实现
2. **维护成本**：一个 bug 修一次，所有消费方受益
3. **统一设计系统**：4 个子应用的 Element Plus 风格 / tokens / 图表主题严格一致
4. **自研包下线路径**：workspace 里的 `@ss-cmp/cmp-*` 直接成为原 `cmp-*` 的新版

---

## § 1 — 仓库结构

```
ss-harness-cmp/
├── package.json                    ← 新增（root：devDeps + 脚本入口）
├── pnpm-workspace.yaml             ← 新增
├── .npmrc                          ← 新增（shared-workspace-lockfile=false）
├── packages/                       ← 新增（6 个包，Phase 4 可能追加 cmp-graph-editor）
│   ├── design-tokens/              @ss-cmp/design-tokens       （新抽象）
│   ├── utils/                      @ss-cmp/utils               （新抽象）
│   ├── cmp-element/                @ss-cmp/cmp-element         （A 档升级）
│   ├── cmp-echarts/                @ss-cmp/cmp-echarts         （A 档升级）
│   ├── cmp-topology/               @ss-cmp/cmp-topology        （A 档升级）
│   └── cmp-graph/                  @ss-cmp/cmp-graph           （A 档升级，保 g6-editor 依赖）
├── main-web/                       ← 不动（基座，已 Vue 3）
├── scr-web/                        ← 不动（已迁完，Vite 特例）
├── sms-web/                        ← Phase 2 切到 workspace 引用
├── cmp-web/ cms-web/ cos-web/      ← Phase 4-5 接入
├── cop-web/                        ← 迁移范围之外
└── original/                       ← 原 cmp-* 自研包源码（ground truth，不动）
```

### 自研包分类总表

| 自研包 | `original/` 源码状态 | 档 | 本方案动作 |
|--------|---------------------|------|------------|
| **cmp-socket** | `dist/index.js`（pure JS WebSocket 类，无 Vue 依赖） | **B** | 保持 `cmp-socket@1.0.0` 直接 import，不新建包 |
| **cmp-element** | 3 个 `components/` + 16 个 `packages/` 组件在 `lib/common.js` 里可反编译 | **A** | `@ss-cmp/cmp-element` |
| **cmp-echarts** | `hooks/` JS 源 + 8 个 `packages/` 图表在 lib | **A** | `@ss-cmp/cmp-echarts` |
| **cmp-topology** | Graph / TreeGraph 在 lib | **A** | `@ss-cmp/cmp-topology` |
| **cmp-graph** | `src/components/` 完整 5 个 .vue（ContextMenu/Editor/MiniMap/Toolbar/ToolbarSimple） | **A** | `@ss-cmp/cmp-graph`（保 `@antv/g6-editor` 依赖不升级图库） |
| **cmp-graph-editor** | 无 src，lib 是 X6 + TS 产物，反编译成本高 | **延后决定** | 不先建；Phase 4 扫 cmp-web 再定（详见 § 4 Phase 4） |

### 关键决策

- **scope 前缀**：`@ss-cmp/*`
- **包名对齐原包**：`@ss-cmp/cmp-element` / `@ss-cmp/cmp-echarts` / `@ss-cmp/cmp-topology` / `@ss-cmp/cmp-graph`（A 档："这就是原包的新版"）
- **两个新抽象**：`design-tokens`、`utils` 无原包对应，是项目共享抽象层
- **基座 main-web 不参与消费**：它是 Vue 3 + 独立栈
- **scr-web / cop-web 不参与**：scr-web 已迁完且 Vite 特例；cop-web 迁移范围之外
- **csc-web 已移出仓库**（2026-04-22 commit `9b191a5`）

---

## § 2 — 各包边界与 API

### `@ss-cmp/design-tokens`（新抽象）

**职责**：设计令牌集中定义（色板、排版、阴影、动效）+ Element Plus CSS 变量覆盖。

**目录**：
```
packages/design-tokens/
├── package.json
├── src/
│   ├── tokens.scss           SCSS 变量（从 sms-web 搬）
│   ├── element-plus.scss     :root { --el-color-primary: #{$accent}; ... }
│   └── index.ts              JS 常量副本
└── README.md
```

**消费**：
```scss
@import '@ss-cmp/design-tokens/src/element-plus.scss';
@use   '@ss-cmp/design-tokens/src/tokens.scss' as *;
```

**依赖**：零

---

### `@ss-cmp/utils`（新抽象）

**职责**：跨应用共享工具函数。纯 TS，无 Vue / DOM 依赖。

**导出**：
```ts
export { request, RequestOptions } from './request'
export { encrypt, decrypt } from './crypto'
export { formatDate, timeAgo } from './day'
export { getToken, setToken, removeToken } from './auth'
export { resolvePath } from './resolvePath'
export { uploadFile } from './uploadFile'
```

**依赖**：`axios` / `crypto-js` / `dayjs` / `js-cookie`
**peer**：无

---

### `@ss-cmp/cmp-element`（A 档：cmp-element 升级版）

**职责**：原 `cmp-element@1.0.0-5.6-release` 的 Vue 3 + Element Plus 直接替换。

**目标组件对齐原版清单**：

| 原 `packages/*` 路径 | 组件 | sms-web compat 现状 | 本包初版覆盖 |
|---------------------|------|---------------------|-------------|
| `packages/basic-form/` | BasicForm, BasicFormItem | ✅ | ✅ |
| `packages/common-detail/` | CommonDetail, CommonDetailItem | ✅ | ✅ |
| `packages/common-detail/` | CommonDetailRight, DetailContent | ❌ | ⬜ 按需补 |
| `packages/empty/` | Empty | ✅ | ✅ |
| `packages/layout/` | CardLayout, PageLayout | ❌ | ⬜ 按需补 |
| `packages/smart-table/` | SmartTable（原简单分页表，**非 AdvanceTable 别名**） | ⚠️ sms-web 别名到 AdvanceTable | ⬜ 对照原版重做 |
| `packages/status-icon/` | StatusIcon | ✅ | ✅ |
| `packages/svg-icon/` | SvgIcon | ✅ | ✅ |
| `packages/table/` | BasicTable, AdvanceTable | ✅ | ✅ |
| `packages/table/` | AdvanceTableColumn | ❌ | ⬜ 按需补 |
| `packages/table-search/` | TableSearch | ✅（Phase D 补） | ✅ |
| `components/code-mirror/` | CodeMirror | ❌ | ⬜ 按需补 |
| `components/full-screen/` | FullScreen | ❌ | ⬜ 按需补 |
| `components/json-view/` | JsonView | ❌ | ⬜ 按需补 |

**策略**：Phase 2 先搬 sms-web 已有 10 个组件；缺的 6-7 个按 cmp-web / cms-web / cos-web 实际使用分批补；每补一个先读 `original/cmp-element/lib/cmp-element.common.js` 里对应的 webpack concat module 段，还原 prop/slot/event/SCSS 类名，再用 Vue 3 + Element Plus 重写。

**导出**：
```ts
// 每组件独立 named export
export { default as BasicForm } from './BasicForm.vue'
export { default as AdvanceTable } from './AdvanceTable.vue'
// ...
export function registerCmpElement(app: App): void  // PascalCase + kebab-case 双注册
```

**依赖**：`@ss-cmp/design-tokens`（workspace:*）
**peer**：`vue@^3.4`、`element-plus@^2.7`、`@element-plus/icons-vue@^2.3`

---

### `@ss-cmp/cmp-echarts`（A 档：cmp-echarts 升级版）

**职责**：原 `cmp-echarts@2.0.0-5.6-release` 的 Vue 3 重写，echarts v4 → v5。

**目标组件清单**：

| 原 `packages/*` 路径 | 组件 | sms-web compat | 本包初版 |
|--------------------|------|---------------|---------|
| `bar-charts/` | BarCharts | ✅ | ✅ |
| `bar-reverse-charts/` | BarReverseCharts | ✅ | ✅ |
| `line-charts/` | LineCharts | ✅ | ✅ |
| `pie-charts/` | PieCharts | ✅ | ✅ |
| `gauge-charts/` | GaugeCharts | ✅ | ✅ |
| `liquid-fill-charts/` | LiquidFillCharts | ✅ | ✅ |
| `loop-charts/` | LoopCharts | ⚠️ sms-web 别名到 PieCharts | ⬜ 对照原版确认/重做 |
| `graph-charts/` | GraphCharts | ❌ | ⬜ 按需补 |

**共享 composable**：`useChart`
- 参考 `original/cmp-echarts/hooks/useChart.js` + `hooks/echarts.js`（原主题 / 色板 / 默认配置）
- 合并 sms-web compat 的空值防护（pitfall #5）

**导出**：
```ts
export { default as BarCharts } from './BarCharts.vue'
// ...
export { useChart } from './useChart'
export function registerCmpEcharts(app: App): void
```

**依赖**：`@ss-cmp/design-tokens`、`echarts@^5.5`、`echarts-liquidfill@^3.1`
**peer**：`vue@^3.4`

---

### `@ss-cmp/cmp-topology`（A 档：cmp-topology 升级版）

**职责**：原 `cmp-topology@1.0.0`（G6 v3 关系图）的 Vue 3 重写。

**目标组件**：

| 原路径 | 组件 / 模块 | 初版 |
|--------|-------------|------|
| `packages/graph/Graph.vue` | Graph（通用关系图） | ⬜ Phase 4 cmp-web 迁移期间建 |
| `packages/graph/TreeGraph.vue` | TreeGraph（树形图） | ⬜ 同上 |
| `packages/graph/config.js` | 默认节点/边样式 | ⬜ 保持 API 形态 |
| `packages/graph/registerDefault.js` | G6 自定义节点/边注册 | ⬜ 同上 |

**还原方式**：从 `original/cmp-topology/lib/cmp-topology.common.js` 的 webpack concat module 段还原 .vue 源（props / methods / template）+ registerDefault.js 的 G6 API 调用。

**依赖**：`@ss-cmp/design-tokens`、`@antv/g6@^3.5`（**保持 G6 v3，不升级到 v4/v5，避免一次改两件事**）
**peer**：`vue@^3.4`

---

### `@ss-cmp/cmp-graph`（A 档：cmp-graph 升级版）

**职责**：原 `cmp-graph@1.0.0`（@antv/g6-editor 老版图编辑器壳）的 Vue 3 重写。

**目标组件**（`original/cmp-graph/src/components/` 5 个）：
- ContextMenu.vue — 右键上下文菜单
- Editor.vue — 核心编辑器壳
- MiniMap.vue — 缩略图
- Toolbar.vue — 工具栏（完整）
- ToolbarSimple.vue — 工具栏（精简）

**决策记录**：保留 `@antv/g6-editor@^1.2.0` 依赖（已 archived 但 npm 可装）。**不顺便升级到 g6@4+**，避免 Vue 框架迁移叠加图库 API 重写风险。g6-editor → g6@4 的独立升级作为后续议题，非本次范围。

**还原方式**：直接读 `original/cmp-graph/src/components/*.vue`（源码完整可用），逐文件 Vue 2 → Vue 3：
- Options API → `<script setup>`
- `this.graph` / `this.editor` 实例保持
- mixins → composable（若有）

**依赖**：`@ss-cmp/design-tokens`、`@antv/g6-editor@^1.2.0`
**peer**：`vue@^3.4`

---

### `cmp-socket`（B 档：用原包）

**职责**：WebSocket 心跳重连封装。

**处理**：**不新建 workspace 包**。所有子应用继续 `"cmp-socket": "1.0.0"` 从 npm / 原有链接直接安装。sms-web 已在 Vue 3 下跑通此包 → 证明 Vue 独立。

**源码备查**：`original/cmp-socket/dist/index.js`（pure JS WebSocket 类：CreateSocket / ReConnect / Destroy / HeartCheck / send）

---

### `cmp-graph-editor`（档次延后）

**职责**：X6 流程编辑器。

**处理**：Phase 4 cmp-web 前置扫描后决定（见 § 4）：
- 扫到有用 → 建 `@ss-cmp/cmp-graph-editor`（反编译 lib，成本高）
- 用量小 → inline 到 cmp-web/src/common/
- 没用 → 跳过

---

### 跨包依赖图

```
                     ┌────────────────────────┐
                     │ @ss-cmp/design-tokens  │  （纯样式/常量，零依赖）
                     └─────────┬──────────────┘
                               │
        ┌──────────────────────┼───────────────────────────────────┐
        │             │        │        │                          │
  ┌─────▼─────┐  ┌────▼────┐  ┌▼──────┐  ┌▼──────────────┐
  │ /cmp-     │  │ /cmp-   │  │ /cmp- │  │ /cmp-graph    │
  │ element   │  │ echarts │  │ topo- │  │ (g6-editor)   │
  │ (EP)      │  │ (e5)    │  │ logy  │  │               │
  │           │  │         │  │ (g6v3)│  │               │
  └───────────┘  └─────────┘  └───────┘  └───────────────┘

@ss-cmp/utils           （独立树；纯 TS；不依赖 tokens）
cmp-socket              （原包，不在 workspace）
```

### 关键技术决策

1. **peer 依赖 Vue / Element Plus / echarts / g6**：Qiankun 沙箱多实例会失控，每个子应用独立持有一份
2. **源码直接引用，不预编译**：`main` 指向 `src/index.ts`，Vue CLI / Vite 转译；发 npm 时再加 build step
3. **SCSS 保留 `.scss` 文件**：不预编译为 CSS，让消费方可覆盖 SCSS 变量
4. **无单独测试栈**：正确性在消费应用的 E2E / 浏览器验收里确认
5. **图库版本保持原版**：cmp-topology 保 G6 v3，cmp-graph 保 g6-editor；图库升级作为独立议题

---

## § 3 — 消费方改造

### root 新增文件

**`pnpm-workspace.yaml`**：
```yaml
packages:
  - 'packages/*'
  - 'main-web'
  - 'scr-web'
  - 'sms-web'
  - 'cmp-web'
  - 'cms-web'
  - 'cos-web'
  - 'cop-web'
```

**`package.json`**（root）：
```json
{
  "name": "ss-harness-cmp",
  "private": true,
  "packageManager": "pnpm@9.x",
  "scripts": {
    "dev:sms": "pnpm --filter sms-web serve",
    "build:sms": "pnpm --filter sms-web build"
  },
  "devDependencies": {
    "typescript": "~5.4.0"
  }
}
```

**`.npmrc`**：
```
shared-workspace-lockfile=false
```

### 子应用 `package.json` diff（以 sms-web 为例）

```diff
  "dependencies": {
+   "@ss-cmp/design-tokens": "workspace:*",
+   "@ss-cmp/utils": "workspace:*",
+   "@ss-cmp/cmp-element": "workspace:*",
+   "@ss-cmp/cmp-echarts": "workspace:*",
    "cmp-socket": "1.0.0",                          (B 档：原样保留)
    "element-plus": "^2.7.0",
    "echarts": "^5.5.0",
    "vue": "^3.4.0"
  }
```
> sms-web 不加 `@ss-cmp/cmp-topology` 或 `@ss-cmp/cmp-graph`（sms-web 业务不涉及图）
> cmp-web 加全部 4 个 `@ss-cmp/cmp-*` 包

### `main.ts` diff

```diff
+ import '@ss-cmp/design-tokens/src/element-plus.scss'
  import App from './App.vue'

- import { registerCompatComponents } from './common/compat'
+ import { registerCmpElement } from '@ss-cmp/cmp-element'
+ import { registerCmpEcharts } from '@ss-cmp/cmp-echarts'

  const app = createApp(App)
- registerCompatComponents(app)
+ registerCmpElement(app)
+ registerCmpEcharts(app)
```

### `vue.config.js` diff

```diff
  module.exports = {
+   transpileDependencies: [/@ss-cmp\//],
  }
```

### `tsconfig.json` diff

```diff
  {
    "compilerOptions": {
      "moduleResolution": "bundler"
    },
+   "include": ["src/**/*", "../packages/*/src/**/*"]
  }
```

### 业务层模板改动

全局注册的 `<advance-table>` / `<common-detail>` / `<basic-form>` 等**模板不变**（名字一致）。
少量直接 import 的地方用 node 脚本批量替换：
```
from '@/common/compat'   →   from '@ss-cmp/cmp-element'（UI 组件）
from '@/common/compat'   →   from '@ss-cmp/cmp-echarts'（图表）
@import './tokens'       →   @use '@ss-cmp/design-tokens/src/tokens.scss' as *
```

---

## § 4 — 迁移 Phase 拆分

```
Phase 0   准备          ~30 min    打 tag / 切分支 / 对齐
Phase 1   Workspace 骨架 ~2 h      建 root + packages 空壳 + 验证独立 install
Phase 2   sms-web 抽出   ~4-6 h    搬 compat + 改 import + 验证（原子提交）
Phase 3   sms-web 验收   ~1-2 h    build + 浏览器 smoke test + merge develop
Phase 4   cmp-web 接入             Phase A-D + 补 cmp-topology / cmp-graph 实现
Phase 5   cms-web / cos-web        复用 cmp-web 模板
Phase 6   npm publish              未来，非本轮
```

### Phase 0：准备

```
[ ] 从 develop 切出 chore/introduce-workspace 分支
[ ] git tag before-workspace （回滚锚点）
[ ] 确认所有子应用当前可构建（sms-web + main-web 已验）
[ ] 记录 sms-web node_modules 大小 / lockfile 校验和（对比基线）
```

### Phase 1：Workspace 骨架

```
[ ] 新增 pnpm-workspace.yaml / root package.json / .npmrc
[ ] 建 packages/ 目录 + 6 个子目录 + 每个 package.json 占位
[ ] 读 original/cmp-*/ 源码 / lib 反编译，对照 sms-web compat，在每包 README.md 写"对齐清单"
[ ] pnpm install（root 级 + 每子应用级）
[ ] sms-web build + serve 验证零副作用
[ ] commit: chore(workspace): introduce pnpm workspace scaffold (empty packages)
```

### Phase 2：sms-web compat 抽出（原子提交）

**前置阅读**：
```
[ ] 读 original/cmp-element/lib/cmp-element.common.js 的 webpack concat module 段
[ ] 对比 sms-web compat 当前 prop / slot / event，补齐差异（只补不删）
[ ] 同样方式读 original/cmp-echarts/hooks/useChart.js 对齐 useChart composable
```

**搬家 + 切换**（同一 commit）：
```
[ ] git mv sms-web/src/common/compat/tokens.scss                         → packages/design-tokens/src/
[ ] 新建 packages/design-tokens/src/element-plus.scss
[ ] git mv sms-web/src/common/compat/{BasicForm,BasicFormItem,BasicTable,AdvanceTable,TableSearch,CommonDetail,CommonDetailItem,StatusIcon,SvgIcon,Empty}.vue → packages/cmp-element/src/
[ ] git mv sms-web/src/common/compat/useChart.ts                         → packages/cmp-echarts/src/
[ ] git mv sms-web/src/common/compat/*Charts.vue                         → packages/cmp-echarts/src/
[ ] git mv sms-web/src/common/utils/{auth,crypto,day,request,resolvePath,uploadFile}.ts → packages/utils/src/
[ ] 每包 src/index.ts 导出 + register{CmpElement,CmpEcharts} 函数
[ ] 每包 package.json 填 deps / peerDeps / version 0.1.0
[ ] 改 sms-web/src/main.ts（见 § 3 diff）
[ ] 改 sms-web/vue.config.js 加 transpileDependencies
[ ] 改 sms-web/tsconfig.json 扩 include
[ ] grep 改 sms-web 下剩余直接 import 位置
[ ] 批量改 .vue 里 @import './tokens' → @use
[ ] 删空的 sms-web/src/common/compat/（若遗留）
[ ] pnpm --filter sms-web install
[ ] commit: feat(workspace): extract sms-web compat into @ss-cmp/* packages
```

### Phase 3：sms-web 验收

```
[ ] eslint 0 errors（sms-web + 所有 packages）
[ ] pnpm --filter sms-web build 通过
[ ] pnpm --filter sms-web serve + 浏览器 smoke test：
    - 登录 + 资源总览（首屏 + 图表）
    - 租户列表点名字 → CommonDetail + 返回
    - 审计日志 "归档记录" → TableSearch
    - 任一监控页（ECharts）
[ ] merge chore/introduce-workspace → develop (--no-ff)
[ ] push origin develop
[ ] 更新 docs/migration/compat-layer.md
[ ] 更新 .claude/memory/project_cmp_harness.md
```

### Phase 4：cmp-web 接入（首个"零本地 compat"迁移）

**前置扫描**（迁移开始前）：
```
[ ] grep cmp-web/src 用到的 cmp-element 组件（<basic-table / <common-detail / <advance-table / <smart-table / <card-layout / <code-mirror / <json-view / <full-screen ...）
[ ] grep cmp-web/src 用到的 cmp-echarts 图表（含 <graph-charts / <loop-charts）
[ ] grep cmp-web/src 用到的 cmp-topology（<graph> / <tree-graph>）
[ ] grep cmp-web/src 用到的 cmp-graph（<editor> / <mini-map> / <toolbar> / <context-menu>）
[ ] grep cmp-web/src 用到的 cmp-graph-editor（<flow-editor> / <flow-rect> 或从 cmp-graph-editor import）
[ ] 根据扫描结果：
    - cmp-topology 用量：决定 Phase 4 期间 packages/cmp-topology 的实现深度
    - cmp-graph 用量：同上
    - cmp-graph-editor：
      * 用量 ≥ 3 处 → Phase 4 建 @ss-cmp/cmp-graph-editor（反编译 lib）
      * 用量 1-2 处 → 内联 cmp-web/src/common/graph-editor/
      * 没用 → 跳过
```

**执行**：按 `.claude/skills/vue2-to-vue3-migration/SKILL.md` Phase A-D，差异：
- Stage 1 不建本地 src/common/compat/；package.json 加 4 个 `@ss-cmp/cmp-*` 包
- main.ts 注册全部 register*
- 期间边迁边补 packages/cmp-topology / packages/cmp-graph（读 original/ 源码 / 反编译）
- 期间边迁边补 @ss-cmp/cmp-element 缺失组件（CardLayout / CodeMirror 等）

### Phase 5：cms-web / cos-web

套 cmp-web 模板。packages/ 此时组件较完整，两子应用大概率"零新增"。

### Phase 6：npm publish（未来）

```
[ ] 每个 packages/*/package.json 加 build script: tsc + vue-tsc
[ ] publishConfig.main = dist/index.js / publishConfig.types
[ ] 配置私有 npm registry
[ ] pnpm changeset 管理版本
[ ] pnpm publish --filter @ss-cmp/*
```

---

## § 5 — 回滚 / 测试 / 成功标准

### 回滚策略

| Phase | 回滚命令 | 恢复状态 |
|-------|---------|---------|
| 1 | `git reset --hard before-workspace` （Phase 0 打的 tag） | 零 workspace，子应用独立 |
| 2 | `git revert <Phase 2 commit>` | sms-web 回到本地 compat 模式 |
| 3 | 同 Phase 2；若已 merge develop 需 revert-merge | 同上 |
| 4-5 | 每个子应用 feature 分支独立回滚（见 `docs/operations/rollback.md`） | 该子应用回 Vue 2 |

### 测试 / 验证关卡

| 关卡 | 验证项 | 工具 |
|------|-------|------|
| Phase 1 后 | sms-web build 通过；node_modules 大小接近不变 | `pnpm build` + `du -sh` |
| Phase 2 提交前 | eslint 0；sms-web build + `vue-tsc --noEmit` 通过 | `pnpm build` + `vue-tsc` |
| Phase 3 | 5 个主页面手测 | Chrome DevTools |
| Phase 3 | sms-web 在基座内 mount + 切到 scr-web | main-web + sms-web + scr-web dev 并发 |
| Phase 3 | build 产物体积 vs Phase 0；预期 ±5% | `du -sh` |
| Phase 4+ | 每子应用走 `docs/migration/lifecycle.md` Phase D 7 步 | 已定义 |

### 成功标准

- [ ] `packages/` 下 6 个包均可独立 `pnpm --filter ... build`（Phase 6 时达成）
- [ ] sms-web 不含 `src/common/compat/` 和 `src/common/utils/`，全部依赖 `@ss-cmp/*`
- [ ] cmp-web / cms-web / cos-web 迁移完成时无本地 compat
- [ ] `grep -r 'from .@/common/compat' {sms,cmp,cms,cos}-web/src` 为空
- [ ] 任一 compat 组件 bug fix 在 `packages/` 提一次 commit 即生效于所有消费方
- [ ] 各包 API 与 `original/cmp-*/` 源码对齐（prop/slot/event/SCSS 类名）
- [ ] cmp-socket 保持 `cmp-socket@1.0.0` 不变（B 档验证 → 工作）

### 显式放弃项

- ❌ Vue 3.5 / 未来版本升级
- ❌ 重构业务组件（只搬 compat）
- ❌ 改 Qiankun 基座 main-web
- ❌ 引入 turbo / nx 等 monorepo 任务编排
- ❌ 加 CI pipeline 新步骤
- ❌ csc-web 相关（已移出仓库）
- ❌ 图库升级（g6-editor → g6@4+ / G6 v3 → v4+）—— 独立议题
- ❌ cmp-graph-editor 预先实现 —— Phase 4 按需决定

---

## § 6 — 原包源码作 ground truth

所有 `@ss-cmp/cmp-*` 包（A 档）的 API 设计必须以 `D:\harnes-test\ss-harness-cmp\original\` 下对应原包源码为准：

- **prop 名 / 类型 / 默认值**：对齐原版
- **event / slot 名**：对齐原版
- **method（通过 `defineExpose`）**：对齐原版
- **SCSS 类名**：对齐原版（业务模板的 CSS 选择器依赖它们）

### 原包源码清单

| 原包 | `original/` 位置 | 形态 |
|------|------------------|------|
| cmp-element | `original/cmp-element/` | 3 个 components/ 源 + 完整 `lib/cmp-element.common.js`（16 个 packages/ 组件可通过 webpack concat module 注释反编译） |
| cmp-echarts | `original/cmp-echarts/` | `hooks/` JS 源（useChart / echarts 主题）+ `lib/cmp-echarts.common.js`（8 个图表） |
| cmp-socket | `original/cmp-socket/` | `dist/index.js`（pure JS WebSocket 类，可读） |
| cmp-topology | `original/cmp-topology/` | `lib/cmp-topology.common.js`（Graph, TreeGraph, config, registerDefault） |
| cmp-graph | `original/cmp-graph/` | **完整 src/**（5 个 .vue：ContextMenu/Editor/MiniMap/Toolbar/ToolbarSimple）+ dist/ |
| cmp-graph-editor | `original/cmp-graph-editor/` | 仅 `lib/cmp-graph-editor.common.js`（X6 + TS 产物）；反编译难度大 |

### 设计偏离原版的情况

凡与原版行为不一致处，必须在对应包的 `README.md` 写入"与原版差异"章节：

1. **Element Plus 强制 API 差异**（`:visible.sync` → `v-model`、`@click.native` → `@click` 等）
2. **性能优化 / bug 修复**（记 CHANGELOG）
3. **Vue 3 架构差异**（mixins → composable；Options API → script setup）—— 保留原行为，只换实现

---

## § 7 — 风险与对策

| 风险 | 可能性 | 影响 | 对策 |
|------|--------|------|------|
| `transpileDependencies` 没覆盖 workspace 包 → 生产 build 报 "Unexpected token" | 中 | sms-web 构建失败 | Phase 2 commit 前手动 build 验证；正则匹配 `/@ss-cmp\//` 全部 |
| 多版本 echarts 导致 Qiankun 沙箱冲突 | 低 | 图表错乱 | cmp-echarts 只 peer echarts；consumer 显式装；workspace pin 相同版本 |
| SCSS `@import` → `@use` 导致变量作用域变化 | 中 | 样式异常 | Phase 2 逐文件改；build 产出 CSS 与 Phase 0 diff 对比 |
| webpack `symlinks: false` 被某处设置 → workspace link 失效 | 低 | 子应用看不到 packages/ 改动 | Phase 1 验证时 grep 配置确认 |
| sms-web `registerCompatComponents` 签名改动 | 低 | 非 Qiankun 注册路径失效 | 新函数 `registerCmpElement + registerCmpEcharts` 并存，不做签名复用 |
| @antv/g6-editor@1.2.0 已 archived，npm 包未来可能消失 | 低 | cmp-graph 装不上 | 备份包到内网 registry；若 npm 撤包，用本地 `.tgz` 锁死 |
| cmp-topology 用的 G6 v3 与其他图库（如 cmp-graph 用 g6-editor 内嵌 G6）版本冲突 | 低 | 图例渲染异常 | 两个包各自 peer 自己的图库版本；webpack externals 正确配置 |
| cmp-graph-editor 源码无 src → Phase 4 若需实现，反编译 X6 + TS 难度大 | 中 | Phase 4 周期拖长 | § 4 Phase 4 前置扫描明确分流（用量 ≥ 3 / 1-2 / 0 对应三种处置） |
| original/ 仅有 build 产物的组件，API 还原不准（cmp-element/BasicForm 等） | 中 | compat 行为不符业务期望 | webpack concat module 段保留 .vue 源码注释；读 render / methods / props 区还原；配合消费方实际用法交叉验证 |

---

## 附录 A — 本方案与 CLAUDE.md / docs/ 的关系

- **不改 CLAUDE.md 主线**：CLAUDE.md 只做身份 + 迁移状态 + 导航，workspace 方案属迁移技术细节
- **新增 `docs/migration/compat-layer.md` 的 workspace 章节**：Phase 3 完成后补写
- **不改 `docs/migration/lifecycle.md`**：Phase A-D 流程仍适用，只是 Stage 1 基础层不建本地 compat
- **更新 `.claude/memory/project_cmp_harness.md`**：Phase 3 完成后记录 workspace 就绪
- **追加 `.claude/memory/project_cmp_pitfalls.md` 条目**：Phase 2/3 期间发现的 workspace 相关踩坑
- **修订 CLAUDE.md "自研包不可升级源码" 的约束**：改为"视情况升级（A 档优先），不可得时用原包（B）或写 compat（C）"

---

## 附录 B — 决策日志

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-04-22 | 用 pnpm workspace（不切 Vite、不独立 repo） | 契合动机 d（将来发 npm）；开发体验最好 |
| 2026-04-22 | 包按领域拆，非单一大包 | 动机 d 要求包边界对齐原 cmp-*；tree-shaking 友好 |
| 2026-04-22 | sms-web 先抽出（而非 cmp-web 先用复制） | sms-web 是"已知正确"的实现；cmp-web 不应承担 "迁移 + 验证新架构" 双重风险 |
| 2026-04-22 | peer 依赖 Vue / Element Plus / echarts / g6 | Qiankun 沙箱多实例冲突；bundle size |
| 2026-04-22 | 源码直接引用（不预编译）至少到 Phase 5 | 开发体验最好；发 npm 时再加 build |
| 2026-04-22 | utils 独立于 tokens，不被 UI 包依赖 | 纯函数域；解耦 |
| 2026-04-22 | 共享 lockfile=false，保留每应用独立 pnpm-lock.yaml | 保留现有隔离模型 |
| 2026-04-22 | 包名对齐原包（`@ss-cmp/cmp-element` 而非 `@ss-cmp/ui-compat`） | 用户原则："能升级的就升级"；A 档 = 原包新版，不是 compat |
| 2026-04-22 | cmp-socket 走 B 档（用原包不新建） | pure JS WebSocket wrapper 无 Vue 依赖；sms-web 已验 |
| 2026-04-22 | cmp-graph 走 A 档（升级源码），保留 `@antv/g6-editor@1.2.0` 依赖 | 原 src/ 完整可读；不叠加图库升级风险（g6-editor → g6@4 作独立议题） |
| 2026-04-22 | cmp-topology 走 A 档，保留 G6 v3 | 同上，避免一次改两件事 |
| 2026-04-22 | cmp-graph-editor 延后决定 | 无 src，反编译 X6+TS 成本高；Phase 4 前置扫描后按用量分流（3+/1-2/0） |

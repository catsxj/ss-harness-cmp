# 公共 compat 层 workspace 化设计

> 创建日期：2026-04-22
> 状态：已通过 brainstorming，等待实施计划
> 作者：Claude（Opus 4.7）+ sxj
> 背景分支：develop @ 9b191a5（sms-web Phase D 已完成 + csc-web 已移出）

---

## 动机

sms-web 迁移期间建立的自研包 compat 层（`sms-web/src/common/compat/`）即将在 cmp-web / cms-web / cos-web 三个子应用重复出现。为避免 "4 份代码 / 4 份 bug" 局面，将 compat 抽成 pnpm workspace 下的公共包，同时为将来把 compat 升级成新版自研包（替换原 cmp-element / cmp-echarts / cmp-topology）铺路。

四个动机同时成立：
1. **减少重复工作**：cmp/cms/cos 不再复制 sms-web 的 compat
2. **维护成本**：一个 bug 修一次，所有消费方受益
3. **统一设计系统**：4 个子应用的 Element Plus 风格 / tokens / 图表主题严格一致
4. **自研包下线路径**：compat 将来直接替换 cmp-element/cmp-echarts/cmp-topology 的 npm 包

---

## § 1 — 仓库结构

```
ss-harness-cmp/
├── package.json                    ← 新增（root：devDeps + 脚本入口）
├── pnpm-workspace.yaml             ← 新增
├── .npmrc                          ← 新增（shared-workspace-lockfile=false）
├── packages/                       ← 新增
│   ├── design-tokens/              @ss-cmp/design-tokens
│   ├── utils/                      @ss-cmp/utils
│   ├── ui-compat/                  @ss-cmp/ui-compat
│   ├── charts-compat/              @ss-cmp/charts-compat
│   └── graph-compat/               @ss-cmp/graph-compat
├── main-web/                       ← 不动（基座，已 Vue 3，无 compat 需求）
├── scr-web/                        ← 不动（已迁完，Vite 特例）
├── sms-web/                        ← Phase 2 切到 workspace 引用
├── cmp-web/ cms-web/ cos-web/      ← Phase 4-5 接入
├── cop-web/                        ← 迁移范围之外
└── original/                       ← 原 cmp-* 自研包源码（ground truth，不动）
```

### 关键决策

- **scope 前缀**：`@ss-cmp/*`
- **基座不参与消费**：main-web 是 Vue 3 + 独立栈，不依赖 compat
- **scr-web / cop-web 不参与**：scr-web 已迁完且是 Vite 特例；cop-web 在迁移范围之外
- **csc-web 已移出仓库**（2026-04-22 commit `9b191a5`）

---

## § 2 — 各包边界与 API

### `@ss-cmp/design-tokens`

**职责**：设计令牌集中定义（色板、排版、阴影、动效）+ Element Plus CSS 变量覆盖。

**目录**：
```
packages/design-tokens/
├── package.json
├── src/
│   ├── tokens.scss           SCSS 变量（从 sms-web/src/common/compat/tokens.scss 搬）
│   ├── element-plus.scss     :root { --el-color-primary: #{$accent}; ... }
│   └── index.ts              导出 JS 常量副本
└── README.md
```

**消费方式**：
```scss
/* 子应用 main.scss */
@import '@ss-cmp/design-tokens/src/element-plus.scss';
```
```scss
@use '@ss-cmp/design-tokens/src/tokens.scss' as *;
.foo { color: $accent; }
```

**依赖**：零

---

### `@ss-cmp/utils`

**职责**：跨应用共享工具函数。纯 TS，无 Vue / DOM 依赖。

**导出**：
```ts
export { request, RequestOptions } from './request'      // axios 封装 + 拦截器骨架
export { encrypt, decrypt } from './crypto'              // crypto-js 封装
export { formatDate, timeAgo } from './day'              // dayjs 封装
export { getToken, setToken, removeToken } from './auth' // cookie 封装
export { resolvePath } from './resolvePath'
export { uploadFile } from './uploadFile'
```

**依赖**：`axios` / `crypto-js` / `dayjs` / `js-cookie`
**peer**：无

---

### `@ss-cmp/ui-compat`

**职责**：`cmp-element` 自研包的 Vue 3 + Element Plus 重写。

**目标组件（对齐原版 `original/cmp-element/`）**：

| 源路径 | 组件 | sms-web compat 现状 | packages 初版覆盖 |
|--------|------|---------------------|-------------------|
| `packages/basic-form/` | BasicForm, BasicFormItem | ✅ | ✅ |
| `packages/common-detail/` | CommonDetail, CommonDetailItem | ✅ | ✅ |
| `packages/common-detail/` | CommonDetailRight, DetailContent | ❌ | ⬜ 按需补 |
| `packages/empty/` | Empty | ✅ | ✅ |
| `packages/layout/` | CardLayout, PageLayout | ❌ | ⬜ 按需补 |
| `packages/smart-table/` | SmartTable（简单分页表） | ⚠️ sms-web 别名到 AdvanceTable | ⬜ 对照原版重做 |
| `packages/status-icon/` | StatusIcon | ✅ | ✅ |
| `packages/svg-icon/` | SvgIcon | ✅ | ✅ |
| `packages/table/` | BasicTable, AdvanceTable | ✅ | ✅ |
| `packages/table/` | AdvanceTableColumn | ❌ | ⬜ 按需补 |
| `packages/table-search/` | TableSearch | ✅（刚补） | ✅ |
| `components/code-mirror/` | CodeMirror | ❌ | ⬜ 按需补 |
| `components/full-screen/` | FullScreen | ❌ | ⬜ 按需补 |
| `components/json-view/` | JsonView | ❌ | ⬜ 按需补 |

**策略**：先搬 sms-web 已有 10 个（表格上 ✅），缺的 6-7 个按 cmp-web / cms-web / cos-web 实际使用场景分批补；每补一个先读 `original/cmp-element/lib/cmp-element.common.js` 里对应的 webpack concat module 段，还原 prop/slot/event/SCSS 类名，再用 Vue 3 + Element Plus 重写。

**导出**：
```ts
export { default as BasicForm } from './BasicForm.vue'
// ... 每个组件独立 named export
export function registerUiCompat(app: App): void  // PascalCase + kebab-case 双注册
```

**依赖**：`@ss-cmp/design-tokens`（workspace:*）
**peer**：`vue@^3.4`、`element-plus@^2.7`、`@element-plus/icons-vue@^2.3`

---

### `@ss-cmp/charts-compat`

**职责**：`cmp-echarts` 自研包的 Vue 3 重写，基于 `echarts@5.5` + `echarts-liquidfill@3.1`。

**目标组件（对齐原版 `original/cmp-echarts/`）**：

| 源路径 | 组件 | sms-web compat 现状 | packages 初版覆盖 |
|--------|------|---------------------|-------------------|
| `packages/bar-charts/` | BarCharts | ✅ | ✅ |
| `packages/bar-reverse-charts/` | BarReverseCharts | ✅ | ✅ |
| `packages/line-charts/` | LineCharts | ✅ | ✅ |
| `packages/pie-charts/` | PieCharts | ✅ | ✅ |
| `packages/gauge-charts/` | GaugeCharts | ✅ | ✅ |
| `packages/liquid-fill-charts/` | LiquidFillCharts | ✅ | ✅ |
| `packages/loop-charts/` | LoopCharts | ⚠️ sms-web 别名到 PieCharts | ⬜ 对照原版确认/重做 |
| `packages/graph-charts/` | GraphCharts | ❌ | ⬜ 按需补 |

**共享 composable**：`useChart`
- 参考 `original/cmp-echarts/hooks/useChart.js` + `hooks/echarts.js`（原版主题 / 色板 / 默认配置）
- merge sms-web compat 里新增的空值防护（pitfall #5）

**导出**：
```ts
export { default as BarCharts } from './BarCharts.vue'
// ... 每个组件 named export
export { useChart } from './useChart'
export function registerChartsCompat(app: App): void
```

**依赖**：`@ss-cmp/design-tokens`、`echarts@^5.5`、`echarts-liquidfill@^3.1`
**peer**：`vue@^3.4`

---

### `@ss-cmp/graph-compat`

**职责**：`cmp-topology`（含 `cmp-graph`、`cmp-graph-editor`，若能找到源码）的 Vue 3 wrapper，基于 `@antv/g6`。

**目标组件（对齐原版 `original/cmp-topology/packages/graph/`）**：

| 源路径 | 组件 / 模块 | 初版覆盖 |
|--------|-------------|----------|
| `packages/graph/Graph.vue` | GraphWrapper（通用关系图） | ⬜ Phase 4 cmp-web 迁移期建 |
| `packages/graph/TreeGraph.vue` | TreeGraphWrapper（树形图） | ⬜ 同上 |
| `packages/graph/config.js` | 默认节点/边样式 | ⬜ 保持 API 形态 |
| `packages/graph/registerDefault.js` | G6 自定义节点/边注册 | ⬜ 同上 |

**cmp-graph / cmp-graph-editor 源码待定**：`original/` 里只有 cmp-topology；另外两个包的源码需要从 sms-web 外的项目 node_modules 缓存反向恢复，或找到原始 git repo。Phase 4 cmp-web 分析阶段确定。

**依赖**：`@ss-cmp/design-tokens`、`@antv/g6@^4.6`
**peer**：`vue@^3.4`

---

### 跨包依赖图

```
                       ┌─────────────────────────┐
                       │ @ss-cmp/design-tokens   │  （纯样式/常量，零依赖）
                       └──────────┬──────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
      ┌─────────▼─────────┐  ┌────▼─────────┐  ┌────▼──────────┐
      │ @ss-cmp/ui-compat │  │ /charts-compat│  │ /graph-compat │
      └───────────────────┘  └──────────────┘  └───────────────┘

@ss-cmp/utils                （独立，无下游，也不依赖 tokens）
```

### 关键技术决策

1. **peer 依赖 Vue / Element Plus / echarts**：Qiankun 沙箱多 Vue 实例会失控，必须让每个子应用独立持有一份
2. **源码直接引用，不预编译**：`main` 指向 `src/index.ts`，Vue CLI / Vite 自己转译；发 npm 时再加 build step
3. **SCSS 保留 `.scss` 文件**：不预编译为 CSS，让消费方可覆盖 SCSS 变量
4. **无单独测试栈**：compat 组件的正确性在消费应用的 E2E / 浏览器验收里确认

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
+   "@ss-cmp/ui-compat": "workspace:*",
+   "@ss-cmp/charts-compat": "workspace:*",
    "element-plus": "^2.7.0",
    "echarts": "^5.5.0",
    "vue": "^3.4.0"
  }
```
> `@ss-cmp/graph-compat` 只 cmp-web 加（sms-web 无 cmp-graph 业务）

### `main.ts` diff

```diff
+ import '@ss-cmp/design-tokens/src/element-plus.scss'
  import App from './App.vue'

- import { registerCompatComponents } from './common/compat'
+ import { registerUiCompat } from '@ss-cmp/ui-compat'
+ import { registerChartsCompat } from '@ss-cmp/charts-compat'

  const app = createApp(App)
- registerCompatComponents(app)
+ registerUiCompat(app)
+ registerChartsCompat(app)
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

sms-web 125 个 .vue 绝大部分通过全局注册使用 `<advance-table>` 等 kebab-case 标签，**模板不变**。
少量直接 import 的位置用 node 脚本批量替换：
```
from '@/common/compat'        →  from '@ss-cmp/ui-compat'（或 charts-compat）
@import './tokens'            →  @use '@ss-cmp/design-tokens/src/tokens.scss' as *
```

---

## § 4 — 迁移 Phase 拆分

```
Phase 0   准备          ~30 min    打 tag / 切分支 / 对齐
Phase 1   Workspace 骨架 ~2 h      建 root + packages 空壳 + 验证独立 install
Phase 2   sms-web 抽出   ~4-6 h    搬 compat + 改 import + 验证（原子提交）
Phase 3   sms-web 验收   ~1-2 h    build + 浏览器 smoke test + merge develop
Phase 4   cmp-web 接入             Phase A-D + graph-compat 边迁边补
Phase 5   cms-web / cos-web        复用 cmp-web 模板
Phase 6   npm publish              未来，非本轮
```

### Phase 0：准备

```
[ ] 从 develop 切出 chore/introduce-workspace 分支
[ ] git tag before-workspace
[ ] 确认所有子应用当前可构建（sms-web + main-web 已验）
[ ] 记录 sms-web node_modules 大小 / lockfile 校验和（对比基线）
```

### Phase 1：Workspace 骨架

```
[ ] 新增 pnpm-workspace.yaml / root package.json / .npmrc
[ ] 建 packages/ 目录 + 5 个子目录 + 每个 package.json 占位
[ ] 读 original/cmp-*/lib/ 对照 sms-web compat，在每个包的 README.md 写"对齐清单"
[ ] pnpm install（root 级 + 每个子应用级各一遍）
[ ] sms-web build + serve 验证无副作用
[ ] commit: chore(workspace): introduce pnpm workspace scaffold (empty packages)
```

**关键**：Phase 1 对子应用应零影响；只是仓库根加了协调文件。

### Phase 2：sms-web compat 抽出（原子提交）

**前置**（提交前）：
```
[ ] 阅读 original/cmp-element/lib/cmp-element.common.js 对应 webpack concat module 段
[ ] 对比 sms-web compat 当前 prop / slot / event，补齐缺失项（只补不删）
[ ] 同样方式读 original/cmp-echarts/hooks/useChart.js 对齐 useChart composable
```

**搬家与切换**（同一 commit）：
```
[ ] git mv sms-web/src/common/compat/tokens.scss      → packages/design-tokens/src/
[ ] 新建 packages/design-tokens/src/element-plus.scss（从 sms-web 的 :root 覆盖抽出）
[ ] git mv sms-web/src/common/compat/{BasicForm,BasicFormItem,BasicTable,AdvanceTable,TableSearch,CommonDetail,CommonDetailItem,StatusIcon,SvgIcon,Empty}.vue → packages/ui-compat/src/
[ ] git mv sms-web/src/common/compat/useChart.ts      → packages/charts-compat/src/
[ ] git mv sms-web/src/common/compat/*Charts.vue      → packages/charts-compat/src/
[ ] git mv sms-web/src/common/utils/{auth,crypto,day,request,resolvePath,uploadFile}.ts → packages/utils/src/
[ ] 每包 src/index.ts 导出 + registerXxxCompat 函数
[ ] 每包 package.json 填 deps / peerDeps / version 0.1.0
[ ] 改 sms-web/src/main.ts import（见 § 3）
[ ] 改 sms-web/vue.config.js 加 transpileDependencies
[ ] 改 sms-web/tsconfig.json 扩 include
[ ] grep 批量替换 sms-web 下剩余直接 import '@/common/compat' 的位置
[ ] 批量改 .vue 里 @import './tokens' → @use '@ss-cmp/design-tokens/src/tokens.scss' as *
[ ] 删空的 sms-web/src/common/compat/（若有遗留）
[ ] pnpm --filter sms-web install
[ ] commit: feat(workspace): extract sms-web compat into @ss-cmp/* packages
```

### Phase 3：sms-web 验收

```
[ ] eslint 0 errors（sms-web + 所有 packages）
[ ] pnpm --filter sms-web build 通过
[ ] pnpm --filter sms-web serve，浏览器 smoke test：
    - 登录 + 资源总览（首屏 + 图表）
    - 租户列表点名字 → CommonDetail + 返回
    - 审计日志 "归档记录" → TableSearch 搜索
    - 任一监控页（ECharts + cmp-echarts 替换）
[ ] merge chore/introduce-workspace → develop (--no-ff)
[ ] push origin develop
[ ] 更新 docs/migration/compat-layer.md 补"已提至 @ss-cmp/* workspace"章节
[ ] 更新 .claude/memory/project_cmp_harness.md 反映 workspace 就绪
```

### Phase 4：cmp-web 接入（首个"零本地 compat"迁移）

**前置扫描**（迁移前）：
```
[ ] grep cmp-web/src 用到的 cmp-element 组件：<basic-table / <common-detail / <advance-table / <smart-table / <card-layout / <code-mirror / <json-view / <full-screen / ...
[ ] grep cmp-web/src 用到的 cmp-echarts 图表：<bar-charts / <graph-charts / <loop-charts / ...
[ ] grep cmp-web/src 用到的 cmp-topology / cmp-graph / cmp-graph-editor API
[ ] 把"packages 当前缺失 → cmp-web 需要补"的清单贴到 Phase 4 TODO
```

**执行**（参考 `.claude/skills/vue2-to-vue3-migration/SKILL.md` Phase A-D）：
```
Phase A：已完成（v2-cmp-web tag / feature/migrate-cmp-web 分支）
Phase B：
  Stage 1：不再建本地 src/common/compat/；package.json 加 @ss-cmp/* 5 个包
  Stage 1：main.ts 用 registerUiCompat + registerChartsCompat + registerGraphCompat
  Stage 2-5：按原 skill 执行
  期间补建 @ss-cmp/graph-compat 的 Graph / TreeGraph（从 original/cmp-topology/ 反编译）
  期间补 @ss-cmp/ui-compat 缺失组件（CommonDetailRight / CardLayout / CodeMirror 等，按需）
  期间补 @ss-cmp/charts-compat 的 GraphCharts / LoopCharts
Phase C-D：按原 skill 执行
```

### Phase 5：cms-web / cos-web

完全套用 cmp-web 模板。packages/ 里组件此时已较完整，这两个子应用大概率"零新增 compat 组件"。

### Phase 6：npm publish（未来，非本轮）

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
| 3 | 同 Phase 2 | 若已 merge develop 需 revert-merge |
| 4-5 | 每个子应用 feature 分支独立回滚（见 `docs/operations/rollback.md`） | 该子应用回 Vue 2 |

### 测试 / 验证关卡

| 关卡 | 验证项 | 工具 |
|------|-------|------|
| Phase 1 后 | sms-web build 通过；node_modules 大小接近不变 | `pnpm build` + `du -sh` |
| Phase 2 提交前 | eslint 0；sms-web build + `vue-tsc --noEmit` 通过 | `pnpm build` + `vue-tsc` |
| Phase 3 | 5 个主页面手测（资源/租户详情/审计/监控/日志） | Chrome DevTools |
| Phase 3 | sms-web 在基座内 mount + 切到 scr-web 不崩 | main-web + sms-web + scr-web dev 并发 |
| Phase 3 | build 产物体积 vs Phase 0 基线；预期 ±5% 内 | `du -sh sms-web/sms-web/` |
| Phase 4+ | 每个子应用走 `docs/migration/lifecycle.md` Phase D 7 步 | 已定义 |

### 成功标准

- [ ] `packages/` 下 5 个包均可独立 `pnpm --filter ... build`（Phase 6 时达成）
- [ ] sms-web 不含 `src/common/compat/` 和 `src/common/utils/`，全部依赖 `@ss-cmp/*`
- [ ] cmp-web / cms-web / cos-web 迁移完成时无本地 compat，100% 用 workspace
- [ ] `grep -r 'from .@/common/compat' {sms,cmp,cms,cos}-web/src` 为空
- [ ] 任一 compat 组件的 bug fix 在 `packages/` 提一次 commit 就在所有子应用生效
- [ ] 各包 API 与 `original/cmp-*/` 源码对齐（prop/slot/event/SCSS 类名）

### 显式放弃项

- ❌ Vue 3.5 / 未来版本升级（独立议题）
- ❌ 重构业务组件（只搬 compat）
- ❌ 改 Qiankun 基座 main-web
- ❌ 引入 turbo / nx 等 monorepo 任务编排（pnpm workspace 足够）
- ❌ 加 CI pipeline 新步骤（本地验证，CI 维持现状）
- ❌ csc-web 相关（已移出仓库）

---

## § 6 — 原包源码作 ground truth

所有 `@ss-cmp/*` 包的 API 设计必须以 `D:\harnes-test\ss-harness-cmp\original\` 下对应原包源码为准：

- **prop 名 / 类型 / 默认值**：对齐原版
- **event / slot 名**：对齐原版
- **method（通过 `defineExpose`）**：对齐原版
- **SCSS 类名**：对齐原版（业务模板的 CSS 选择器依赖它们）

### 原包源码清单

| 原包 | 位置 | 形态 |
|------|------|------|
| cmp-element | `original/cmp-element/` | 部分 .vue 源（3 个 components）+ 构建产物 lib/（含 16 个 packages/ 组件，webpack concat module 可读） |
| cmp-echarts | `original/cmp-echarts/` | hooks/ JS 源 + lib/ 构建产物（8 个图表） |
| cmp-socket | `original/cmp-socket/` | dist/index.js（不需 compat，直接用 @1.0.0） |
| cmp-topology | `original/cmp-topology/` | lib/ 构建产物（Graph, TreeGraph） |
| cmp-graph / cmp-graph-editor | ⚠️ 源码未找到 | Phase 4 补：从项目 node_modules 缓存 / 原 git repo 获取 |

### 设计偏离原版的情况

凡与原版行为不一致处，必须在对应包的 README.md 写入"与原版差异"章节：

1. **Element Plus 的 API 强制差异**（如 `:visible.sync` → `v-model`、`@click.native` → `@click`）
2. **性能优化 / bug 修复**（记 CHANGELOG）
3. **Vue 3 架构差异**（mixins → composable；options API → script setup）—— 保留原行为，只换实现

---

## § 7 — 风险与对策

| 风险 | 可能性 | 影响 | 对策 |
|------|--------|------|------|
| `transpileDependencies` 没覆盖 workspace 包 → 生产 build 报 "Unexpected token" | 中 | sms-web 构建失败 | Phase 2 commit 前手动 build 验证；正则匹配 `/@ss-cmp\//` 全部 |
| 多版本 echarts 导致 Qiankun 沙箱冲突 | 低 | 图表错乱 | charts-compat 只 peer echarts；consumer 显式装；workspace pin 相同版本 |
| SCSS `@import` → `@use` 导致变量作用域变化 | 中 | 样式异常 | Phase 2 逐文件改；build 产出 CSS 与 Phase 0 diff 对比 |
| webpack `symlinks: false` 被某处设置 → workspace link 失效 | 低 | 子应用看不到 packages/ 改动 | Phase 1 验证时 grep 配置确认 |
| sms-web `registerCompatComponents` 签名改动 | 低 | 非 Qiankun 注册路径失效 | 新函数 `registerUiCompat + registerChartsCompat` 同作用，不做签名复用 |
| cmp-graph / cmp-graph-editor 源码找不到 | 中 | Phase 4 graph-compat 实现不完整 | Phase 4 前置扫描阶段优先解决；若找不到，先基于 node_modules 缓存反编译 + 消费方使用约定补齐 |
| original/ 里仅有 build 产物的组件（如 BasicForm），API 还原不准 | 中 | compat 行为不符业务期望 | webpack concat module 段保留了 .vue 源码注释；读 render / methods / props 定义区还原；配合消费方实际用法交叉验证 |

---

## 附录 A — 本方案与 CLAUDE.md / docs/ 的关系

- **不改 CLAUDE.md 主线**：CLAUDE.md 只做身份 + 迁移状态 + 导航，workspace 方案属于迁移技术细节
- **新增 `docs/migration/compat-layer.md` 的 workspace 章节**：Phase 3 完成后补写
- **不改 `docs/migration/lifecycle.md`**：Phase A-D 流程对 cmp-web / cms-web / cos-web 仍然适用，只是 Stage 1 基础层不再建本地 compat
- **更新 `.claude/memory/project_cmp_harness.md`**：Phase 3 完成后记录 workspace 就绪
- **追加 `.claude/memory/project_cmp_pitfalls.md` 条目**：Phase 2/3 期间发现的 workspace 相关踩坑（条目号按当时实际追加位置）

---

## 附录 B — 决策日志

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-04-22 | 用 pnpm workspace（不切 Vite、不独立 repo） | 契合动机 d（为将来发 npm 铺路），开发体验最好，配合现有 pnpm 生态 |
| 2026-04-22 | 5 包按领域拆，非单一大包或 3 包 | 动机 d 要求包边界对齐原 cmp-* 包；tree-shaking 友好；graph 重依赖隔离 |
| 2026-04-22 | sms-web 先抽出（而非 cmp-web 先用复制） | sms-web 是"已知正确"的实现，做白鼠；cmp-web 不应承担 "迁移 + 验证新架构" 双重风险 |
| 2026-04-22 | peer 依赖 Vue / Element Plus / echarts | Qiankun 沙箱多实例冲突；bundle size |
| 2026-04-22 | 源码直接引用（不预编译）at least 到 Phase 5 | 开发体验最好；发 npm 时再加 build |
| 2026-04-22 | utils 独立于 tokens，不被 UI 包依赖 | 纯函数域，无 Vue/DOM，解耦 |
| 2026-04-22 | 共享 lockfile=false，保留每应用独立 pnpm-lock.yaml | 保留现有隔离模型；workspace 协议照样生效 |

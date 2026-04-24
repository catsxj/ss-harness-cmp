---
name: 当前工作状态交接（2026-04-24）
description: 下次进入会话时第一眼读。本会话做了什么 / 工作区是什么状态 / 下一步最该做什么 / 有哪些待办暗雷。避免重复摸索。
type: project
---

## 新会话进来，先读这份

2026-04-24 这一整天做了三块大工作：workspace 样式对齐 / A 档 port runtime 验证 / cmp-web Phase 4 Stage 1。读完这份 + CLAUDE.md 就能接着干。

---

## 已完成（2026-04-24）

### 1. workspace 样式对齐 cmp-basic（develop）

- 参考源：`original/cmp5.0/cmp-basic/src/`（比 original/cmp-element 完整得多的 Vue 2 源码）
- 对齐组件：BasicTable / AdvanceTable / BasicForm / BasicFormItem / TableSearch（`framed` + `legend`）/ CommonDetail / CommonDetailItem
- `@ss-cmp/design-tokens/src/tokens.scss` 加了 cmp-basic 色卡 section（`$cmp-table-header-bg` / `$cmp-table-row-hover-bg` 等）
- memory：`project_cmp_decisions.md` 加决策条目；新增 `project_cmp_cmp_basic_style_ref.md` 完整色卡 / 尺寸 / Top 10 复刻清单

### 2. A 档 port runtime 验证（develop）✅ session_handoff 之前推荐的 (A) 完成

- sms-web 加 `/dev/compat-smoke-test` 路由 + `@ss-cmp/cmp-graph` workspace 依赖
- 逐块"启用"验收 8 个 A 档 port（CodeMirror / FullScreen / JsonView / cmp-graph 5 个）
- **关键结论**：`@antv/g6-editor@1.2.0` 与 Vue 3 实测兼容，canvas 正常起，cos-web 迁移时 cmp-graph 保持 A 档
- ContextMenu `#Contextmenu { display: none }` 是原版设计（g6-editor 右键时 DOM 切换），不是 bug

### 3. cmp-web Phase 4 Stage 1 完成（`feature/migrate-cmp-web` @ origin）✅

**521 .vue 全部编译通过**，`pnpm run build` exit code 0。feature 分支已推 origin 带 upstream tracking。GitHub 可开 PR：https://github.com/catsxj/ss-harness-cmp/pull/new/feature/migrate-cmp-web（**先别开**，等 Stage 2 跑完一起合）

Stage 1 commit 链（基于 `develop` 当前 `a3ef4e2`）：
```
28243a7 fix(cmp-web): Stage 1 build gate — 全部编译通过 ⭐
6c310f5 refactor(cmp-web): Stage 1 Codemod 第 1 批 — 机械替换
3897bdf fix(cmp-web): 对齐 tsconfig + shims + element-variables
19782c3 feat(cmp-web): Stage 1 框架层改造
c219179 feat(cmp-web)!: 升级 package.json 到 Vue 3 全家桶
5e4a922 chore(cmp-web): 清除 Vite 残留配置
10e95dc chore(cmp-web): 修复 cms-web 路径 bug
```

---

## 当前状态

- **develop 分支**：同步 origin/develop @ `a3ef4e2`（含本次 workspace + smoke test 工作）
- **feature/migrate-cmp-web 分支**：origin 同步 @ `28243a7`，领先 develop 9 个 commit
- **工作树**：当前在 develop，干净
- **节点快照**：cmp-web Vue 2 原貌在 tag `v2-cmp-web`；workspace 抽取前在 tag `before-workspace`

---

## 下一步：cmp-web Stage 2（runtime 修复 + 浏览器验证）

**Stage 1 build 通过 ≠ 应用能跑**，Stage 2 是逐页浏览器验证 + 点状 runtime bug 修复。

### 启动前必读

1. **在 `feature/migrate-cmp-web` 分支上工作**（不要碰 develop 的 views/）
2. `docs/parallel/per-cmp-web.md` 里 Stage 2 的 4+1 Agent 拆分方案
3. 本文件下方"Stage 1 留下的已知 runtime 债"表

### Stage 2 建议路径

1. **先本地起 dev 验证 main.ts / router / login / home layout 能跑起来**（约 30 分钟）—— 如果启动就崩，先修启动链再拆 Agent
2. **后拆 Agent 并行**（参考 per-cmp-web.md）：
   - Agent A-D：views/ 按模块均分（每路 ~130 .vue）
   - Agent E：layouts + common/components
3. 每个 Agent 用 git worktree 隔离，基于 `feature/migrate-cmp-web`
4. 每块 Agent 工作有"自测"门禁：对应目录在浏览器打开看主路径，控制台无 error

### Stage 1 留下的已知 runtime 债（build 能过但会坏功能）

| # | 债 | 规模 | 影响 |
|---|---|---|---|
| 1 | `v-model:visible` 在 el-dialog 上 | 73 处 | **Element Plus el-dialog 用 `v-model`（map 到 modelValue），dialog 打不开/关不掉** |
| 2 | `::v-deep` combinator | ~28 文件 | deprecation warning，Vue 3 仍可用 |
| 3 | Vue 2 filter 语法 `\|` | ~240 文件 | 渲染原值不报错，文本不格式化 |
| 4 | `this.$store / $router / $refs` | ~20+ 文件 | options API 文件里 TS 看不见但运行 undefined |
| 5 | Element Plus 属性 breaking change | 未知 | `el-radio-button label=` → `value=`、`el-switch active-color` 等 |
| 6 | Vue 2 `slot="xxx"` 在非 `<template>` 元素上 | 约 236 文件（估）| Vue 3 编译器会报 warning，内容在默认 slot；具名 slot 内容丢失 |

### Stage 2 切入顺序（建议）

**Step A**：在 feature 分支先跑 dev server（`cmp-web` 目录 `pnpm serve`），打开 login 页看能不能挂。如果启动崩 / login 挂不了，**优先**修启动路径，然后才拆 Agent。

**Step B**：批量修 73 处 el-dialog `v-model:visible` → `v-model`（一条 sed 就行，仅限 `<el-dialog ...` 标签内）。这是最高收益的机械修复。

**Step C**：Agent 拆分并行修其余 runtime bug。

---

## 会话中的已知暗雷 / 待办（累积）

| # | 项 | 位置 | 谁会碰到 |
|---|----|------|----------|
| 1 | ~~8 个 A 档 port runtime 未验证~~ | ✅ 2026-04-24 已过 smoke test | — |
| 2 | sms-web utils stub 层过渡兼容 | `sms-web/src/common/utils/*.ts` | 所有子应用迁完后收尾 |
| 3 | main-web/public/config/app.json 修改要 F5 基座才能生效 | main-web 启动时只读一次 | 回滚演练 / 切 entry 时 |
| 4 | Vue 3 filter 语法 `\|` 在 cmp-web 被 Codemod 遗留了 | cmp-web ~240 文件 | Stage 2 runtime |
| 5 | cmp-web vue.config.js sass `additionalData` 替代了 `prependData` | cmp-web/vue.config.js | Stage 2 跑 dev 时 scss 引入行为变了要确认 |
| 6 | smoke test 引入了 sms-web 对 `@ss-cmp/cmp-graph` 的依赖 | sms-web/package.json | 只为 dev 路由，上线前决定是否保留（保留无损） |

---

## 如果接下来是完全不同的话题

本项目的"升级总控"入口始终是：
1. CLAUDE.md（身份 + 状态 + 必读次序）
2. `.claude/memory/project_cmp_harness.md`（项目概况）
3. 本文件（最新进度 + 下步）

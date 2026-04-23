---
name: CMP Harness 项目文档清单
description: 升级计划、Agent 并行方案等生成文档的位置索引
type: reference
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
## D:\harnes-test\ss-harness-cmp\ 下的文档

- `CLAUDE.md` — Agent 入口（项目身份 + 迁移状态 + 导航，细节规则在 docs/ 下）
- `upgrade-plan.md` — 5 阶段升级计划（Phase 0-4），含各子应用详细分析、组件对照表、时间线
- `docs/` — 所有规则、流程、参考、历史（2026-04-22 文档重组，入口 [docs/README.md](../../docs/README.md)）
  - `docs/rules/` — 硬性规则（agent-constraints / build-tool / layered-dependencies / commit-gates / architecture-lint）
  - `docs/migration/` — 迁移规范（lifecycle / element-plus-mapping / vue3-syntax / typescript-rules / qiankun-constraints / compat-layer）
  - `docs/operations/` — 运维（rollback / deploy / coexistence-testing / performance-baseline / browser-compatibility）
  - `docs/developer/` — 开发者（onboarding / pre-commit-hooks / tech-debt-tracking）
  - `docs/history/` — 历史沉淀（failure-cases / migration-notes/ / knowledge-base/）
  - `docs/parallel/` — 并行方案（overall-plan / per-app / sms-web / auto-mode，原根目录 agent-parallel-*.md 已迁入）
- `docs/superpowers/` — executing-plans skill 的产物
  - `plans/2026-04-22-sms-web-workspace-extraction.md` — Phase 0-3 13-task 计划（已执行完毕，commit `a0927ef` merge）
  - `specs/2026-04-22-common-compat-workspace-design.md` — workspace 设计规格

## 公共组件包（packages/，2026-04-22 workspace 抽取）

- `packages/design-tokens/src/` — tokens.scss（SCSS 变量）+ element-plus.scss（Element Plus CSS var 覆盖 + 32px 统一尺寸）+ index.ts（JS tokens 常量）
- `packages/utils/src/` — auth.ts（configureAuth）/ crypto.ts / day.ts / request.ts（configureRequest）/ resolvePath.ts / uploadFile.ts + shims-ajax.d.ts + shims-global.d.ts
- `packages/cmp-element/src/` — 10 个重新实现（BasicForm / BasicFormItem / BasicTable / AdvanceTable / TableSearch / CommonDetail / CommonDetailItem / StatusIcon / SvgIcon / Empty）+ 3 个 A 档 port（CodeMirror / FullScreen / JsonView）+ validate.ts + fullScreenUtils.ts
- `packages/cmp-echarts/src/` — 6 个重新实现（BarCharts / BarReverseCharts / LineCharts / PieCharts / GaugeCharts / LiquidFillCharts）+ LoopCharts alias → PieCharts + useChart.ts（enhanced 重新实现）
- `packages/cmp-graph/src/` — 5 个 A 档 port（Editor / ContextMenu / MiniMap / Toolbar / ToolbarSimple）+ fonts/iconfont.* + re-export Flow from @antv/g6-editor
- `packages/cmp-topology/src/` — 空骨架（原版无 .vue 源码，Phase 4 cmp-web 时重新实现）

cmp-socket 保持原包引用（B 档），不抽入 packages/。

## 原包源码参考（original/，gitignore 45MB）

- `original/cmp-element/components/` — 只有 code-mirror / full-screen / json-view（3 个 .vue 有源）+ utils/ 工具
- `original/cmp-echarts/hooks/` — useChart.js + echarts.js（Vue 2 源，供参考）
- `original/cmp-graph/src/components/` — **最完整源码**（5 个 .vue + src/index.js + fonts/）
- `original/cmp-topology/` / `original/cmp-graph-editor/` / `original/cmp-socket/` — 无可读源码，只有 lib/ 压缩输出

## D:\harnes-test\cmp-harness\ 下（脚手架模板仓库）
- 基于 github.com/catsxj/cmp-harness 创建的 pnpm workspace 模板工程
- 含 7 个应用骨架 + shared 公共包

## D:\harnes-test\ 下
- `upgrade-plan.md` — 早期版本的升级计划（已被 ss-harness-cmp 下的版本取代）
- `CLAUDE.md` — 早期版本的 Agent 约束文档

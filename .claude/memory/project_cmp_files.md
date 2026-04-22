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

## D:\harnes-test\cmp-harness\ 下（脚手架模板仓库）
- 基于 github.com/catsxj/cmp-harness 创建的 pnpm workspace 模板工程
- 含 7 个应用骨架 + shared 公共包

## D:\harnes-test\ 下
- `upgrade-plan.md` — 早期版本的升级计划（已被 ss-harness-cmp 下的版本取代）
- `CLAUDE.md` — 早期版本的 Agent 约束文档

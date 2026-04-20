---
name: CMP Harness 项目文档清单
description: 升级计划、Agent 并行方案等生成文档的位置索引
type: reference
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
## D:\harnes-test\ss-harness-cmp\ 下的文档
- `upgrade-plan.md` — 5 阶段升级计划（Phase 0-4），含各子应用详细分析、组件对照表、时间线
- `CLAUDE.md` — Agent 约束文档（分层规则、Element Plus 迁移规则、TS 规范、pnpm 规则）
- `agent-parallel-plan.md` — Agent 并行总方案（各阶段并行度、Git worktree 工作流、Prompt 模板）
- `agent-parallel-sms-web.md` — sms-web 三路并行细化方案（Agent A/B/C 拆分、Stage 1-3 流程）
- `agent-auto-parallel.md` — 全自动无人工 Review 并行方案（主 Agent 编排 + 自愈循环）

## D:\harnes-test\cmp-harness\ 下（脚手架模板仓库）
- 基于 github.com/catsxj/cmp-harness 创建的 pnpm workspace 模板工程
- 含 7 个应用骨架 + shared 公共包

## D:\harnes-test\ 下
- `upgrade-plan.md` — 早期版本的升级计划（已被 ss-harness-cmp 下的版本取代）
- `CLAUDE.md` — 早期版本的 Agent 约束文档

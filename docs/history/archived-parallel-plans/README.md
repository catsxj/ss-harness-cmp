# archived-parallel-plans — 已归档的 Agent 并行迁移方案

> 原在 `docs/parallel/`，对应子应用迁完后归档。**按 doc-size-limit.md 豁免**：方案本身有整体叙事，拆分会损耗可用性 → 归档不拆。

## 清单

| 归档日期 | 文件 | 行数 | 状态说明 |
|---------|------|------|----------|
| 2026-04-23 | [sms-web.md](sms-web.md) | 551 | sms-web 迁移已完成（commit `a0927ef`）。实际未按 3-Agent 并行执行，改为单 pass。作为 cmp/cms/cos Phase 4 并行执行的参考模板 |

## 何时新增

子应用 Vue 3 迁移完成（Phase D 7 步验收通过 + merge develop）后，将对应 parallel/*.md git mv 到这里。

之后在本 README 清单追加一行（含日期 + 行数 + 实际执行备注）。

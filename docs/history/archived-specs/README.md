# archived-specs — 已执行完毕的 spec artifact

> superpowers:writing-plans / brainstorming 流程产出的设计规格。原在 `docs/superpowers/specs/`，对应 plan 执行完毕后移来归档。

**按 doc-size-limit.md 豁免**：spec 是对齐用的整体文档，拆分会破坏叙事流。

## 清单

| 归档日期 | 文件 | 行数 | 对应 plan |
|---------|------|------|-----------|
| 2026-04-23 | [2026-04-22-common-compat-workspace-design.md](2026-04-22-common-compat-workspace-design.md) | 627 | [../archived-plans/2026-04-22-sms-web-workspace-extraction.md](../archived-plans/2026-04-22-sms-web-workspace-extraction.md) |

## 何时新增

当对应 plan 已 merge + 用户确认实施完毕后，随 plan 一起归档：

```bash
git mv docs/superpowers/specs/<slug>.md docs/history/archived-specs/<slug>.md
```

然后在本 README 清单追加一行，把对应 plan 的链接也填上。

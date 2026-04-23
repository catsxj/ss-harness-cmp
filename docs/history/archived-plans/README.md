# archived-plans — 已执行完毕的 plan artifact

> superpowers:executing-plans / writing-plans skill 的产物。原在 `docs/superpowers/plans/`，执行完毕后移来归档。

**按 doc-size-limit.md 豁免**：plan 是整体约定的 task 序列，拆分会破坏 skill 协议 → 归档而非拆分。

## 清单

| 归档日期 | 文件 | 行数 | 执行状态 |
|---------|------|------|----------|
| 2026-04-23 | [2026-04-22-sms-web-workspace-extraction.md](2026-04-22-sms-web-workspace-extraction.md) | 1374 | ✅ 全部 13 task 完成，merge 到 develop @ `a0927ef` |

## 何时新增

在 `docs/superpowers/plans/<slug>.md` 的全部 task 已执行完 + 合并到 develop 后：

```bash
git mv docs/superpowers/plans/<slug>.md docs/history/archived-plans/<slug>.md
```

然后在本 README 清单追加一行。

## 历史 commit 链路

归档会让 git 把 rename 视为 history-preserving move，blame / log 可以跨归档追踪。

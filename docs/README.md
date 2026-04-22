# docs — 文档中枢

> 所有项目规则、流程、参考、历史沉淀都在这个树下，按用途分 6 区。
> 本文件是索引，不含规则原文。CLAUDE.md 指向本文件；Agent 按"新对话必读次序"由 CLAUDE.md 导入。

---

## 分区概览

| 分区 | 用途 | 谁读 | 什么时候读 |
|------|------|------|-----------|
| 🔒 [rules/](rules/) | 硬性规则（不可违反） | Agent / 人 | 每次新对话开始 |
| 🔄 [migration/](migration/) | Vue2→Vue3 迁移规范与流程 | 迁移执行者 | 开始迁一个子应用前 |
| 🚀 [operations/](operations/) | 运维 / 上线 / 回滚 | Ops / 上线负责人 | 上线前 & 出问题时 |
| 👨‍💻 [developer/](developer/) | 开发者指南 | 新成员 / 老成员 | 加入项目时 & 提交前 |
| 📜 [history/](history/) | 历史沉淀（踩坑、迁移总结、知识库） | 任何人 | 遇到问题想查过往 |
| ⚡ [parallel/](parallel/) | 并行迁移方案（worktree / 多 Agent） | 加速迁移时 | 决定并行度时 |

---

## 按任务反向索引

| 我要做什么 | 先读 |
|-----------|------|
| 开始迁一个子应用 | [migration/lifecycle.md](migration/lifecycle.md) + [rules/agent-constraints.md](rules/agent-constraints.md) |
| 提交代码 | [rules/commit-gates.md](rules/commit-gates.md) |
| 写 .vue 组件 | [migration/vue3-syntax.md](migration/vue3-syntax.md) + [migration/element-plus-mapping.md](migration/element-plus-mapping.md) |
| 写 TS | [migration/typescript-rules.md](migration/typescript-rules.md) |
| 做 Qiankun 联调 | [migration/qiankun-constraints.md](migration/qiankun-constraints.md) |
| 上线 | [operations/deploy.md](operations/deploy.md) + [operations/coexistence-testing.md](operations/coexistence-testing.md) |
| 回滚 | [operations/rollback.md](operations/rollback.md) |
| 遇到熟悉的报错 | [history/failure-cases.md](history/failure-cases.md) + [history/knowledge-base/](history/knowledge-base/) |
| 决定要不要并行 | [parallel/overall-plan.md](parallel/overall-plan.md) |

---

## 文档改动纪律

- `rules/` 是硬约束，**改规则前需团队对齐**，不能 agent 单方面增删
- `migration/` 和 `operations/` 允许随迁移进展追加条目，但删除/修改已有条目前评估影响
- `history/` 是**只追加**（append-only）—— 历史不 rewrite
- 每个 README.md 保持索引性质，规则原文放到具体文件

---

**状态说明（2026-04-22）**：文档重组 Step 1 已完成（骨架 + README）。
实际内容文件在 Step 2 按映射表搬入。在此之前，请仍从 CLAUDE.md 的"必读文件索引"找规则。

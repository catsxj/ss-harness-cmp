# history — 历史沉淀

> 已发生的失败、踩坑、迁移总结、解决方案知识库。**只追加，不删除**。
> 出问题时先来这里搜一遍，大概率以前有人踩过。

---

## 文件 / 子目录清单

| 路径 | 说明 | 何时读/写 |
|------|------|-----------|
| [failure-cases.md](failure-cases.md) | 失败案例记录表（日期 \| 问题 \| 原因 \| 修复） | 遇到熟悉报错先搜；每次 Agent 犯错追加 |
| [migration-notes/](migration-notes/) | 各子应用迁移总结（按应用名命名） | 新子应用迁移前，读已完成子应用的总结 |
| [knowledge-base/](knowledge-base/) | 分类知识库（echarts / vue3-migration / third-party-libs 等） | 遇到具体库 / 领域问题时分类查 |
| [archived-plans/](archived-plans/) | 已执行完毕的 superpowers plan artifact（原 `docs/superpowers/plans/`） | 回顾某次执行的 task 粒度 / 新 plan 复用格式 |
| [archived-specs/](archived-specs/) | 已执行完毕的 superpowers spec artifact（原 `docs/superpowers/specs/`） | 回顾设计决策 / 原始需求 |

---

## failure-cases.md 格式

```
| 日期 | 问题 | 原因 | 修复 |
|------|------|------|------|
| YYYY-MM-DD | 一句话描述 | 为什么发生 | 怎么修的（含关键代码/配置） |
```

原来在 CLAUDE.md 根部的"失败案例记录"表迁入此文件。

---

## 和 `.claude/memory/project_cmp_pitfalls.md` 的关系

- `history/failure-cases.md`（本文件）— **人读 / PR 参考 / 可公开** 的版本
- `.claude/memory/project_cmp_pitfalls.md` — **Claude 私有记忆**，跨会话自动加载，内容更详细
- 两份**故意保留**（Q4 决定）：受众和加载时机不同，各司其职

---

## knowledge-base/ 规则

- 按领域分目录（echarts / vue3-migration / third-party-libs ...）
- 文件名 `YYYY-MM-DD-{slug}.md`
- 结构：问题 → 环境 → 排查 → 结论 → 参考

详见 [knowledge-base/README.md](knowledge-base/README.md)。

---

**状态说明**：Step 2 完成：
- `failure-cases.md` 已从 CLAUDE.md 拆出并补上 Step 1-3 新增的 3 条
- `migration-notes/` 和 `knowledge-base/` 已从 docs/ 根目录搬入本区

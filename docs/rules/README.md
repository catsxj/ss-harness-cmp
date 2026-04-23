# rules — 硬性规则

> 这里所有文件都是**不可违反**的约束。开始任何迁移 / 提交前必读。
> 违反需要团队对齐后在本区修改规则，不能 agent 单方面绕过。

---

## 文件清单

| 文件 | 说明 | 何时读 |
|------|------|--------|
| [agent-constraints.md](agent-constraints.md) | Agent "必须遵守" + "禁止" 两张清单 | 每次新对话 |
| [build-tool.md](build-tool.md) | 保持 Vue CLI（@vue/cli-service v5），禁止切 Vite | 迁移前 |
| [layered-dependencies.md](layered-dependencies.md) | types → constants → utils → api → stores → components → views → router → main，禁反向依赖 | 写任何 import 前 |
| [commit-gates.md](commit-gates.md) | lint 0 errors + /simplify + 构建通过 + 浏览器验收 的提交门禁 | 提交前 |
| [doc-size-limit.md](doc-size-limit.md) | 每份 .md ≤ 200 行，超则拆分 / 归档 | 写 / 改任何文档前 |
| [architecture-lint.md](architecture-lint.md) | ESLint no-restricted-paths 自动拦截违规 import 的配置 | 项目初始化 / 调整 lint 规则 |

---

## 读的次序

1. **agent-constraints.md** —— 先知道什么能做什么不能做
2. **build-tool.md** —— 工具选择不可变
3. **layered-dependencies.md** —— 代码组织骨架
4. **commit-gates.md** —— 产出标准
5. **architecture-lint.md** —— 规则落在 linter 里自动执行

---

**状态说明**：Step 2 完成：agent-constraints / layered-dependencies / commit-gates 已从 CLAUDE.md 拆出，architecture-lint 已从 docs/ 根搬入。`build-tool.md` 在 Step 3 建。

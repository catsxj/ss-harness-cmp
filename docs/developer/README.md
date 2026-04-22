# developer — 开发者指南

> 新成员加入项目 / 老成员日常开发会用到的配置、工具、流程。

---

## 文件清单

| 文件 | 说明 | 何时读 |
|------|------|--------|
| [onboarding.md](onboarding.md) | 开发者迁移指南（人读版，代码风格变化说明） | 加入项目时 |
| [pre-commit-hooks.md](pre-commit-hooks.md) | husky + lint-staged 自动拦截配置 | 项目初始化时 |
| [tech-debt-tracking.md](tech-debt-tracking.md) | TODO 规范、扫描命令、偿还策略 | 每个子应用迁完后更新 |

---

## 按场景分组

- **新成员入手**：onboarding.md
- **配环境**：pre-commit-hooks.md
- **迁移过程中**：tech-debt-tracking.md（随时记 TODO）
- **迁完一个子应用后**：回到 tech-debt-tracking.md 清点新增技术债

---

**状态说明**：本区 3 个文件将在 Step 2 从 docs/ 根目录搬入，`developer-guide.md` 同时改名为 `onboarding.md`。

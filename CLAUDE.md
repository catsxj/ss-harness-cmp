# CMP 迁移 Agent 入口

> 微前端 Vue 2 + ElementUI + Vuex + JS → Vue 3 + Element Plus + Pinia + TS 的大型升级。
> 所有规则、流程、参考、历史都在 [docs/](docs/) 下。本文件只做身份 + 状态 + 导航。

---

## 项目身份

- 仓库：github.com/catsxj/ss-harness-cmp
- 本地路径：`D:\harnes-test\ss-harness-cmp`
- 微前端框架：Qiankun
- 基座：main-web（Vue 3，已完成）
- 子应用：6 个（cmp / cms / cos / sms / scr / cop）。csc-web 保持 Vue 2 且**不在本仓库**（单独维护）
- 构建工具：**保持 Vue CLI（@vue/cli-service v5），禁止切 Vite**（scr-web 特例）
- 自研包：cmp-element / cmp-echarts / cmp-socket / cmp-graph 等**不可升级源码**，在 compat 层重新实现

## 迁移顺序与状态

```
scr-web  (68 .vue)   ✅ 已完成（特例：用了 Vite）
sms-web  (125 .vue)  ✅ 已完成 + 公共包抽取 @ss-cmp/* (2026-04-22/23)
cmp-web  (521 .vue)  ⬜ 待迁移（feature/migrate-cmp-web 已切出，v2-cmp-web tag 已打）
cms-web  (521 .vue)  ⬜ 待迁移
cos-web  (567 .vue)  ⬜ 待迁移
csc-web  (1211 .vue) ── 不迁移 & 已移出本仓库（单独维护）
```

### 公共包（pnpm workspace，2026-04-22 抽出）

`packages/` 下 6 个 `@ss-cmp/*` 包，细节索引见 [.claude/memory/project_cmp_files.md](.claude/memory/project_cmp_files.md)：

- `@ss-cmp/design-tokens` — SCSS 令牌 + Element Plus CSS var 覆盖 ✅ 已验证
- `@ss-cmp/utils` — 6 通用工具 + 2 shim .d.ts ✅ 已验证
- `@ss-cmp/cmp-element` — 10 重新实现 ✅ + 3 A 档 port ⚠️（CodeMirror / FullScreen / JsonView 仅编译，runtime 未跑）
- `@ss-cmp/cmp-echarts` — 6 图表 + useChart hook ✅ 已验证
- `@ss-cmp/cmp-graph` — 5 A 档 port ⚠️（全部仅编译，runtime 未跑，@antv/g6-editor@^1.2.0 与 Vue 3 的兼容性待 Phase 4 cmp-web 验证）
- `@ss-cmp/cmp-topology` — 空骨架，Phase 4 cmp-web 时填充（原版无 .vue 源码 → 重新实现）

**Phase 4 启动前务必先读** [.claude/memory/project_cmp_workspace_flow.md](.claude/memory/project_cmp_workspace_flow.md) 的"未验证组件清单"章节。

## 分支策略

```
main（基线快照）→ develop（迁移主分支）→ feature/migrate-{app}-web → merge --no-ff → develop
```

---

## 新对话 / 新 Agent 必读次序

1. **本文件**（身份 + 状态 + 导航）
2. [docs/rules/agent-constraints.md](docs/rules/agent-constraints.md) — 必须 / 禁止两张清单
3. [.claude/memory/project_cmp_harness.md](.claude/memory/project_cmp_harness.md) — 项目概况 memory
4. [.claude/memory/project_cmp_pitfalls.md](.claude/memory/project_cmp_pitfalls.md) — Vue 2→3 迁移期 38 条踩坑 memory
5. [.claude/memory/project_cmp_workspace_pitfalls.md](.claude/memory/project_cmp_workspace_pitfalls.md) — workspace 抽取期 3 条踩坑 memory
6. [.claude/memory/project_cmp_workspace_flow.md](.claude/memory/project_cmp_workspace_flow.md) — 2026-04-22/23 workspace 抽取流程 + 未验证组件清单（Phase 4 启动前必读）
7. [.claude/memory/project_cmp_files.md](.claude/memory/project_cmp_files.md) — 文档 / packages / original 位置索引
8. [docs/migration/lifecycle.md](docs/migration/lifecycle.md) — Phase A-D 迁移生命周期

---

## 文档导航

### 🔒 硬性规则 → [docs/rules/](docs/rules/)
agent-constraints · build-tool · layered-dependencies · commit-gates · architecture-lint

### 🔄 迁移规范 → [docs/migration/](docs/migration/)
lifecycle · element-plus-mapping · vue3-syntax · typescript-rules · qiankun-constraints · compat-layer

### 🚀 运维上线 → [docs/operations/](docs/operations/)
rollback · deploy · coexistence-testing · performance-baseline · browser-compatibility

### 👨‍💻 开发者 → [docs/developer/](docs/developer/)
onboarding · pre-commit-hooks · tech-debt-tracking

### 📜 历史沉淀 → [docs/history/](docs/history/)
failure-cases · migration-notes/ · knowledge-base/

### ⚡ 并行方案 → [docs/parallel/](docs/parallel/)
overall-plan · per-app · sms-web · auto-mode

完整索引：[docs/README.md](docs/README.md)

---

## 迁移完成标准

**不是编译通过，是浏览器里所有功能正常运行。**
每个子应用 Phase D 7 步完成（含浏览器验收 + 共存测试 + 回滚演练）后才能开始下一个。

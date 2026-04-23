---
name: CMP Harness 关键决策记录
description: 升级项目中已确认的技术决策和约束，避免重复讨论
type: project
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
- **构建工具**：保持 Vue CLI（@vue/cli-service v5），不切换到 Vite。scr-web 已用 Vite 完成（特例）
- **状态管理**：Vuex → Pinia
- **自研包策略**：不可升级源码，在 packages/compat/ 层做 Vue3 适配
- **cmp-element**：推荐方案 B（直接替换为 Element Plus），Codemod 自动化
- **Qiankun**：保留，基座 main-web 已是 Vue 3
- **并行策略**：子应用间串行，子应用内多 Agent 并行（worktree 隔离）
- **完成标准**：浏览器逐页功能验证，编译通过只是前置门槛
- **分支策略**：main（基线）→ develop → feature/* → 合并回 develop
- **试点选择**：scr-web（68 .vue，最小），之后可用全自动方案
- **方法论**：Harness Engineering — 每次 Agent 失败都更新 CLAUDE.md 约束
- **表格 / 表单样式基准**（2026-04-23 定）：`@ss-cmp/cmp-element` 的 BasicTable / AdvanceTable / TableSearch / BasicForm / BasicFormItem / CommonDetail / TreeTable / SmartTable 的**视觉样式**以 `original/cmp5.0/cmp-basic/src/` 为参考源（不是 `original/cmp-element/`，那份不完整）。详细样式清单见 `project_cmp_cmp_basic_style_ref.md`。现有 Vue 3 重新实现是从零写的 Element Plus 默认样式，需要按这份基准做一轮样式对齐。

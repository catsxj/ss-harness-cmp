# Vue2 + ElementUI + Qiankun 微前端升级计划 — 总览

> 方法论参考：Harness Engineering（驾驭工程）
> 核心原则：人类掌舵，Agent 执行；每次失败都是环境设计的信号
> 创建日期：2026-04-17
> 更新日期：2026-04-23（拆分到 docs/roadmap/ 各 phase）
>
> **⚠️ 2026-04-22 变更**：csc-web（Vue 2，1,211 .vue）**不迁移 + 已移出本仓库**单独维护。
> 本仓库迁移范围：scr-web ✅ / sms-web ✅ / cmp-web / cms-web / cos-web。

详细内容按 phase 拆到 [`docs/roadmap/`](docs/roadmap/README.md)。

---

## 项目概况

| 项目 | 现状 | 目标 |
|------|------|------|
| 基座 main-web | Vue 3.2 + Vite 2.8 + Element Plus + Ant Design Vue + Vuex 4 + TS | 保持，升级依赖版本 |
| 子应用 × 5 | Vue 2.6 + Vue CLI 4 + ElementUI 2.13 + Vuex 3 + 部分 TS | Vue 3 + Element Plus + TS（scr-web 特例用 Vite）|
| 微前端 | Qiankun 2.4.6 | 保留 |
| 项目结构 | 各应用独立目录 | pnpm workspace monorepo |
| 包管理器 | 各应用独立 | 统一 pnpm workspace |

### 应用清单

| 应用 | 类型 | Vue版本 | 构建工具 | .vue | 状态 |
|------|------|---------|----------|-----|------|
| main-web | 基座 | Vue 3 ✓ | Vite 2.8 | 32 | — |
| scr-web | 子应用 | Vue 2.6 → **3** | Vite（特例） | 68 | ✅ Done |
| sms-web | 子应用 | Vue 2.6 → **3** | Vue CLI 5 | 126 | ✅ Done |
| cmp-web | 子应用 | Vue 2.6 | Vue CLI | 521 | ⬜ 待迁 |
| cms-web | 子应用 | Vue 2.6 | Vue CLI | 521 | ⬜ 待迁 |
| cos-web | 子应用 | Vue 2.6 | Vue CLI | 567 | ⬜ 待迁 |
| cop-web | 子应用 | Vue 2.6 | Vue CLI | — | ⬜ scaffold 已入仓（2026-04-22）|
| csc-web | 子应用 | Vue 2.6 | — | 1,211 | **不迁**，已移出仓库 |

## 整体策略

```
Phase 0  基础设施准备 — monorepo 搭建、CI、模板          ✅
Phase 1  共享层抽离 — @ss-cmp/* 6 个 workspace 包         ✅
Phase 2  试点迁移 scr-web（68 .vue）                      ✅
Phase 3  批量迁移 sms → cmp → cms → cos                   ⏳ sms ✅
Phase 4  基座优化 + 清理收尾                              ⬜
```

---

## 分 phase 内容

每个 phase 单独成档，目标每份 ≤ 200 行：

- [docs/roadmap/phase-0.md](docs/roadmap/phase-0.md) — Phase 0 基础设施准备
- [docs/roadmap/phase-1.md](docs/roadmap/phase-1.md) — Phase 1 共享层抽离（@ss-cmp/*）
- [docs/roadmap/phase-2.md](docs/roadmap/phase-2.md) — Phase 2 试点 scr-web
- [docs/roadmap/phase-3.md](docs/roadmap/phase-3.md) — Phase 3 批量迁移
- [docs/roadmap/phase-4.md](docs/roadmap/phase-4.md) — Phase 4 基座优化 + 清理
- [docs/roadmap/supplementary.md](docs/roadmap/supplementary.md) — 人 vs Agent 分工 · 风险 · 时间线 · 附录

---

## 迁移完成标准

**不是编译通过，是浏览器里所有功能正常运行。**

每个子应用 Phase 完成 = 浏览器逐页验收 + 共存测试 + 回滚演练通过。

---

## 当前已实现

- **pnpm workspace**（2026-04-22，commit `d46a596`）+ 8 个 members
- **`@ss-cmp/*` 6 个包**（`design-tokens` / `utils` / `cmp-element` / `cmp-echarts` / `cmp-graph` / `cmp-topology`），commit `a0927ef` merge
- **A 档 port** 8 个真源码组件（3 cmp-element + 5 cmp-graph），commit `64739ac`，**runtime 未验证**
- **回滚基线**：tag `before-workspace` @ `05822f0`（已推 origin）

下步：Phase 4 cmp-web 启动前，先在某个实际业务页面 smoke test 那 8 个 A 档 port 组件。

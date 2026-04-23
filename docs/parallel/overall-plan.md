# Agent 并行执行方案 — 总览

> 基于 upgrade-plan.md 的分阶段策略，设计 Agent 并行拆分方案
> 目标：将串行 27-41 周压缩至 19-29 周（压缩 ~30%）
> 创建日期：2026-04-20，拆分日期：2026-04-23
>
> **⚠️ 更新（2026-04-22）**：csc-web 已移出仓库不迁移；下文 csc-web 并行章节保留作"大规模并行方法论参考"（1,211 .vue 的拆分思路对 cos-web 有借鉴价值），实际不执行。

---

## 核心原则

```
1. 无依赖的任务才能并行 — 有数据/文件依赖的必须串行
2. 一个 Agent 一个边界 — 每个 Agent 只改自己负责的目录
3. 共享同一份 CLAUDE.md — 所有 Agent 遵守同样的约束
4. Git worktree 隔离 — 每个 Agent 在独立 worktree 中工作，避免冲突
5. 人工 Review 合并 — Agent 产出的代码必须经人审核后再合并
```

## 并行度规划

| 阶段 | 最大并行 Agent 数 | 瓶颈 |
|------|------------------|------|
| Phase 0 | 3 | 自研包验证可并行，但 workspace 搭建是串行前置 |
| Phase 1 | 3 | 从不同子应用提取公共代码可并行 |
| Phase 2 | 2 | scr-web 体量小，拆 2 路足够 |
| Phase 3 - sms | 3 | 按 views 子目录拆 |
| Phase 3 - cmp | 4-5 | 521 .vue，按模块拆 |
| Phase 3 - cms | 4-5 | 521 .vue，按模块拆 |
| Phase 3 - cos | 4-5 | 567 .vue，按模块拆 |
| Phase 4 | 2 | 基座优化 + 全局清理 |

---

## Phase 0：基础设施准备（并行度 3）

### 串行前置（人工完成）

```
[人工] pnpm workspace 搭建 + CI 配置 + Vue3 模板子应用
       ↓ 完成后启动并行
```

### 并行任务（概要）

| Agent | 任务 | 输出 |
|-------|------|------|
| A | 自研包 Vue3 兼容性验证（cmp-socket / echarts / graph / graph-editor / topology） | 兼容性报告（可用 / 部分可用 / 不可用） |
| B | cmp-element 组件清单 + Element Plus 映射表 | 映射对照表 + API 差异清单 |
| C | Codemod 脚本初版（elementUI→plus / remove-this / options→setup） | 3 个可复用脚本 |

## Phase 1：共享层抽离（并行度 3）

三个 Agent 操作不同目录，零文件冲突：

| Agent | 目录 | 输出 |
|-------|------|------|
| A | `packages/shared/src/{types,api}` | 公共接口定义 + axios 封装 |
| B | `packages/shared/src/{utils,constants}` | 工具函数 + 单测 |
| C | `packages/compat/cmp-element` | Element Plus 替代组件 |

> 实际实现拆为 6 个独立包 `@ss-cmp/*`，详见 [../roadmap/phase-1.md](../roadmap/phase-1.md)。

## Phase 2：试点 scr-web（并行度 2）

scr-web 只有 68 个 .vue，拆 2 路即可。

```
[串行] 添加 Qiankun lifecycle + 创建 Vue3 骨架 + 迁移路由/store
       ↓
Agent A: views/ 前半 + components/
Agent B: views/ 后半 + layouts/
       ↓
[人工] 联调测试
```

## Phase 3：批量迁移（核心并行阶段）

**子应用间串行，子应用内并行。** 详见 [overall-phase3.md](overall-phase3.md)（sms/cmp/cms/cos/csc 各自的并行度 + ASCII 图）。

---

## 并行调度时间线

```
周次   Phase   并行 Agent   工作内容
────  ──────  ──────────  ──────────────────────────
W1-2  Ph.0    3           workspace + 自研包验证 + cmp-element 映射 + Codemod
W3-4  Ph.1    3           packages/{shared,compat}
W5-6  Ph.2    2           scr-web（68 .vue）
W7-9  Ph.3a   3           sms-web（126 .vue）
W10-14 Ph.3b  4-5         cmp-web（521 .vue）
W15-19 Ph.3c  4-5         cms-web（521 .vue）
W20-25 Ph.3d  4-5         cos-web（567 .vue）
W26-27 Ph.4   2           基座优化 + 全局清理
                          ──────────────
                          总计 ~26-27 周（csc-web 已移出）

对比串行：~25 周（sms ✅ + cmp/cms/cos 串行 + Phase 4）
并行后：  ~20 周（子应用内压缩 20%；跨子应用仍串行）
激进方案：cmp + cms 同时跑可再压 4 周，见 [overall-workflow.md](overall-workflow.md#激进并行方案可选)
```

---

## Git Worktree 工作流 + Agent Prompt 模板

详见 [overall-workflow.md](overall-workflow.md)：
- worktree 创建 / 目录边界规则
- 通用 Prompt 模板 + csc-web 大规模并行示例
- 激进并行方案（跨子应用并行）

---

## 质量保障

### 每个 Agent 产出后的检查流程

```
Agent 完成
  ↓
自动检查（CI）:
  [ ] vue-tsc --noEmit 通过
  [ ] ESLint 通过
  [ ] vite build 成功
  ↓
人工 Review:
  [ ] 功能逻辑未被改变
  [ ] 没有越界修改其他模块的文件
  [ ] cmp-element 替换完整（无残留 import）
  [ ] TS 类型合理（无 any 逃逸）
  [ ] Element Plus 组件用法正确
  ↓
合并到主分支
  ↓
集成测试:
  [ ] 在基座中加载该子应用正常
  [ ] 与其他子应用联动正常
```

### Agent 失败处理（Harness Engineering 循环）

```
1. 不要让 Agent 在已有问题的基础上继续改
2. 记录问题到 docs/history/failure-cases.md + .claude/memory/project_cmp_pitfalls.md
3. 回滚 Agent 的改动
4. 更新 CLAUDE.md / agent-constraints.md 约束规则
5. 重新启动 Agent（带新约束）

核心循环：失败 → 分析 → 加约束 → 重试
```

---

## 成本估算

| 阶段 | Agent 调用 | 说明 |
|------|-----------|------|
| Phase 0 | 3 | 自研包验证 + 映射表 + Codemod |
| Phase 1 | 3 | shared 三路并行 |
| Phase 2 scr | 2 | 68 .vue 两路 |
| Phase 3 sms | 3 | 126 .vue 三路（实际单 pass）|
| Phase 3 cmp | 5 | 521 .vue 五路 |
| Phase 3 cms | 5 | 521 .vue 五路 |
| Phase 3 cos | 5 | 567 .vue 五路 |
| Phase 4 | 2 | 基座优化 + 清理 |
| **总计** | **~28 次 Agent 调用** | 分布在 20-27 周内（csc 已移出不计） |

每次 Agent 调用处理 ~50-150 个 .vue 文件的迁移，单次工作量约 2-8 小时。

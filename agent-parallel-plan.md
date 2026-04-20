# Agent 并行执行方案

> 基于 upgrade-plan.md 的分阶段策略，设计 Agent 并行拆分方案
> 目标：将串行 27-41 周压缩至 19-29 周（压缩 ~30%）
> 创建日期：2026-04-20

---

## 核心原则

```
1. 无依赖的任务才能并行 — 有数据/文件依赖的必须串行
2. 一个 Agent 一个边界 — 每个 Agent 只改自己负责的目录
3. 共享同一份 CLAUDE.md — 所有 Agent 遵守同样的约束
4. Git worktree 隔离 — 每个 Agent 在独立 worktree 中工作，避免冲突
5. 人工 Review 合并 — Agent 产出的代码必须经人审核后再合并
```

---

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
| Phase 3 - csc | 6-8 | 1,211 .vue，必须高并行 |
| Phase 4 | 2 | 基座优化 + 全局清理 |

---

## Phase 0：基础设施准备（并行度 3）

### 串行前置（人工完成）

```
[人工] pnpm workspace 搭建 + CI 配置 + Vue3 模板子应用
       ↓ 完成后启动并行
```

### 并行任务

```
┌─────────────────────────────────────────────────────────┐
│                    Phase 0 并行启动                       │
│                                                         │
│  Agent A                Agent B              Agent C    │
│  ─────────              ─────────            ─────────  │
│  自研包验证              cmp-element          Codemod    │
│                         映射表               脚本初版    │
│                                                         │
│  验证 5 个包的            分析 cmp-element     编写:      │
│  Vue3 兼容性:             导出的所有组件        - element  │
│  - cmp-socket            逐个映射到            -ui-to-   │
│  - cmp-echarts           Element Plus          plus.ts   │
│  - cmp-graph             输出:                 - remove- │
│  - cmp-graph-editor      映射对照表             this.ts  │
│  - cmp-topology          API 差异清单           - options │
│                                                -to-     │
│  输出:                                         setup.ts  │
│  兼容性报告                                              │
│  (可用/部分可用/不可用)                                    │
└─────────────────────────────────────────────────────────┘
```

**Agent A Prompt 示例：**
```
你的任务是验证 6 个内部自研包在 Vue 3 环境下的兼容性。

项目位于 D:/harnes-test/ss-harness-cmp/，已有一个 Vue 3 模板子应用。
对以下每个包执行验证：cmp-socket、cmp-echarts、cmp-graph、
cmp-graph-editor、cmp-topology。

验证流程：
1. 读取包的 package.json 和入口文件，分析是否依赖 Vue 2 API
2. 检查是否使用了 Vue.extend / new Vue / this.$xxx 等 Vue2 专属 API
3. 检查是否依赖 ElementUI
4. 分类为：✅ 直接可用 / ⚠️ 部分可用（列出不兼容点）/ ❌ 不可用

输出一份兼容性报告到 D:/harnes-test/ss-harness-cmp/docs/compat-report.md
```

---

## Phase 1：共享层抽离（并行度 3）

### 并行任务

```
┌─────────────────────────────────────────────────────────┐
│                    Phase 1 并行启动                       │
│                                                         │
│  Agent A                Agent B              Agent C    │
│  ─────────              ─────────            ─────────  │
│  shared/types           shared/utils         compat/    │
│  + shared/api           + shared/constants   cmp-element│
│                                                         │
│  从各子应用的             从各子应用的          根据 Phase0│
│  api/ services/          utils/ common/       的映射表   │
│  提取公共接口定义          提取公共工具函数       用 Element │
│  生成 TS interface        转写为 TS            Plus 实现  │
│  封装 axios request       补充单测             同 API 组件 │
│                                                         │
│  涉及目录:               涉及目录:            涉及目录:   │
│  packages/shared/        packages/shared/     packages/  │
│  src/types/              src/utils/           compat/    │
│  src/api/                src/constants/       cmp-element│
└─────────────────────────────────────────────────────────┘
```

**关键：三个 Agent 操作不同目录，零文件冲突。**

---

## Phase 2：试点 scr-web（并行度 2）

scr-web 只有 68 个 .vue，拆 2 路即可。

### 串行前置

```
[人工/Agent] 添加 Qiankun lifecycle + 创建 Vue3 工程骨架 + 迁移路由/store
             ↓ 骨架就绪后启动并行
```

### 并行任务

```
┌───────────────────────────────────────┐
│          Phase 2 并行迁移              │
│                                       │
│  Agent A              Agent B         │
│  ─────────            ─────────       │
│  views/ 前半部分       views/ 后半部分  │
│  + components/        + layouts/      │
│                                       │
│  迁移规则:                             │
│  1. ElementUI → Element Plus          │
│  2. Options API → <script setup>      │
│  3. JS → TS                          │
│  4. 每个文件改完确保编译通过             │
└───────────────────────────────────────┘
             ↓ 合并后
        [人工] 联调测试
```

---

## Phase 3：批量迁移（核心并行阶段）

### 子应用间：串行（一个迁完再开下一个）

```
sms-web ──→ cmp-web ──→ cms-web ──→ cos-web ──→ csc-web
 3周         5-6周       5-6周       6-8周       8-12周
```

**为什么不跨子应用并行？**
- 迁移经验和 Codemod 脚本需要逐步积累和完善
- compat 层可能在迁移过程中发现新问题需要修补
- 同时开多条战线会分散 Review 精力，质量下降

### 子应用内：高度并行

#### sms-web（126 .vue，并行度 3）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       ↓

┌───────────────────────────────────────────────┐
│              sms-web 并行迁移                   │
│                                               │
│  Agent A          Agent B          Agent C    │
│  ─────────        ─────────        ─────────  │
│  views/模块1      views/模块2      components/ │
│  (~40 .vue)       (~40 .vue)       + common/  │
│                                    (~46 .vue)  │
│                                               │
│  每个 Agent 独立 git worktree                   │
│  共享 CLAUDE.md 约束                            │
└───────────────────────────────────────────────┘
       ↓ 合并
[人工] Review + 联调测试（~2天）
```

#### cmp-web（521 .vue，并行度 4-5）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换 cmp-element import
       ↓

┌─────────────────────────────────────────────────────────┐
│                  cmp-web 并行迁移                         │
│                                                         │
│  Agent A      Agent B      Agent C      Agent D    (E)  │
│  ─────────    ─────────    ─────────    ─────────       │
│  views/       views/       views/       views/          │
│  模块1        模块2        模块3        模块4           │
│  (~130 .vue)  (~130 .vue)  (~130 .vue)  (~130 .vue)     │
│                                                         │
│  可选 Agent E: 专门处理 components/ 公共组件               │
└─────────────────────────────────────────────────────────┘
       ↓ 分批合并（每路完成即 Review）
[人工] Review + 联调测试（~3天）
```

#### cms-web（521 .vue，并行度 4-5）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换（含 vue-class-component → setup、i18n 升级）
       ↓

┌─────────────────────────────────────────────────────────┐
│                  cms-web 并行迁移                         │
│                                                         │
│  Agent A      Agent B      Agent C      Agent D    (E)  │
│  ─────────    ─────────    ─────────    ─────────       │
│  views/       views/       views/       components/     │
│  模块1        模块2        模块3        + common/       │
│  (~130 .vue)  (~130 .vue)  (~130 .vue)  (~130 .vue)     │
│                                                         │
│  注意：cms-web 的 vue-class-component 装饰器改写          │
│  Codemod 已在串行阶段批量处理骨架，Agent 负责细节调整       │
└─────────────────────────────────────────────────────────┘
       ↓ 分批合并
[人工] Review + 联调测试 + i18n 多语言验证（~3天）
```

#### cos-web（567 .vue，并行度 4-5）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换
       + 验证 cmp-graph/graph-editor/topology 的 compat 层
       ↓

┌─────────────────────────────────────────────────────────┐
│                  cos-web 并行迁移                         │
│                                                         │
│  Agent A      Agent B      Agent C      Agent D   (E)   │
│  ─────────    ─────────    ─────────    ─────────       │
│  views/       views/       views/       views/          │
│  模块1        模块2        模块3        模块4           │
│                                                         │
│  ⚠️ 图/拓扑相关组件集中分配给一个 Agent（保持上下文一致）   │
│  ⚠️ CodeMirror/mavon-editor 相关也集中分配               │
└─────────────────────────────────────────────────────────┘
       ↓ 分批合并
[人工] Review + 联调测试 + 图/拓扑可视化回归（~4天）
```

#### csc-web（1,211 .vue，并行度 6-8）— 最大并行

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换
       + 添加 Qiankun lifecycle
       ↓

┌─────────────────────────────────────────────────────────────────┐
│                      csc-web 并行迁移                             │
│                                                                 │
│  Agent A     B        C        D        E        F       (G)(H) │
│  ────────  ────────  ────────  ────────  ────────  ────────     │
│  views/    views/    views/    views/    views/    views/        │
│  bill/     cmdb/     dashboard resource  monitor  system/       │
│            +datebase           -apply/   +ops/    +components/  │
│                                                                 │
│  (~200     (~200     (~200     (~200     (~200    (~200         │
│   .vue)     .vue)     .vue)     .vue)     .vue)    .vue)        │
│                                                                 │
│  按业务模块分工，每个 Agent 拥有完整的业务上下文                       │
│  ⚠️ common/ 和 layouts/ 由一个专门的 Agent 先行处理                 │
│  ⚠️ services/ API 层统一迁移后再分发                                │
└─────────────────────────────────────────────────────────────────┘
       ↓ 分批合并（每个模块完成即 Review，不等全部完成）
[人工] Review + 分模块联调 + 全量回归（~5天）
```

---

## Git Worktree 工作流

### 为什么用 worktree

```
问题：多个 Agent 同时改同一个仓库 → 文件冲突
方案：每个 Agent 在独立的 git worktree 中工作

主仓库 (main)
  ├── worktree-agent-a (branch: migrate/csc-bill)
  ├── worktree-agent-b (branch: migrate/csc-cmdb)
  ├── worktree-agent-c (branch: migrate/csc-dashboard)
  └── ...
```

### 操作流程

```bash
# 1. 为每个 Agent 创建 worktree
git worktree add ../worktree-agent-a -b migrate/csc-bill
git worktree add ../worktree-agent-b -b migrate/csc-cmdb

# 2. 每个 Agent 在自己的 worktree 中工作
# Agent A 只改 worktree-agent-a/csc-web/src/views/bill/
# Agent B 只改 worktree-agent-b/csc-web/src/views/cmdb/

# 3. Agent 完成后，人工 Review 并合并
git checkout main
git merge migrate/csc-bill
git merge migrate/csc-cmdb   # 无冲突（不同目录）

# 4. 清理 worktree
git worktree remove ../worktree-agent-a
```

### 目录边界规则

```
每个 Agent 的 CLAUDE.md 中必须明确：

## 你的工作范围
- 只修改 csc-web/src/views/bill/ 目录下的文件
- 不修改 csc-web/src/views/ 下的其他目录
- 不修改 csc-web/src/common/、layouts/、store/、router/
- 不修改其他子应用的任何文件
- 不修改 packages/ 下的任何文件
```

---

## Agent Prompt 模板

### 通用模板

```markdown
# 任务：迁移 {app-name} 的 {module} 模块

## 背景
你正在参与一个 Vue2 → Vue3 微前端升级项目。
项目使用 Qiankun 微前端架构，共 7 个应用（1 基座 + 6 子应用）。
当前迁移的是 {app-name} 子应用的 {module} 模块。

## 你的工作范围
- 只修改 {app-name}/src/views/{module}/ 目录下的文件
- 禁止修改该目录以外的任何文件

## 迁移规则
1. ElementUI → Element Plus（参考 CLAUDE.md 组件对照表）
2. Options API → <script setup lang="ts">
3. JS → TypeScript（严格类型，禁止 any）
4. this.xxx → 直接引用（setup 无 this）
5. Vuex mapState/mapActions → Pinia storeToRefs
6. cmp-element import → @ss-harness/compat/cmp-element
7. Vue filters → 普通函数
8. mixins → Composables

## 质量要求
- 每个文件改完确保 vue-tsc --noEmit 通过
- 保持功能完全一致，不优化业务逻辑
- 保持 CSS 类名和结构不变
```

### csc-web 大规模并行 Prompt 示例

```markdown
# 任务：迁移 csc-web 的计费管理模块（views/bill/）

## 背景
csc-web 是企业级管理平台，1,211 个 .vue 文件。
当前有 6 个 Agent 并行迁移不同业务模块，你负责 views/bill/。

## 你的工作范围
只修改以下目录：
- csc-web/src/views/bill/**

不得修改：
- csc-web/src/views/ 下的 cmdb/、dashboard/、datebase/ 等其他模块
- csc-web/src/common/、components/、store/、router/
- 其他子应用的任何文件

## 串行阶段已完成的工作
- Vue3 工程骨架已创建（router、store、main.ts）
- Codemod 已批量处理：ElementUI → Element Plus 基础替换
- cmp-element import 已批量替换为 @ss-harness/compat/cmp-element
- 你只需要处理 Codemod 未覆盖的细节 + Composition API 改写 + TS 类型补全

## 迁移规则
（同通用模板）

## 完成标准
- views/bill/ 下所有 .vue 文件已迁移为 <script setup lang="ts">
- 无 ElementUI 残留引用
- 无 this.xxx 残留
- vue-tsc --noEmit 通过
```

---

## 并行调度时间线

```
周次  Phase   并行 Agent 数   工作内容
────  ──────  ────────────   ──────────────────────────
W1-2  Ph.0    3              workspace搭建 + 自研包验证 + cmp-element映射 + Codemod
W3-4  Ph.1    3              shared/types + shared/utils + compat/cmp-element
W5-6  Ph.2    2              scr-web 迁移（68 .vue）
W7-9  Ph.3a   3              sms-web 迁移（126 .vue）
W10-14 Ph.3b  4-5            cmp-web 迁移（521 .vue）
W15-19 Ph.3c  4-5            cms-web 迁移（521 .vue）
W20-25 Ph.3d  4-5            cos-web 迁移（567 .vue）
W26-33 Ph.3e  6-8            csc-web 迁移（1,211 .vue）
W34-35 Ph.4   2              基座优化 + 全局清理
                             ──────────────
                             总计 ~35 周（含 buffer）

对比串行：27-41 周
并行后：  ~29-35 周（压缩 ~20%）

注：压缩主要体现在大型子应用内部。
    跨子应用仍然串行，因此总体压缩有限。
    如果团队允许 2 个子应用同时迁移（如 cmp + cms），可再压缩 4-6 周。
```

---

## 激进并行方案（可选）

如果团队有足够的 Review 能力，可以尝试跨子应用并行：

```
                    W7    W10   W15   W20   W26   W34
                    │     │     │     │     │     │
sms-web (126)       ████████                      │
cmp-web (521)             ██████████████          │
cms-web (521)             ██████████████          │  ← cmp + cms 并行
cos-web (567)                         ████████████│
csc-web (1211)                        ████████████████████
                                                  │
Phase 4                                           ████

激进方案总计：~25-29 周

前提条件：
1. cmp-web 和 cms-web 同时迁移，需要 8-10 个并行 Agent
2. Review 带宽足够（至少 2 人全职 Review）
3. compat 层在 Phase 1 已足够稳定
4. CI 门禁可靠，不依赖人工发现问题
```

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

### Agent 失败处理

```
如果 Agent 产出的代码有问题：

1. 不要让 Agent 在已有问题的基础上继续改
2. 记录问题到 CLAUDE.md 的"失败案例记录"
3. 回滚 Agent 的改动
4. 更新 CLAUDE.md 约束规则
5. 重新启动 Agent（带新约束）

这就是 Harness Engineering 的核心循环：
  失败 → 分析 → 加约束 → 重试
```

---

## 成本估算

| 阶段 | Agent 调用次数 | 说明 |
|------|--------------|------|
| Phase 0 | 3 | 自研包验证 + 映射表 + Codemod |
| Phase 1 | 3 | shared 三路并行 |
| Phase 2 (scr) | 2 | 68 .vue 两路 |
| Phase 3 (sms) | 3 | 126 .vue 三路 |
| Phase 3 (cmp) | 5 | 521 .vue 五路 |
| Phase 3 (cms) | 5 | 521 .vue 五路 |
| Phase 3 (cos) | 5 | 567 .vue 五路 |
| Phase 3 (csc) | 8 | 1,211 .vue 八路 |
| Phase 4 | 2 | 基座优化 + 清理 |
| **总计** | **~36 次 Agent 调用** | 分布在 29-35 周内 |

每次 Agent 调用处理 ~50-150 个 .vue 文件的迁移，单次工作量约 2-8 小时。

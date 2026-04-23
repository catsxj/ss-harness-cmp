# Git Worktree 工作流 + Agent Prompt 模板

> 从 overall-plan.md 拆出。多 Agent 并行的**技术细节** + **约束注入方式**。

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

每个 Agent 的 CLAUDE.md 中必须明确：

```
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
6. cmp-element import → @ss-cmp/cmp-element
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
- cmp-element import 已批量替换为 @ss-cmp/cmp-element
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

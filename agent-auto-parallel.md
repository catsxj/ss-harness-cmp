# 全自动 Agent 并行方案（无人工 Review）

> 主 Agent 编排，子 Agent 执行，自动合并 + 自动验证
> 人只需要在最后做一次功能验收

---

## 架构

```
你（用户）
  │
  │  下达指令："迁移 sms-web"
  │
  ▼
主 Agent（编排者）
  │
  ├── Step 1: 自己完成串行前置（骨架/store/router/services）
  │
  ├── Step 2: 自己跑 Codemod 预处理所有 .vue 文件
  │
  ├── Step 3: 同时派发 N 个子 Agent（worktree 隔离）
  │           每个子 Agent 只改指定目录
  │
  ├── Step 4: 子 Agent 全部返回后，自动合并分支
  │
  ├── Step 5: 跑 vue-tsc + eslint + vite build 验证
  │           ├── 通过 → 报告完成
  │           └── 失败 → 派发修复 Agent → 重新验证 → 循环
  │
  └── Step 6: 报告结果给你
              你只做最终的功能验收
```

---

## 为什么可以不人工 Review

| 传统顾虑 | 自动化替代方案 |
|---------|-------------|
| 代码写错了 | `vue-tsc --noEmit` 类型检查 + `eslint` 静态分析 |
| 合并冲突 | worktree 隔离 + 目录级分工 → **零冲突** |
| 改了不该改的文件 | Prompt 严格限定目录 + 合并前 `git diff --stat` 校验边界 |
| 功能被改变了 | `vite build` 构建验证 + 在基座中加载验证 |
| TS 类型不准 | `strict: true` + 禁止 `any` + vue-tsc 兜底 |

**关键保障：子 Agent 只改指定目录的 .vue 文件，不改 store/router/services/common，这些在串行阶段由主 Agent 一次性完成。**

---

## 实际执行流程（以 sms-web 为例）

### Round 1：主 Agent 串行完成基础层

主 Agent 自己做，不派发子 Agent：

```
1. 创建 Vue3 工程骨架
2. 迁移 store → Pinia（3 个模块）
3. 迁移 router（vue-router 4）
4. 迁移 services/ → TS
5. 迁移 common/utils + common/hooks + common/directive
6. 迁移 models/ + filters/ + icons/
7. 处理特殊依赖（cmp-element import 替换等）
8. 对所有 .vue 文件跑 Codemod（ElementUI 标签替换等）
9. 验证骨架可运行
```

### Round 2：派发 3 个子 Agent 并行迁移 .vue 文件

**一条消息，三个 Agent 调用，全部 `run_in_background: true`：**

```python
# 伪代码，实际用 Agent 工具

Agent(
    description="迁移 sms-web layouts+common 组件",
    isolation="worktree",
    run_in_background=True,
    prompt="""
    你的唯一任务：将以下目录中的 .vue 文件从 Vue2 迁移到 Vue3。
    
    工作目录：sms-web/src/layouts/**  和  sms-web/src/common/components/**
    共 31 个 .vue 文件。
    
    对每个 .vue 文件执行：
    1. <script> → <script setup lang="ts">
    2. Options API → Composition API
    3. this.xxx → 直接引用
    4. Vuex → Pinia（import { useAppStore } from '@/stores/app'）
    5. 补充 TS 类型，禁止 any
    6. Codemod 已处理了基础的 ElementUI → Element Plus 标签替换，
       你只需修正遗漏和处理逻辑层面的改动
    
    禁止修改以上目录之外的任何文件。
    完成后运行 cd sms-web && npx vue-tsc --noEmit 确认无报错。
    """
)

Agent(
    description="迁移 sms-web configs+monitor",
    isolation="worktree",
    run_in_background=True,
    prompt="""（同上，目录改为 views/configs/** 和 views/monitor/**）"""
)

Agent(
    description="迁移 sms-web permisson+小模块",
    isolation="worktree",
    run_in_background=True,
    prompt="""（同上，目录改为 views/permisson/** + login/ + log/ + about/ + errorPage/）"""
)
```

### Round 3：子 Agent 返回后，主 Agent 自动合并

```
子 Agent 完成后返回 worktree 路径和分支名。

主 Agent 执行：
1. git merge 三个分支（目录不重叠，零冲突）
2. git diff --stat 确认每个分支只改了指定目录的文件
3. 如果发现越界修改 → 回滚该分支，重新派发带更严格约束的子 Agent
```

### Round 4：主 Agent 自动验证

```bash
# 主 Agent 自己跑
cd sms-web
npx vue-tsc --noEmit          # 类型检查
npx eslint src/ --ext .ts,.vue # Lint 检查
npx vite build                 # 构建检查
```

**如果全部通过 → 报告完成。**

**如果失败 → 进入自愈循环：**

```
错误信息
  ↓
主 Agent 分析错误属于哪个模块
  ↓
派发修复 Agent（指定只改出错的文件）
  ↓
合并修复
  ↓
重新验证
  ↓
重复直到通过（最多 3 轮，否则上报人工）
```

---

## 自愈循环设计

```
Round 4 验证失败时：

主 Agent 读取 vue-tsc 的错误输出，例如：
  src/views/configs/setting/page/Login.vue(42,5):
    error TS2322: Type 'string' is not assignable to type 'number'

主 Agent 判断：
  - 文件属于 views/configs/ → 原 Agent A 的范围
  
主 Agent 派发修复 Agent：
  Agent(
      description="修复 sms-web configs 类型错误",
      prompt="""
      以下文件有 TypeScript 错误，请修复：
      
      src/views/configs/setting/page/Login.vue(42,5):
        error TS2322: Type 'string' is not assignable to type 'number'
      
      只修改报错的文件，不改其他文件。
      修复后运行 vue-tsc --noEmit 确认。
      """
  )
```

---

## 边界安全机制

### 防止子 Agent 越界

**方法 1：Prompt 约束（软限制）**
```
在 Prompt 中明确：
"你只能修改 sms-web/src/views/configs/ 目录下的文件。
 修改其他文件视为失败。"
```

**方法 2：合并前校验（硬限制）**
```bash
# 主 Agent 在合并前检查 diff
git diff --name-only main...agent-a-branch | grep -v "^sms-web/src/views/configs/"
git diff --name-only main...agent-a-branch | grep -v "^sms-web/src/views/monitor/"

# 如果有不在范围内的文件被修改 → 拒绝合并
```

**方法 3：合并后验证（兜底）**
```bash
# vue-tsc + eslint + vite build 三道门
# 任何一道不过都会触发修复循环
```

---

## 适用范围

| 场景 | 是否适合全自动 | 原因 |
|------|-------------|------|
| .vue 文件的 Options API → setup 改写 | ✅ 适合 | 模式化，vue-tsc 可验证 |
| ElementUI → Element Plus 组件替换 | ✅ 适合 | 对照表驱动，编译时可验证 |
| JS → TS 类型补全 | ✅ 适合 | vue-tsc strict 兜底 |
| Vuex → Pinia 状态迁移 | ⚠️ 串行做 | 全局影响，不适合并行 |
| router 迁移 | ⚠️ 串行做 | 全局影响 |
| services/ API 层 TS 化 | ⚠️ 串行做 | 被多模块引用 |
| 样式还原 / UI 回归 | ❌ 不适合 | 需要人眼看 |
| 业务逻辑正确性 | ❌ 不适合 | 需要人理解业务 |

**结论：.vue 文件的迁移改写（占工作量 80%）适合全自动并行。基础层（占 20%）串行由主 Agent 完成。**

---

## 完整一键执行脚本（你只说一句话）

你对我说：

```
迁移 sms-web，全自动并行
```

我会：

```
1. 读取 sms-web 目录结构
2. 创建 Vue3 工程骨架
3. 迁移 store/router/services/common（串行）
4. Codemod 预处理所有 .vue
5. 派发 3 个子 Agent 并行迁移 .vue（worktree 隔离）
6. 等待子 Agent 返回
7. 自动合并三个分支
8. 跑 vue-tsc + eslint + vite build
9. 如有错误 → 自动修复循环（最多 3 轮）
10. 全部通过 → 报告：
    "sms-web 迁移完成。125 个 .vue 已迁移为 Vue3 + TS + Element Plus。
     vue-tsc / eslint / vite build 全部通过。
     请做最终功能验收。"
```

**你的参与：只在最后打开浏览器看一眼功能是否正常。**

---

## 与人工 Review 方案的对比

| | 人工 Review 方案 | 全自动方案 |
|--|----------------|-----------|
| 人工介入 | 每个 Agent 产出都要 Review | 只在最后验收 |
| 质量保障 | 人眼 + CI | CI + 自愈循环 |
| 速度 | 受 Review 带宽限制 | 全速 |
| 风险 | 低（人兜底） | 中（依赖 CI 覆盖度） |
| 适合场景 | 核心业务、首次迁移 | 模式已验证、重复性迁移 |

**建议：scr-web（试点）用人工 Review 方案积累经验，之后的 sms/cmp/cms/cos/csc 用全自动方案。**

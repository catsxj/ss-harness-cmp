# cmp-web 并行迁移方案（521 .vue，5 Agent）

> 从 per-app.md 拆出。

## 项目特征

- 最大特殊依赖：cmp-socket、cmp-echarts、**cmp-element**（不可升级）
- 已有 @vue/composition-api
- 已有 Qiankun lifecycle
- 已有 vite.config.ts（Vue2 模式）

## Stage 1 串行前置（~3 天）

```
主 Agent 完成：
1. package.json → Vue3 + Element Plus + Pinia + Vite
2. vite.config.ts 改为 Vue3 模式
3. main.ts → Vue3 + Qiankun lifecycle
4. store/ → Pinia（读取各 module 后逐个转写）
5. router/ → vue-router 4
6. services/ 和 utils/ → TS 化
7. common/hooks/ → 直接迁移（已是 Composition API）
8. common/mixins/ → 转为 composables
9. Codemod 预处理：
   - ElementUI → Element Plus 标签
   - cmp-element import → @ss-cmp/cmp-element
   - .sync → v-model
   - this.$message → ElMessage
```

## Stage 2 并行拆分（5 Agent）

需要先了解 views/ 下的模块结构。按经验，521 个 .vue 应分布在 15-25 个子目录中。

```
┌──────────────────────────────────────────────────────────────────┐
│                     cmp-web 并行迁移                              │
│                                                                  │
│  Agent A          Agent B          Agent C          Agent D      │
│  ──────────       ──────────       ──────────       ──────────   │
│  views/           views/           views/           views/       │
│  模块组1          模块组2          模块组3          模块组4       │
│  ~130 .vue        ~130 .vue        ~130 .vue        ~130 .vue    │
│                                                                  │
│                          Agent E                                 │
│                          ──────────                              │
│                          common/components/                      │
│                          + layouts/                              │
│                          + components/                           │
│                          (~50 .vue)                              │
│                                                                  │
│  Agent E 先行 1 天（layouts 是其他 Agent 的依赖）                  │
└──────────────────────────────────────────────────────────────────┘
```

**拆分原则：**
- Agent E 负责公共层（layouts + common/components），先行启动
- Agent A-D 按 views/ 子目录均分，每路 ~130 个 .vue
- 具体哪些目录归哪个 Agent，需在 Stage 1 时根据实际目录结构决定

## cmp-element 处理策略

由于 cmp-element 不可升级，两种处理方式：

### 方案 1（推荐）：Codemod 在 Stage 1 批量替换

- 将所有 cmp-element 组件替换为 `@ss-cmp/cmp-element`（已在 sms-web Phase 2 实现）
- 10 个 API-兼容重新实现组件 + 3 个 A 档 port（CodeMirror / FullScreen / JsonView，explicit import）
- 大部分只需改 import 路径

### 方案 2：子应用本地写替代层

- 不推荐 —— 已有 `@ss-cmp/cmp-element` workspace 包可复用
- 仅当 cmp-web 有特殊业务需求（原版某组件 sms-web 没用到）时，考虑在 cmp-web 内写 local compat

## 特殊注意

**Phase 4 cmp-web 启动前必须先读** [../../.claude/memory/project_cmp_workspace_flow.md](../../.claude/memory/project_cmp_workspace_flow.md) 的"未验证组件清单"—— cmp-element 3 个 A 档 port（CodeMirror / FullScreen / JsonView）**仅编译未 runtime 验证**，cmp-web 业务页面实际使用时要先跑 smoke test。

vue.config.js 必须加三条 alias（见 pitfall 39）：

```js
config.resolve.alias
  .set('vue$', resolve('node_modules/vue'))
  .set('element-plus$', resolve('node_modules/element-plus'))
  .set('@element-plus/icons-vue$', resolve('node_modules/@element-plus/icons-vue'))
```

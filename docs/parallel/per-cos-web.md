# cos-web 并行迁移方案（567 .vue，5 Agent）

> 从 per-app.md 拆出。**最复杂的可视化子应用**。

## 项目特征

- **cmp-graph + cmp-graph-editor + cmp-topology**（不可升级，图/拓扑核心依赖）
- CodeMirror 5.60 → 需评估是否升级（`@ss-cmp/cmp-element` 已用 codemirror@5 做 A 档 port）
- mavon-editor 2.9 → 需替换 Vue3 版本
- echarts 5.3（已是 v5，好消息）
- Vue Draggable Resizable、Vue Grid Layout → 需替换 Vue3 版本
- **最复杂的可视化子应用**

## Stage 1 串行前置（~4 天）

额外工作：

### 1. 验证 @ss-cmp 已有的 graph 包

- `@ss-cmp/cmp-graph` 5 个 A 档 port（Editor / ContextMenu / MiniMap / Toolbar / ToolbarSimple）**仅编译，runtime 未验证**
- cos-web 是**首个真正用到这些组件**的子应用
- Stage 1 必须先跑一个 smoke test：新建一个 cos-web 页面 import `@ss-cmp/cmp-graph` 的 `Editor`，验证 Vue 3 + `@antv/g6-editor@^1.2.0` 能正常挂载 + 事件回调工作
- 详见 [../../.claude/memory/project_cmp_workspace_flow.md](../../.claude/memory/project_cmp_workspace_flow.md) "Phase 4 cmp-web 启动前必须先跑 smoke test 的组件"

### 2. cmp-graph-editor + cmp-topology 决策

- `cmp-graph-editor` 无可读源码 → 需要新增 `@ss-cmp/cmp-graph-editor` 或直接在 cos-web 内写 wrapper
- `@ss-cmp/cmp-topology` 空骨架 → Stage 1 时重新实现（业务用法参考 cos-web 现状）

### 3. 第三方库替换

- vue-draggable-resizable → `vue-draggable-resizable@3`（Vue3 版）
- vue-grid-layout → `grid-layout-plus`（Vue3 活跃分支，sms-web 已用）
- mavon-editor → `md-editor-v3` 或 `@kangc/v-md-editor@next`
- CodeMirror 5 → 保持 5.x，用 `@ss-cmp/cmp-element` 的 CodeMirror 组件

### 4. Codemod 标准预处理

## Stage 2 并行拆分（5 Agent）

```
┌──────────────────────────────────────────────────────────────────┐
│                     cos-web 并行迁移                              │
│                                                                  │
│  Agent A          Agent B          Agent C          Agent D      │
│  ──────────       ──────────       ──────────       ──────────   │
│  views/           views/           views/           views/       │
│  模块组1          模块组2          模块组3          模块组4       │
│  ~115 .vue        ~115 .vue        ~115 .vue        ~115 .vue    │
│                                                                  │
│                          Agent E                                 │
│                          ──────────                              │
│                          layouts/ + common/                      │
│                          + components/                           │
│                          (~110 .vue)                             │
└──────────────────────────────────────────────────────────────────┘

⚠️ 关键分工原则：
- 图/拓扑相关的页面集中分给 1 个 Agent（保持上下文一致）
- CodeMirror 相关页面集中分给 1 个 Agent
- 普通 CRUD 页面均分给其他 Agent
```

## 图/拓扑组件的特殊处理

### 方案 A：@ss-cmp/cmp-graph 的 5 个 A 档 port 可用

Agent Prompt 中说明直接 import 使用：

```ts
import { Editor, ContextMenu, MiniMap, Toolbar, ToolbarSimple, Flow } from '@ss-cmp/cmp-graph'
```

iconfont 路径风险（pitfall 注意）：`Editor.vue` 的 scoped style 里 `@import './fonts/iconfont.css'`。webpack 在 scoped style 下解析相对路径常有坑 —— **到时候很可能需要改为 `@import '@ss-cmp/cmp-graph/src/fonts/iconfont.css';` 或预加载到全局**。

### 方案 B：若 @ss-cmp/cmp-graph runtime 不可用

Stage 1 在 cos-web 内本地写 wrapper：

```vue
<template>
  <div ref="container"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CmpGraph from 'cmp-graph'  // 原包

const container = ref<HTMLDivElement>()
let instance: any = null

onMounted(() => {
  instance = new CmpGraph(container.value, options)
})
onUnmounted(() => {
  instance?.destroy()
})
</script>
```

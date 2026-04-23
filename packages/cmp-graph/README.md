# @ss-cmp/cmp-graph

原 `cmp-graph@1.0.0`（Vue 2 + `@antv/g6-editor` 老版图编辑器壳）的 Vue 3 A 档 port。保留 `@antv/g6-editor@^1.2.0`，不升级图库（G6 v4/v5 API 破坏性）。

## 组件清单

| 组件 | 原路径 | Ground truth |
|------|--------|--------------|
| **Editor** | `components/Editor.vue` | Vue 2 options API → Vue 3 `<script setup>`；G6Editor.Flow 挂载 + 事件转发（nodeClick / edgeClick） |
| **ContextMenu** | `components/ContextMenu.vue` | 纯模板（data-status / data-command），g6-editor 内部通过 DOM 查询激活菜单 |
| **MiniMap** | `components/MiniMap.vue` | el-slider 控制缩放；Element Plus @change 回调签名适配 |
| **Toolbar** | `components/Toolbar.vue` | 线型切换 radio-group；Element Plus `size="mini"` → `"small"`，`<el-radio label="x">` → `value="x"` |
| **ToolbarSimple** | `components/ToolbarSimple.vue` | 精简工具栏，纯模板 |

并且 re-export `Flow` 类（`@antv/g6-editor` 的 `new Flow({...})` 构造器）。

## 使用方式

### 全局注册

```ts
import { registerCmpGraph } from '@ss-cmp/cmp-graph'
registerCmpGraph(app)
```

### 按需引入

```ts
import { Editor, MiniMap, Toolbar, Flow } from '@ss-cmp/cmp-graph'
```

### iconfont

Editor.vue 的 scoped style 已 `@import './fonts/iconfont.css'`。Toolbar 的 `.iconfont` 图标类依赖这份字体。

## 与原版差异

- 所有 5 个 .vue 都从 Vue 2 options API port 到 Vue 3 `<script setup>` + TypeScript
- Editor 的 `methods` 通过 `defineExpose` 暴露给 template ref 调用方（`save / addPanel / changeEdge / changeZoom / update / nodeHasBeenLinked`）
- Element Plus 3 移除 `size="mini"` → 使用 `"small"`
- `<el-radio label="x">` → `<el-radio value="x">`（Element Plus 官方新 API）
- MiniMap 的 `@change` 回调类型适配 `number | number[]`

## 外部依赖

- `@antv/g6-editor@^1.2.0` — 图编辑器引擎（legacy 包，保持 v1.2）
- `@ss-cmp/design-tokens` — workspace 设计令牌
- `vue` peerDep
- `element-plus / @element-plus/icons-vue` peerDep（Toolbar 的 el-radio-group / MiniMap 的 el-slider 用）

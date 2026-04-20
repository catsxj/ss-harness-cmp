# Vue 2 第三方库的 Vue 3 替代方案

## 问题描述

多个 Vue 2 专用第三方库在 Vue 3 下报错（`_c is undefined`、组件无法注册等）。

## 替换清单

| Vue 2 包 | 报错症状 | Vue 3 替代 | API 差异 |
|---------|---------|-----------|---------|
| vue-seamless-scroll | `_c is undefined` | vue3-seamless-scroll | 组件名 `<Vue3SeamlessScroll>`，`:data` → `:list`，`:class-option` → 拆为独立属性 |
| @jiaminghi/data-view | `Failed to resolve component: dv-decoration-9` | @kjgl77/datav-vue3 | 组件名兼容，`app.use(DataVVue3)` 注册 |
| vue-count-to | 可能不兼容 | 评估中 | — |
| vuedraggable | 可能不兼容 | vuedraggable@next | `import draggable from 'vuedraggable'` 不变 |
| vue-grid-layout | 不兼容 | vue-grid-layout@3 | API 类似 |
| mavon-editor | 不兼容 | md-editor-v3 或 @kangc/v-md-editor@next | API 完全不同 |
| vue-class-component | Vue 3 不支持 | 改写为 `<script setup>` | 无替代，必须重写 |

## vue3-seamless-scroll 详细用法

```vue
<!-- 旧 -->
<vue-seamless-scroll :data="list" :class-option="{step: 1, singleHeight: 46}">

<!-- 新 -->
<Vue3SeamlessScroll :list="list" :step="1" :single-height="46">

<!-- import -->
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
```

## 适用范围

所有使用上述库的子应用

---
name: CMP 迁移踩坑记录
description: Vue2→Vue3 迁移中遇到的实际问题和修复方式，后续子应用迁移前必读
type: project
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
## 1. 环境变量
- `process.env.VUE_APP_*` 在 Vite 中不存在 → `import.meta.env.VITE_*`
- Vue CLI v5 仍支持 `process.env`，保持 Vue CLI 则无此问题

## 2. CSS url() 的 ~ 前缀
- `url('~assets/...')` 是 Webpack 语法，Vite 不识别 → `url('@/assets/...')`
- Vue CLI 仍支持 ~，但建议统一改 @/ 更通用

## 3. import .vue 后缀
- Vite 不自动补 .vue 后缀 → 所有 import 必须显式写 `.vue`
- Vue CLI（webpack）会自动解析，但加后缀是更规范的写法

## 4. ECharts v4 → v5
- `import echarts from 'echarts'` → `import * as echarts from 'echarts'`
- v4 配置语法（`itemStyle.normal`、`emphasis` 位置）会输出 DEPRECATED 警告，功能不受影响
- 首次迁移可忽略警告，后续统一清理

## 5. ECharts 组件 props.data 空值防护
- 组件挂载时 data 可能未加载，直接访问 `data.values` 报 TypeError
- 修复：useEcharts.ts 的 `doUpdate()` 加 `if (props.data)` 判断
- 每个 `updateChart` 函数开头加 `if (!props.data) return` 和 `if (!d.values || !d.keys) return`

## 6. vue-seamless-scroll
- Vue 2 版报 `_c is undefined` → 替换为 `vue3-seamless-scroll`
- 组件名 `<vue-seamless-scroll>` → `<Vue3SeamlessScroll>`
- 属性 `:data` → `:list`，`:class-option` → 拆分为 `:step` / `:single-height`

## 7. @jiaminghi/data-view
- Vue 2 版组件无法注册 → 替换为 `@kjgl77/datav-vue3`
- 组件名（`dv-decoration-9` 等）保持兼容，无需改模板

## 8. cmp-echarts 自研包替代
- 不可升级，直接引用本地子目录组件跳过封装层
- `import { BarCharts } from 'cmp-echarts'` → `import BarChart from './bar-charts/BarCharts.vue'`

## 9. 静态资源绝对路径
- `/scr-web/static/img/...` 在 Vite dev 下不可用 → 加 middleware 重写
- Vue CLI 通过 `publicPath` 处理，保持 Vue CLI 则无此问题

## 10. mixins → Composable
- `mixins: [xxx]` → `const { ... } = useXxx(props, callback)`
- echarts/mixins.js → echarts/useEcharts.ts
- `this.chart` → composable 返回的 `chart` ref

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

---

## sms-web 新增踩坑（2026-04-20）

## 11. el-submenu → el-sub-menu（组件+CSS）
- Element Plus 重命名：模板 `<el-submenu>` → `<el-sub-menu>`
- CSS 类 `.el-submenu`、`.el-submenu__title`、`.el-submenu__icon-arrow` 全部改 `.el-sub-menu-*`
- 多处踩：sidebarItem.vue 模板 + 全局 CSS（font.scss / lib/components/sidebar.scss / lib/element-ui.scss / sidebar/theme.scss）

## 12. keep-alive + router-view 包裹顺序颠倒
- 旧：`<keep-alive><router-view /></keep-alive>` 不再生效
- 新：`<router-view v-slot="{ Component }"><keep-alive :include="cachedViews"><component :is="Component" /></keep-alive></router-view>`

## 13. ::v-deep 块状语法失效
- `::v-deep { .sel {} }` 废弃 → `:deep(.sel) {}`

## 14. date-picker 的 picker-options 整体 prop 失效
- Element Plus 拆成独立属性：`:shortcuts` / `:disabled-date` / `:cell-class-name`
- shortcuts 项的回调签名改为 `value: () => [start, end]`（不再是 `picker.$emit('pick', [start, end])`）
- onPick 失效 → 用 `@calendar-change` 事件

## 15. value-format 日期格式区分大小写
- `yyyy-MM-dd` → `YYYY-MM-DD`（dayjs 语法）
- 时间分钟保持小写 `mm`（与 dayjs 分钟一致）

## 16. router ↔ store ↔ request 循环依赖
- 旧 `request.js` 静态 `import store from '@/store'`，Pinia 下会在初始化前被引用
- 改用动态 import：`Promise.all([import('@/stores/permission'), import('@/router')]).then(...)`

## 17. vue-router 4 的 resetRouter 实现
- 旧 `router.matcher = new Router().matcher` 不可用
- 新：遍历 `router.getRoutes()` 对每个不在常量路由名单中的路由调 `router.removeRoute(name)`

## 18. router-link 的 .native 修饰符全部移除
- 默认渲染 `<a>`，`@contextmenu.native` 无效
- 需自定义 DOM：`<router-link custom v-slot="{ navigate }"><span @click="navigate" @contextmenu="...">...</span></router-link>`

## 19. script setup 作用域扁平化引发命名冲突
- 组件注册名与函数名相同时（如 sms-web 的 `assignPool` 组件 + `assignPool()` 方法），script setup 扁平化后冲突
- 函数重命名：`handleAssignPool`

## 20. vue-class-component / vue-property-decorator 必须移除
- Vue 3 没有这两个包的对应实现（或很不完整）
- 所有 `@Component`、`@Prop`、`@Watch`、`extends Vue` 全部改写为 `<script setup lang="ts">`
- sms-web 涉及 3 个文件：login/lockme.vue、configs/namerule.vue、layouts/components/personal/index.vue

## 21. webpack 5 + Vue CLI 5 配置迁移
- `jsonpFunction` → `chunkLoadingGlobal`
- sass-loader 14+ `prependData` → `additionalData`
- `compress-webpack-plugin` 已弃 → 用 `compression-webpack-plugin`

## 22. Vuex → Pinia 的权限 store 循环依赖
- 旧 Vuex `permission.js` 直接 `import router from '@/router'` 调用 `router.addRoute()`
- 新 Pinia 让 `generateRoutes(asyncRouterMap, router)` / `resetRoutes(router, resetRouterFn)` 接受参数注入，store 不直接 import router

## 23. el-tabs 的 value → model-value
- ElementUI `<el-tabs :value="x">` 生效
- Element Plus 必须用 `<el-tabs v-model="x">` 或 `<el-tabs :model-value="x" @update:model-value="">`

## 24. $parent.$refs 调兄弟组件的 getPostData
- sms-web 三个 AddDialog（configs/、component/、tenant/）原用 `this.$parent.$refs['xxx']` 访问父级 slot 中兄弟组件
- 迁移过渡用 `getCurrentInstance().parent.refs`，但 script setup 下 `$refs` 不自动暴露，需父组件用 `ref` 显式拿；标 TODO 后续重构

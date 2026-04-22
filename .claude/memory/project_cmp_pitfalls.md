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

---

## sms-web 第二轮踩坑（2026-04-21 基座联调）

## 25. cmp-element compat 层策略
- 自研包不升级源码；在 `src/common/compat/` 用 Element Plus + 自研设计系统重写
- 15 个组件：BasicForm/BasicFormItem/BasicTable/AdvanceTable/CommonDetail/CommonDetailItem/StatusIcon/SvgIcon/Empty + 6 echarts + 1 loop 别名
- AdvanceTable 最复杂：覆盖搜索栏（4 种 input type）+ 分页 + 7 事件 + 9 方法 + 列 scopedSlots + mount 自动 getList

## 26. cmp-echarts compat 层
- `echarts@5.5` + `echarts-liquidfill@3.1` 自建封装
- 共享 `useChart` composable：统一主题色 + 字体 + 网格线 + 空值防护
- TypeScript `moduleResolution` 必须 `node` → `bundler`，否则 echarts v5 ESM-only 解析失败

## 27. vue-grid-layout@3.0.0-beta1 与 Vue 3 不兼容
- `VueGridLayout.GridLayout` 运行时为 undefined → `<grid-layout>` 渲染 null → "Invalid vnode type" 错误
- 替换为 `grid-layout-plus@^1.1.1`（Vue 3 原生活跃维护分支）
- API 基本一致：`import { GridLayout, GridItem } from 'grid-layout-plus'`，`v-model:layout` 替代 `:layout`

## 28. `<component :is="'StringName'">` 在 script setup 下不自动解析
- Vue 3 script setup 的 import 的组件标识符只在 `<ComponentName>` 语法下自动注册
- `<component :is="someString">` 需要手动映射 `const map = { Name: Component }`
- setting_dashboard/index.vue 用这个模式

## 29. Element Plus CSS 变量全局令牌
- 在 `:root` 设置 `--el-component-size: 32px` / `--el-color-primary: #2563eb` 等
- 所有 el-input/select/date-editor/button 自动跟随 32px 高 + 蓝主色
- 比逐组件 :deep 覆盖更干净

## 30. el-date-picker daterange 压缩难题
- 默认 ~360px，即使 `style="width: 240px"` 也被 `.el-date-editor--daterange` 的 min-width 撑开
- 解决：`:deep(.el-date-editor--daterange)` 加 `width: 240px !important` + 两边 `.el-range-input` 显式 `width: 88px`
- 文字分隔符和图标 flex-shrink: 0 防压缩塌陷

## 31. Qiankun 子应用 router base
- 子应用 router history base 必须匹配主应用 activeRule
- `createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/sms-web' : '/')`
- 否则主应用跳 `/sms-web/xxx` 时子应用 router 只认 `/xxx`，报 "No match"

## 32. Dev server runtime errors overlay
- Webpack Dev Server 4 默认开启运行时错误遮罩
- 后端超时（常见于开发环境）会刷屏遮罩
- `devServer.client.overlay = { errors: true, warnings: false, runtimeErrors: false }` 只保留编译错误

## 33. script setup 作用域命名冲突（第二类案例）
- HostOverview.vue：`import userDefind from './userDefind.vue'` + `function userDefind()`
- 与之前 assignPool 类似，Vue 3 扁平作用域
- 解决：方法改名 `handleUserDefind()`

## 34. 单参 slot 绑定失效
- Vue 2：`<template slot="status" slot-scope="status">` → `status` 是值
- Vue 3：`<template #status="status">` → `status` 是整个 slot props 对象
- sms-web 22 处批量用 node 脚本修：`#x="ident"` → `#x="{ val: ident, record }"` 保留原变量名

## 35. `el-button type="text"` 全面弃用
- Element Plus 3.0 移除，替换为 `link` 属性
- node 脚本批量替换 39 处，模板更规范

## 36. basic-form-item validate 需支持 object/array
- cmp-element `validate` 允许三种形态：String（预设键）、Object（FormItemRule）、Array
- compat BasicFormItem 全覆盖；maxlength 自动转换 `{ max: N }` 校验
- `:required` 从 validate/rules 推断确保必填 * 号显示

---

## sms-web 联调与回滚验收补记（2026-04-22）

## 37. 基座 app.json 启动时只读一次，切 entry 必须 F5
- `main-web/src/core/config.ts` 的 `getMicroApp()` 在 main-web 启动时 `axios.get('/config/app.json')` 一次，结果传给 `registerMicroApps`
- 改 `public/config/app.json` 的 entry（如回滚切旧版端口）后**必须在浏览器 F5 强刷**才能生效
- 项目 `docs/operations/rollback.md` 里"无需重启"的说法不准确 —— 需要 F5 触发 main-web 重新拉 app.json
- cmp-web 迁完跑回滚演练时记得先 F5

## 38. packData 类函数对空数据 / 空父节点访问 undefined.id
- `sms-web/src/views/monitor/components/next.vue` 的 `packData` 计算父子节点居中连接辅助边时
- 当 API 成功响应但 data 为空数组（如 dev 环境后端 `192.168.4.111:60006` 不通），`oldChildNodes` / `newChildNodes` 为空
- `Math.floor(0/2) - 1 = -1` → `arr[-1]` 返回 undefined → 访问 `.id` 抛 TypeError
- 修复思路：连接边生成块外加 `if (oLen > 0 && nLen > 0)` 守卫
- **Vue 2 原版同样 latent bug**，生产环境 API 始终有数据就不触发
- cmp-web 迁移时主动排查：任何"API 成功 + data 可能为空"场景都要在遍历/索引前检查长度
- （sms-web 本轮暂未修改，留作已知问题）

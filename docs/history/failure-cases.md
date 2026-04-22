# 失败案例记录

> 每次 Agent 迁移出错在此追加。**只追加，不删除**。
> 遇到熟悉的报错先到这里搜。详细技术分析见 [`.claude/memory/project_cmp_pitfalls.md`](../../.claude/memory/project_cmp_pitfalls.md)（Claude 私有记忆，内容更深）。
>
> 格式：日期 | 问题 | 原因 | 修复方式

---

| 日期 | 问题 | 原因 | 修复 |
|------|------|------|------|
| 2026-04-20 | ECharts 组件挂载报 TypeError | props.data 为 undefined 时直接访问 .values | updateChart 开头加 `if (!props.data) return` |
| 2026-04-20 | vue-seamless-scroll 报 _c undefined | Vue 2 版不兼容 Vue 3 | 替换为 vue3-seamless-scroll |
| 2026-04-20 | data-view 组件无法注册 | @jiaminghi/data-view 不兼容 Vue 3 | 替换为 @kjgl77/datav-vue3 |
| 2026-04-20 | CSS 背景图不显示 | `url('~assets/...')` Webpack 语法 | 改为 `url('@/assets/...')` |
| 2026-04-20 | cmp-echarts 模块找不到 | 自研包不可升级 | 改为引用本地子目录组件 |
| 2026-04-20 | process.env 未定义 | Vite 中无 process.env | 改为 import.meta.env（仅 Vite 场景） |
| 2026-04-20 | el-submenu 组件和 CSS 类在 Element Plus 中改名 | Element Plus 把 submenu 全部改为 sub-menu | 模板 `<el-submenu>` → `<el-sub-menu>`，CSS `.el-submenu*` → `.el-sub-menu*`（含 `__title`/`__icon-arrow`） |
| 2026-04-20 | `<keep-alive><router-view>` 不再生效 | Vue 3 router-view 用 slot 暴露组件 | 改为 `<router-view v-slot="{ Component }"><keep-alive><component :is="Component" /></keep-alive></router-view>` |
| 2026-04-20 | `::v-deep { sel {} }` 块状写法失效 | Vue 3 + scoped 已废弃该语法 | 改为函数式 `::v-deep(sel)` 或推荐的 `:deep(sel)` |
| 2026-04-20 | date-picker `picker-options` 整体 prop 失效 | Element Plus 拆分为独立属性 | `shortcuts` / `disabled-date` 独立 prop；`shortcuts.onClick` 回调改为 `value: () => [start, end]` |
| 2026-04-20 | `value-format="yyyy-MM-dd"` 不生效 | Element Plus 用 dayjs，格式区分大小写 | 改为大写 `YYYY-MM-DD`（含 HH:mm:ss 保持原样） |
| 2026-04-20 | router ↔ store ↔ request 循环依赖 | request.js 同步 import store，Pinia 未初始化 | 改用动态 `Promise.all([import('@/stores/permission'), import('@/router')])` |
| 2026-04-20 | resetRouter 原 `router.matcher = newRouter.matcher` 失效 | vue-router 4 无 matcher 对外 API | 遍历 `router.getRoutes()`，`removeRoute(name)` 所有非常量路由 |
| 2026-04-20 | `router-link @contextmenu.native` 失效 | Vue 3 router-link 的 .native 修饰符移除 | 用 `<router-link custom v-slot="{ navigate }">` + 内部 DOM 自行绑定 |
| 2026-04-20 | sms-web 的 `<assignPool>` 组件与 `assignPool()` 方法同名冲突 | script setup 扁平化作用域 | 方法重命名为 `handleAssignPool` |
| 2026-04-20 | vue-class-component / vue-property-decorator 在 Vue 3 不可用 | Class 组件 API 废弃 | 三个文件（lockme/namerule/personal）全部改写为 `<script setup lang="ts">` |
| 2026-04-20 | webpack 5 `jsonpFunction` 不识别 | webpack 5 重命名 | 改为 `chunkLoadingGlobal` |
| 2026-04-20 | sass-loader 新版 `prependData` 无效 | sass-loader 8+ 改名 | 改为 `additionalData` |
| 2026-04-20 | `compress-webpack-plugin` 与 webpack 5 不兼容 | 包名变更 | 改用 `compression-webpack-plugin` |
| 2026-04-21 | main-web hack.scss 报 "Expected whitespace" | Dart Sass 严格模式要求 `@media screen and (` 中有空格 | `@media screen and(-ms-...)` → `@media screen and (-ms-...)` |
| 2026-04-22 | 回滚演练中改了 app.json entry 但不生效 | main-web 启动时一次性读 app.json 并注册，修改后需 F5 重读 | 改配置后浏览器 `Ctrl+Shift+R` 强刷 |
| 2026-04-22 | monitor/next.vue packData 在 mount 报 TypeError `Cannot read 'id' of undefined` | API 返回空 data 时 `arr[Math.floor(0/2)-1] = undefined`；Vue 2 同样 latent bug | 连接边块外加 `if (oLen > 0 && nLen > 0)` 守卫（sms-web 本轮暂未修，记作已知问题） |

# sms-web 迁移总结

> 第二个迁移子应用 | 代码迁移完成日期：2026-04-20 | 基座联调通过：2026-04-21
> 分支：feature/migrate-sms-web（待合并到 develop）
> 前置：v2-sms-web tag

---

## 迁移范围

| 项目 | 迁移前 | 迁移后 |
|------|--------|--------|
| Vue | 2.6.14 | 3.4 |
| 构建工具 | Vue CLI 4.4 | Vue CLI 5（webpack，**非 Vite**） |
| UI 库 | ElementUI 2.13 | Element Plus 2.7 |
| 状态管理 | Vuex 3 + 3 模块 | Pinia 2 + 3 stores |
| 路由 | vue-router 3.3 | vue-router 4.3 |
| TS | 3.9 + experimentalDecorators | 5.4 + useDefineForClassFields |
| Composition API | @vue/composition-api | Vue 3 原生 |
| 日期 | dayjs（已是） | dayjs |
| 富文本 | wangeditor 4 | @wangeditor/editor + editor-for-vue@5 |
| 可拖拽 | vuedraggable 2 | vuedraggable 4（next） |
| 栅格布局 | vue-grid-layout 2 | vue-grid-layout 3 |
| Class 组件 | vue-class-component + vue-property-decorator | **全部移除**，改 `<script setup>` |
| i18n | vue-i18n 8（禁用） | 延后（vue-i18n@9 待启用） |

## 代码规模

```
.vue 文件：125 个（比原 126 少 1 个 —— 删除 TagsView/index_backup.vue）
基础层：25 个 ts/vue 文件（main/App/stores/router/utils/hooks/config 等）
分 2 个 feature commit：
  - 8e33414 Stage 1+2a：基础层 + layouts + common/components（30 .vue）
  - 81a7a1a Stage 2b：views/（94 .vue）
```

---

## 关键决策

### 1. 保持 Vue CLI 构建（不切 Vite）
- scr-web 特例已切 Vite；sms-web 严格遵守 CLAUDE.md feedback，**保持 vue-cli-service**
- `@vue/cli-service` 升级到 5.0（支持 Vue 3 + webpack 5）
- 保留 `vue.config.js`，修正：
  - `jsonpFunction` → `chunkLoadingGlobal`（webpack 5 重命名）
  - `css.loaderOptions.sass.prependData` → `additionalData`（sass-loader 新 API）
  - `compress-webpack-plugin` → `compression-webpack-plugin`（前者已废弃）
  - 保留所有 alias、svg-sprite-loader、proxy 配置

### 2. 自研包 compat 层（本轮新增）
- `cmp-element`：不升级源码，在 `src/common/compat/` 下用 Element Plus 二次封装 + 设计系统重做
- `cmp-echarts`：用 `echarts@5.5` + `echarts-liquidfill@3.1` 自建封装
- `cmp-socket`：`useWebsocket` composable 中仍 `new WebSocket({...})` 使用 cmp-socket 的类（类仅 JS，不直接依赖 Vue API，可继续工作）
- `cmp-element/utils/handleSearchParam`：本地 vendor 在 `src/common/utils/index.ts`

**Compat 组件全集**（15 个）：
| 组件名 | 对应 Element Plus 基座 | 附加能力 |
|--------|----------------------|----------|
| BasicForm / BasicFormItem | el-form / el-form-item | validate 预设规则映射（来自 @/validate）、maxlength 自动转 max 校验、Promise 化 validate |
| BasicTable | el-table | 分页 + 暴露 9 个 el-table 方法 |
| AdvanceTable | el-table + 自研包装 | 内置搜索栏（Input/Select/DateRange/DatePicker）+ 自定义分页 + 9 个方法 + 7 个事件 + 列 scopedSlots |
| CommonDetail / CommonDetailItem | el-row + el-col | item_container/custom_content slot + col 栅格 |
| StatusIcon | 自绘药丸 | 6 种状态色（normal/primary/success/warning/danger/disabled）+ bgColor/borderColor |
| SvgIcon / Icon | svg + use | 对接 svg-sprite-loader |
| Empty | 自绘 | imgUrl/icon/description |
| BarCharts / BarReverseCharts / LineCharts / PieCharts / GaugeCharts / LiquidFillCharts | echarts@5 | 统一 Technical Precision 主题（蓝主色 + 等宽数字 + 克制网格线）|
| LoopCharts | PieCharts 别名 | 循环切换 pie 展示 |

**设计系统（Technical Precision）**：定义在 `src/common/compat/tokens.scss`
- 主色 `#2563eb`（克制深蓝），背景冷灰白 `#f7f8fa`，文字炭灰 `#0f172a`
- 字体：`ui-serif`（标题）/`ui-sans-serif`+`PingFang SC`（正文）/`ui-monospace`（数据）
- 组件高度统一 32px（输入/按钮/选择/日期）
- 动画缓动 `cubic-bezier(0.32, 0, 0.16, 1)`，单次 120-200ms

### 3. i18n 暂缓
- `vue-i18n@8` 与 Vue 3 不兼容；升级到 v9 需要改 messages 结构
- 当前 sms-web 实际未启用 i18n（main.ts 已注释）
- 迁移中所有 `this.$t('xxx')` → 硬编码中文 + `// TODO: i18n`
- `src/lang/index.ts` 仅保留 `getLanguage()` 供 store 初始化

### 4. request.ts 的循环依赖打破
- 旧版 `request.js` `import store from '@/store'`，在 401/509 时 `store.dispatch('permission/ResetRoutes')`
- 新版用 **动态 import** 避免 router ↔ permissionStore ↔ request 循环：
  ```ts
  Promise.all([
    import('@/stores/permission'),
    import('@/router')
  ]).then(([{ usePermissionStore }, { default: router, resetRouter }]) => {
    usePermissionStore().resetRoutes(router, resetRouter)
  })
  ```

### 5. router 的 resetRouter 实现
- vue-router 4 不支持 `router.matcher = newRouter.matcher` 的重置方式
- 改为：遍历 `router.getRoutes()`，移除名字不在常量路由表里的所有路由
- `generateRoutes`/`changeRoutes`/`resetRoutes` 改为函数参数注入 `asyncRouterMap` 和 `router`，store 内不直接 import router

---

## 踩坑记录（后续子应用必读）

### 1. el-submenu → el-sub-menu
- Element Plus 中 submenu 组件名和 CSS 类全部重命名
- 模板：`<el-submenu>` → `<el-sub-menu>`
- CSS：`.el-submenu`、`.el-submenu__title`、`.el-submenu__icon-arrow` 全部改 `.el-sub-menu-*`
- 涉及文件：`sidebarItem.vue`、`sidebar.vue`、`theme.scss`、`common/css/font.scss`、`common/css/lib/components/sidebar.scss`、`common/css/lib/element-ui.scss`

### 2. date-picker API
- `picker-options` 整个对象不再是一个 prop，拆成独立属性：
  - `shortcuts` → `:shortcuts="[...]"`（回调改 `value: () => [start, end]`，不是 `picker.$emit('pick', [...])`）
  - `disabledDate` → `:disabled-date="fn"`
  - `onPick` → 用 `@calendar-change` 事件
- `value-format` 格式**必须大写**：`yyyy-MM-dd` → `YYYY-MM-DD`（dayjs 语法）

### 3. keep-alive + router-view
- Vue 3 中 `<keep-alive><router-view /></keep-alive>` 不再有效
- 必须：
  ```vue
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews" :max="cacheViewMax">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  ```

### 4. ::v-deep 语法
- `::v-deep { selector { ... } }` 块状写法在 Vue 3 + scoped 下已废弃
- 改为函数式：`::v-deep(.selector) { ... }` 或推荐的 `:deep(.selector) { ... }`

### 5. router-link 的 .native 修饰符
- Vue 3 `router-link` 默认渲染 `<a>`，`@contextmenu.native` 已废除
- 需要自定义 DOM：`<router-link custom v-slot="{ navigate }"><span @click="navigate" @contextmenu="...">...</span></router-link>`

### 6. vue-property-decorator / vue-class-component
- 3 个文件使用：`views/login/lockme.vue`、`views/configs/namerule.vue`、`layouts/components/personal/index.vue`
- **全部改写为 `<script setup lang="ts">`**，不保留任何装饰器；新依赖中这两个包已移除

### 7. vuedraggable@4 用法变化
- 需要显式 `item-key`
- 具名作用域插槽 `#item="{ element }"`
- `@end` 事件仍可通过 `e.item.getAttribute(...)` 读取 DOM 属性

### 8. el-input slot="append" / el-form-item slot 变化
- 旧：`<el-input><el-button slot="append" /></el-input>`
- 新：`<el-input><template #append><el-button /></template></el-input>`

### 9. el-tabs 的 value prop
- ElementUI：`<el-tabs :value="x">` 双向绑定
- Element Plus：改用 `<el-tabs v-model="x">` 或显式 `<el-tabs :model-value="x" @update:model-value="...">`

### 10. webpack 5 配置变更
- `jsonpFunction` → `chunkLoadingGlobal`
- `url-loader` 在 webpack 5 中可用 `asset/inline` 替代，但当前仍用 url-loader 保持兼容

### 11. request.js 中 store 的循环依赖
- 旧版同步 `import store from '@/store'` 导致 Pinia 未初始化时报错
- 改为动态 import（见上文"关键决策"第 4 条）

### 12. realLog.vue 的 WebSocket 不要强切 composable
- `useWebsocket` composable 连的是 `/api/sms/messageService`
- `realLog.vue` 连的是 `/api/sms/logViewService`（不同 URL）
- **保留 `new WebSocket(url, token)` 直调**，仅把 `beforeDestroy` 改为 `onBeforeUnmount` 并补关闭 socket

### 13. 父子组件通过 $parent.$refs 互调
- 3 个 `AddDialog.vue`（configs/、component/、tenant/）原用 `this.$parent.$refs['xxx']` 访问兄弟组件的 `getPostData`
- 迁移后用 `getCurrentInstance().parent.refs` 桥接，加 `// TODO: type`
- 后续随 cmp-element compat 层改造时统一重构为更规范的 provide/inject 或 emit

### 14. assignPool 命名冲突
- tenant/index.vue 中 `<assignPool>` 组件同时又有 `assignPool()` 方法
- Vue 2 下通过 `this.assignPool(...)` 区分作用域，Vue 3 script setup 扁平化后冲突
- 解决：函数改名 `handleAssignPool()`

### 15. userDefind 组件 / 方法命名冲突
- monitor/components/HostOverview.vue：`import userDefind from './userDefind.vue'` + `function userDefind()`
- Vue 3 script setup 下冲突
- 解决：方法改名 `handleUserDefind()`

### 16. `<component :is="'StringName'">` 在 script setup 下不自动解析
- setting_dashboard/index.vue 的动态卡片用字符串 `:is` 无法 resolve 到 import 的组件
- 解决：建立 `cardComponents` Record 映射，`getComponent` 返回组件对象而非字符串

### 17. vue-grid-layout@3.0.0-beta1 不兼容 Vue 3
- 包结构仍是 Vue 2 默认导出形式，`VueGridLayout.GridLayout` 为 undefined → `<grid-layout>` 渲染为 null
- 解决：替换为 `grid-layout-plus@^1.1.1`（Vue 3 原生支持的活跃维护分支）
- API 基本一致，只需改 `import { GridLayout, GridItem } from 'grid-layout-plus'`，并用 `v-model:layout` 替代 `:layout`

### 18. echarts v5 + echarts-liquidfill 集成
- package.json 加 `echarts@^5.5` + `echarts-liquidfill@^3.1.0`
- LiquidFillCharts 内 `import 'echarts-liquidfill'` 触发注册
- TypeScript `moduleResolution` 必须从 `node` 改为 `bundler`，否则 echarts v5 的 ESM-only 包无法解析

### 19. Element Plus 默认尺寸全局令牌
- 全局 `src/common/css/global-ui.scss` 设置 `:root { --el-component-size: 32px; --el-color-primary: #2563eb; ... }`
- 覆盖所有 el-input/select/date-editor/button 到统一 32px 高

### 20. `<el-date-picker type="daterange">` 压缩 240px
- EP 默认 daterange 约 360px，即使 `style="width: 240px"` 也被内部 min-width 撑开
- 解决：`:deep(.el-date-editor--daterange)` + `:deep(.el-range-input)` 显式 `width: 88px !important`

### 21. Qiankun 子应用 router base
- 子应用 router 必须用 `baseUrl = '/sms-web'` 作为 history base 匹配主应用 activeRule
- `createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/sms-web' : '/')`
- 独立 dev 时也能工作（直接访问 `http://localhost:8091/sms-web/login`）

---

## Vuex → Pinia 迁移模式

### 旧 Vuex store 结构
```
store/
├── index.js        — new Vuex.Store + require.context 自动注入 modules
├── getters.js      — 全局 getter 聚合
├── utils.js        — setBrowser/urlToList 工具
└── modules/
    ├── app.js        (namespace=false)
    ├── permission.js (namespace=true)
    └── tagsView.js   (namespace=true)
```

### 新 Pinia 结构
```
stores/
├── index.ts         — export useXxxStore + createPinia 默认导出
├── utils.ts         — setBrowser/urlToList
├── app.ts           — useAppStore（Composition API 风格）
├── permission.ts    — usePermissionStore（方法接 router/asyncRouterMap 参数避免循环依赖）
└── tagsView.ts      — useTagsViewStore
```

### 命名差异
- Vuex mutations 用大写下划线：`SET_USERDATA`, `SETTING_PAGE_CONFIG`, `TOGGLE_SIDEBAR`
- Pinia 统一小驼峰：`setUserData`, `settingPageConfig`, `toggleSidebar`
- Vuex namespaced actions 路径：`dispatch('permission/ResetRoutes')`
- Pinia 直接调用：`permissionStore.resetRoutes(router, resetRouter)`

### 组件访问
```ts
// 旧
computed: { ...mapState({ foo: state => state.app.foo }) }
this.$store.commit('SET_USERDATA', data)
this.$store.dispatch('permission/ResetRoutes')
context.root.$store.getters.userData

// 新
const appStore = useAppStore()
appStore.foo            // 直接读
appStore.setUserData(data)
const permissionStore = usePermissionStore()
permissionStore.resetRoutes(router, resetRouter)
```

---

## 技术债（待偿还）

| 类型 | 位置 | 说明 | 优先级 |
|------|------|------|-------|
| cmp-element | 所有用 `basic-form/basic-table/AdvanceTable/common-detail` 的文件 | 自研包不升级，需 compat 层 | 高（合并前） |
| cmp-echarts | `setting_dashboard/*` | `line-charts/bar-reverse-charts` 等封装标签保留 | 中 |
| type | 约 50 处 `ref<any>` 或 `any` 强转 | basic-form ref 实例无公开类型 | 低（compat 层后） |
| i18n | 全部 `$t` 调用处 | 硬编码中文，vue-i18n@9 后启用 | 低（非阻塞） |
| WebSocket | `useWebsocket.ts` `webSocket: any` | cmp-socket 无类型 | 低 |
| parent refs | `configs/AddDialog.vue`, `component/AddDialog.vue`, `tenant/AddDialog.vue` | `getCurrentInstance().parent.refs` 过渡 | 中 |

全部已在对应代码处加 `// TODO: cmp-element`、`// TODO: i18n`、`// TODO: type` 标记，可用 `docs/tech-debt-tracking.md` 中的扫描命令统计。

---

## 已完成项 ✅

- [x] `pnpm install` 验证通过（cmp-element/cmp-echarts 全部用应用侧 compat 层替代）
- [x] `eslint src/ --ext .ts,.vue` **0 errors**
- [x] `vue-cli-service build` 通过（5.6 MB 产物）
- [x] `vue-cli-service serve` 独立 dev server 可用
- [x] **Qiankun 基座集成**：main-web (:8080) 挂载 sms-web (:8091) 全链路通过
- [x] 动态路由 base `/sms-web` 匹配 Qiankun activeRule
- [x] 更新 CLAUDE.md 状态表 ⬜ → 🟡 → ✅

## 待后续阶段

- [ ] 性能基线记录到 docs/performance-baseline.md（需真实后端环境）
- [ ] 新旧共存联调测试 docs/coexistence-testing.md
- [ ] 合并 feature/migrate-sms-web → develop（由项目负责人批准）

---

## 给后续子应用（cmp/cms/cos）的提示

1. **保持 Vue CLI**：sms-web 已验证 @vue/cli-service v5 + webpack 5 + Vue 3 的三件套配置，可直接复用
2. **cmp-element 保留策略**：所有 basic-* / AdvanceTable / common-detail 组件标签**不改**，等 compat 层统一处理；避免在迁移阶段踩"UI 组件 API 改不完"的坑
3. **Pinia store 工厂模式**：sms-web 的 permission store 用 `generateRoutes(asyncRouterMap, router)` 函数参数注入，避免与 router 循环依赖，可复用这一模式
4. **request.ts 动态 import**：401/509 重置权限的 `import('@/stores/permission')` 动态 import 模式直接可复用
5. **vue-class-component → script setup**：cmp-web / cms-web / cos-web 使用 vue-class-component 的文件会更多，准备大量的装饰器 → `<script setup>` 重写
6. **`assignPool`/`ThirdMenu` 这类"组件与方法同名"冲突**：script setup 扁平化后需要重命名函数（`handleAssignPool` 等）
7. **i18n 延后**：如果 cms-web 大量用 $t，考虑先写一个 useI18n 占位 composable 让 `$t('key')` 调用不报错，Stage 3 再接真实 vue-i18n@9

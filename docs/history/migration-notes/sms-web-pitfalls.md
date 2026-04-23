# sms-web 迁移踩坑记录

> 从 migration-notes/sms-web.md 拆出（doc-size-limit）。21 条 Phase D 实战踩坑，后续子应用（cmp/cms/cos）迁移前必读。

---

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

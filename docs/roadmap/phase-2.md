# Phase 2：试点迁移 scr-web

**目标：用最小的子应用（68 个 .vue）验证完整迁移流程**
**预计周期：2-3 周**

## 执行状态

✅ **已完成**（2026-04-20 前）。scr-web 作为特例使用了 Vite（其他子应用保持 Vue CLI）。

---

## 2.1 为什么选 scr-web

| 标准 | scr-web 情况 |
|------|------------|
| 页面数量 | **68 个 .vue**（最少） |
| 业务复杂度 | 可视化展示为主，逻辑相对独立 |
| 耦合度 | 与其他子应用耦合最少 |
| 特殊情况 | **没有 Qiankun lifecycle**（需要额外添加） |
| 特殊依赖 | Three.js, AntV G6/L7, Leaflet, ECharts 4.9 |

## 2.2 scr-web 特殊处理

### 问题 1：缺少 Qiankun lifecycle

scr-web 和 csc-web 当前都用 `new Vue()` 直接挂载，没有 export bootstrap/mount/unmount。需要：

```
Step 0（scr-web + csc-web 都需要）：
├── 在 Vue 2 版本中先添加 Qiankun lifecycle 导出
├── 确认在基座中能正常加载/卸载
└── 再开始 Vue 3 迁移
```

### 问题 2：可视化库升级

| 当前 | 目标 | 说明 |
|------|------|------|
| ECharts 4.9.0 | ECharts 5.x | API 有 breaking change |
| Three.js 0.122.0 | Three.js 最新 | 类型定义改善 |
| AntV G6 (旧版) | @antv/g6 5.x 或保持 | 评估升级必要性 |
| Leaflet | 保持 | 基本兼容 |

**建议：可视化库升级可与 Vue3 迁移分开，先保持当前版本跑通 Vue3，再逐步升级。**

## 2.3 迁移步骤

```
Step 0: 给 Vue2 版 scr-web 添加 Qiankun lifecycle（确认基座加载正常）
Step 1: 基于模板创建新的 scr-web（Vite + Vue3 + TS）
Step 2: 迁移路由（vue-router 3 → 4）
Step 3: 迁移状态管理（Vuex 3 → Pinia）
Step 4: 迁移 API 层（指向 shared）
Step 5: 逐页面迁移 68 个组件
        ├── ElementUI → Element Plus
        ├── Options API → <script setup>
        ├── JS → TS
        ├── 可视化组件保持库版本不变，只改 Vue 集成方式
        └── 每迁完一个页面立即在基座中验证
Step 6: 在基座配置中切换 scr-web 入口
Step 7: 回归测试
```

## 2.4 组件迁移对照表

### ElementUI → Element Plus

| ElementUI | Element Plus | 关键变化 |
|-----------|-------------|---------|
| `<el-dialog :visible.sync>` | `<el-dialog v-model>` | .sync → v-model |
| `<el-button @click.native>` | `<el-button @click>` | 移除 .native |
| `this.$message()` | `ElMessage()` | 需 import |
| `this.$confirm()` | `ElMessageBox.confirm()` | 需 import |
| `this.$loading()` | `ElLoading.service()` | 需 import |
| `<i class="el-icon-edit">` | `<Edit />` | @element-plus/icons-vue |
| `<el-table>` | 基本兼容 | slot 写法 #default="scope" |
| `<el-form>` validate | 基本兼容 | 返回 Promise |
| `<el-upload>` | API 有调整 | before-upload 返回值变化 |
| `<el-pagination>` | 属性名变化 | current-page → currentPage |

### Vue 2 → Vue 3

| Vue2 写法 | Vue3 写法 |
|-----------|-----------|
| `export default { data() {} }` | `const x = ref()` / `reactive()` |
| `this.xxx` | 直接引用（setup 无 this） |
| `this.$refs.form` | `const form = ref<FormInstance>()` |
| `this.$set(obj, key, val)` | 直接 `obj[key] = val` |
| `this.$nextTick()` | `import { nextTick }` |
| `this.$emit('update:xxx')` | `defineEmits` |
| `filters: {}` | 普通函数替代 |
| `this.$on/$off/$bus` | mitt 或 provide/inject |
| `Vue.prototype.xxx` | `app.config.globalProperties.xxx` |
| `mixins: [xxx]` | Composables `useXxx()` |
| `vue-class-component` 装饰器 | `<script setup>` |
| `vue-property-decorator` | `defineProps` / `defineEmits` |
| `@vue/composition-api` | 原生 Vue 3 Composition API |

## 2.5 Phase 2 验收标准

```
编译级验证（Agent 自动完成）：
[ ] vue-tsc --noEmit 通过
[ ] eslint 通过
[ ] vite build 成功

浏览器级验证（人工在浏览器中逐页确认）：
[ ] scr-web 在基座中正常加载，无白屏
[ ] 所有 68 个页面/组件功能与旧版一致
[ ] 可视化功能正常（Three.js 3D 渲染 / G6 图 / Leaflet 地图 / ECharts 图表）
[ ] 页面间路由切换正常
[ ] 与基座的全局状态通信正常
[ ] 样式还原无偏差（对比新旧版截图）

迁移完成 = 浏览器中所有功能正常运行，不只是编译通过。
发现问题后告诉我，我来修复，直到全部功能正常。

[ ] 迁移过程中的坑已更新到 CLAUDE.md
```

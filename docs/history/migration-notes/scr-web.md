# scr-web 迁移总结

> 试点迁移 | 完成日期：2026-04-20
> 分支：feature/migrate-scr-web → 已合并到 develop

---

## 迁移范围

| 项目 | 迁移前 | 迁移后 |
|------|--------|--------|
| Vue | 2.6.11 | 3.4 |
| 构建工具 | Vue CLI 4.5 | Vite 5（特例，后续子应用保持 Vue CLI） |
| UI 库 | ElementUI 2.14 | Element Plus 2.7 |
| 状态管理 | Vuex 3.4 | Pinia 2.1 |
| 路由 | vue-router 3.2 | vue-router 4.3 |
| 图表 | ECharts 4.9 | ECharts 5.5 |
| 日期 | moment | dayjs |
| 滚动 | vue-seamless-scroll | vue3-seamless-scroll |
| 数据可视化 | @jiaminghi/data-view | @kjgl77/datav-vue3 |
| 图表封装 | cmp-echarts（自研） | 本地组件替代 |
| Composition API | @vue/composition-api | Vue 3 原生 |
| Qiankun | 无 lifecycle | 已添加 bootstrap/mount/unmount |

## 代码变更统计

```
文件变更：124 个
新增行数：+9,763
删除行数：-17,239
.vue 文件：68 个全部迁移为 <script setup lang="ts">
```

---

## 踩坑记录（后续子应用必读）

### 1. 环境变量：process.env → import.meta.env

```
问题：Vite 中不存在 process.env，运行时报 ReferenceError
位置：services/screen/outside.js

修复：
  process.env.VUE_APP_MAPURL → import.meta.env.VITE_MAP_URL
  process.env.VUE_APP_MAPTILE → import.meta.env.VITE_MAP_TILE

注意：如果后续子应用保持 Vue CLI，此问题不会出现。
      但如果代码中有 process.env.NODE_ENV，Vue CLI v5 仍然支持。
```

### 2. CSS 中的 ~ 前缀（Webpack → Vite）

```
问题：url('~assets/img/xxx.png') 在 Vite 中无法解析
位置：ScreenWrapper/index.vue、Header.vue、OverviewState/index.vue

修复：url('~assets/...') → url('@/assets/...')

注意：Vue CLI v5 仍然支持 ~ 前缀，后续子应用如保持 Vue CLI 则无此问题。
      但建议统一改为 @/ 路径，兼容性更好。
```

### 3. import 路径必须带 .vue 后缀

```
问题：Vite 的模块解析不会自动补 .vue 后缀，导致 build 失败
位置：19+ 处 import（views 内组件互引、components 别名引用）

修复：
  import Xxx from './Xxx'              → import Xxx from './Xxx.vue'
  import Xxx from 'components/NoData'  → import Xxx from 'components/NoData/index.vue'

注意：Vue CLI（webpack）会自动解析 .vue 后缀，后续子应用如保持 Vue CLI 则无此问题。
      但建议统一加后缀，是更规范的写法。
```

### 4. ECharts v4 → v5 的 import 方式

```
问题：import echarts from 'echarts' 在 v5 中不可用
修复：import * as echarts from 'echarts'

附带问题：ECharts v5 对 v4 配置有兼容，但会输出大量 DEPRECATED 警告
  - 'normal' hierarchy removed：itemStyle.normal.color → itemStyle.color
  - emphasis 位置变更：itemStyle.emphasis → emphasis.itemStyle
  - textStyle 扁平化：axisLabel.textStyle.color → axisLabel.color

建议：首次迁移先忽略警告（功能正常），后续统一清理 v4 配置语法。
```

### 5. ECharts 组件的 props.data 空值防护

```
问题：组件挂载时 data 可能还未加载，updateChart 中直接访问 data.values 报 TypeError
位置：全部 9 个 echarts 子组件 + useEcharts.ts

修复：
  - useEcharts.ts 的 doUpdate() 加 if (chart.value && props.data) 判断
  - 每个 updateChart 函数开头加 if (!props.data) return
  - 访问 d.values / d.keys 前加 if (!d || !d.values || !d.keys) return

教训：Vue 3 的 <script setup> 中 props 是响应式的，但初始值可能为 undefined。
      所有依赖异步数据的渲染逻辑都需要空值防护。
```

### 6. vue-seamless-scroll 不兼容 Vue 3

```
问题：Vue 2 版本的 vue-seamless-scroll 在 Vue 3 下报 _c is undefined
位置：ScrollTable、AlarmList（3 个文件）

修复：
  包替换：vue-seamless-scroll → vue3-seamless-scroll
  组件名：<vue-seamless-scroll> → <Vue3SeamlessScroll>
  属性名：:data → :list, :class-option → 拆分为 :step / :single-height 等独立属性
  导入：import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
```

### 7. @jiaminghi/data-view 不兼容 Vue 3

```
问题：data-view 组件（dv-decoration-9 等）在 Vue 3 下无法注册
位置：FullScreenContainer、count_screen、dc_screen、screen/index 等

修复：
  包替换：@jiaminghi/data-view → @kjgl77/datav-vue3
  注册方式：app.use(DataVVue3)
  组件名：保持不变（dv-decoration-9 等名称兼容）
```

### 8. cmp-echarts 自研包替代

```
问题：cmp-echarts 是 Vue 2 封装，不可升级
位置：4 个顶层 echarts wrapper（BarCharts、LineCharts、PieCharts、BarReverseCharts）

修复：
  import { BarCharts } from 'cmp-echarts'
  → import BarChart from './bar-charts/BarCharts.vue'

  直接引用已迁移的本地子目录组件，跳过 cmp-echarts 封装层。
```

### 9. 静态资源路径 /scr-web/static/

```
问题：CSS 和 JS 中大量引用 /scr-web/static/img/... 绝对路径
      Vite dev 模式下 public/ 映射到 /，不带 /scr-web/ 前缀

修复：在 vite.config.ts 中加 middleware 重写 /scr-web/static/ → /static/

注意：Vue CLI 通过 vue.config.js 的 publicPath 处理，后续子应用如保持 Vue CLI 则无此问题。
```

### 10. mixins → Composable

```
改动：echarts/mixins.js → echarts/useEcharts.ts

模式：
  旧：mixins: [echartsMixin]，通过 this 访问 chart、resize 等
  新：const { chart, doUpdate, resize } = useEcharts(props, updateChart)

所有 echarts 子组件统一改为调用 useEcharts composable。
```

---

## Vuex → Pinia 迁移模式

scr-web 的 store 非常简单（2 个 state、2 个 action），迁移模式如下：

```typescript
// 旧：Vuex
export default new Vuex.Store({
  state: { cmcUrl: null, screenConfigs: {} },
  mutations: {
    SET_CMC_URL(state, value) { state.cmcUrl = value }
  },
  actions: {
    async GetCmcUrl({ commit }) {
      const data = await getSystemConfigs(...)
      commit('SET_CMC_URL', data.data.CmcAddress)
    }
  },
  getters: {
    desktopUrl: state => state.desktopUrl
  }
})

// 新：Pinia
export const useAppStore = defineStore('app', () => {
  const cmcUrl = ref<string | null>(null)
  const desktopUrl = computed(() => cmcUrl.value)
  async function getCmcUrl() {
    const data = await getSystemConfigs(...)
    cmcUrl.value = data.data.CmcAddress
  }
  return { cmcUrl, desktopUrl, getCmcUrl }
})
```

组件中的使用方式：
```typescript
// 旧：context.root.$store.getters.screenConfigs
// 新：const appStore = useAppStore(); appStore.screenConfigs
```

---

## vue-router 3 → 4 迁移模式

```typescript
// 旧
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const router = new VueRouter({ mode: 'history', base: process.env.VUE_APP_BASEURL, routes })

// 新
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })
```

组件中的使用方式：
```typescript
// 旧：context.root.$router.push(...)
// 新：const router = useRouter(); router.push(...)
```

---

## 第三方库替换清单

| 旧包 | 新包 | 原因 |
|------|------|------|
| @vue/composition-api | vue（内置） | Vue 3 原生支持 |
| element-ui | element-plus | Vue 3 版本 |
| vuex | pinia | Vue 3 推荐 |
| vue-router@3 | vue-router@4 | Vue 3 配套 |
| echarts@4 | echarts@5 | 大版本升级 |
| moment | dayjs | 更轻量 |
| vue-seamless-scroll | vue3-seamless-scroll | Vue 3 兼容 |
| @jiaminghi/data-view | @kjgl77/datav-vue3 | Vue 3 兼容 |
| cmp-echarts | 本地组件 | 自研包不可升级 |
| vue-template-compiler | 移除 | Vue 3 不需要 |
| core-js | 移除 | Vite 不需要（Vue CLI 保留） |

---

## 后续子应用迁移注意

1. **保持 Vue CLI 构建** — scr-web 切了 Vite 是特例，后续子应用保持 `@vue/cli-service v5` + `vue.config.js`
2. **ECharts 防护模式已建立** — 所有 echarts 组件的 updateChart 加 null guard，直接复用
3. **cmp-echarts 替代方案已验证** — 改为引用本地子目录组件
4. **cmp-element 待处理** — scr-web 没用 cmp-element，但 cmp/cms/cos/csc 都用了，需要单独处理
5. **vue-class-component** — scr-web 没用，cms-web 大量使用，需要额外的改写模式
6. **i18n** — scr-web 没用，cms-web 需要 vue-i18n 8 → 9 升级

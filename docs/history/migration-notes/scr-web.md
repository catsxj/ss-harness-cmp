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

## 踩坑记录

20+ 条迁移踩坑（多为 Vite 迁移相关，Vue CLI 项目可豁免一部分）已拆到 [scr-web-pitfalls.md](scr-web-pitfalls.md)。

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

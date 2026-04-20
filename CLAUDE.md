# 项目升级 Agent 约束文档

> **本文档是 Agent 操作本项目的唯一入口。**
> **执行任何迁移任务前，必须先读完本文档和引用的规则文件。**
> 本文档是活文档——每次 Agent 犯错，都应将教训补充到这里。

---

## 必读文件索引

开始迁移前，按顺序阅读以下文件：

| 序号 | 文件 | 说明 | 何时读 |
|------|------|------|--------|
| 1 | **本文件 CLAUDE.md** | 约束规则总纲（代码规范、禁止事项） | 每次对话必读 |
| 2 | [.claude/memory/project_cmp_harness.md](.claude/memory/project_cmp_harness.md) | 项目概况：7 个应用清单、迁移状态、迁移顺序 | 每次对话必读 |
| 3 | [.claude/memory/project_cmp_decisions.md](.claude/memory/project_cmp_decisions.md) | 关键决策：自研包不可升级、保持 Vue CLI、浏览器验收标准 | 每次对话必读 |
| 4 | [.claude/memory/feedback_keep_build_tool.md](.claude/memory/feedback_keep_build_tool.md) | **构建工具约束：不要把 Vue CLI 换成 Vite** | 迁移前必读 |
| 5 | [.claude/memory/project_cmp_pitfalls.md](.claude/memory/project_cmp_pitfalls.md) | 10 条踩坑记录（ECharts 空值、seamless-scroll、CSS ~前缀等） | 迁移前必读 |
| 6 | [.claude/memory/project_cmp_files.md](.claude/memory/project_cmp_files.md) | 文档索引：upgrade-plan、agent 方案、迁移总结等文档位置 | 需要时查阅 |
| 7 | [.claude/skills/vue2-to-vue3-migration/SKILL.md](.claude/skills/vue2-to-vue3-migration/SKILL.md) | 迁移技能：4 阶段流程、代码改写模板、替换对照表 | 执行迁移时加载 |
| 8 | [docs/migration-notes/](docs/migration-notes/) | 各子应用迁移总结（按子应用名命名） | 迁移前参考已完成的子应用 |

---

## 项目信息

- 微前端框架：Qiankun
- 基座 main-web（Vue 3，已完成）+ 6 个子应用
- 升级方向：Vue2 → Vue3, ElementUI → Element Plus, Vuex → Pinia, JS → TS
- 渐进式迁移：子应用逐个迁，csc-web 不迁移
- **构建工具：保持 Vue CLI（@vue/cli-service v5），不切 Vite**
- **自研包（cmp-element / cmp-echarts / cmp-socket / cmp-graph 等）不可升级源码**
- **迁移完成标准：浏览器逐页功能验证正常，编译通过只是前置门槛**

## 迁移顺序与状态

```
scr-web  (68 .vue)   ✅ 已完成（特例：用了 Vite）
sms-web  (125 .vue)  ⬜ 待迁移
cmp-web  (521 .vue)  ⬜ 待迁移
cms-web  (521 .vue)  ⬜ 待迁移
cos-web  (567 .vue)  ⬜ 待迁移
csc-web  (1211 .vue) ── 不迁移
```

## 分支策略

```
main（基线快照）→ develop（迁移主分支）→ feature/migrate-xxx-web → 合并回 develop
```

---

## 分层依赖规则

```
types → constants → utils → api → stores → components → views → router → main
```

**严禁反向依赖。** 例如：
- utils 不能 import 任何 vue 组件
- api 不能 import store
- components 不能 import views
- stores 不能 import components

---

## Element Plus 迁移规则

### 组件 API 映射

```
:visible.sync="show"              → v-model="show"
@click.native                     → @click
this.$message()                   → import { ElMessage } from 'element-plus'; ElMessage()
this.$confirm()                   → ElMessageBox.confirm()
this.$loading()                   → ElLoading.service()
<i class="el-icon-edit">          → import { Edit } from '@element-plus/icons-vue'; <el-icon><Edit /></el-icon>
<template slot="xxx">             → <template #xxx>
el-radio-button label=            → el-radio-button value=
```

### 容易遗漏的差异

```
- el-pagination: total 为 0 时默认不渲染
- el-table: selection API 返回值可能不同
- el-form: validate() 返回 Promise
- el-upload: before-upload 返回 false 或 Promise.reject 阻止上传
- el-date-picker: value-format 默认行为可能不同，显式指定
```

---

## TypeScript 规则

```typescript
// 组件必须用 <script setup lang="ts">
// props / emit 必须带类型
const props = defineProps<{ title: string; count?: number }>()
const emit = defineEmits<{ update: [value: string] }>()

// ref 显式标注复杂类型
const form = ref<FormInstance>()
```

```
- 禁止 any，允许 unknown
- API 返回值必须有 interface
- 第三方库缺类型时写 .d.ts，不用 any 绕过
```

---

## Vue 3 写法规则

### 禁止（旧写法）

```
this.xxx / this.$refs / this.$set / this.$on / this.$bus
Vue.prototype.xxx / filters / mixins / Options API
```

### 必须（新写法）

```
<script setup lang="ts"> / Pinia / vue-router 4 / Composables / async/await
```

---

## Qiankun 约束

```
- 子应用必须导出 bootstrap / mount / unmount
- 路由 base 前缀与基座 activeRule 一致
- 静态资源配置 publicPath
- 不操作 document.body 样式
- 全局通信用 initGlobalState
- 卸载时清理所有副作用
```

---

## Agent 行为约束

### 必须遵守

```
1. 迁移前先读完本文件 + .claude/memory/ 下所有文件
2. 一次只迁移一个页面/组件，迁完立即验证
3. 不要一次性迁移整个子应用
4. 保持原有构建工具（Vue CLI），不切 Vite
5. 自研包不改源码，在应用侧做适配
6. 保持功能完全一致，不顺手"优化"业务逻辑
7. CSS 类名和结构保持一致
8. 迁完后必须在浏览器中验证功能
```

### 禁止

```
1. 禁止跳过类型检查（// @ts-ignore, // @ts-nocheck）
2. 禁止使用 any 类型
3. 禁止修改 shared 包的接口签名
4. 禁止在子应用中访问其他子应用的内部状态
5. 禁止删除看起来没用的代码（可能被其他子应用引用）
6. 禁止修改基座 main-web 代码
7. 禁止把 Vue CLI 构建换成 Vite
```

---

## 失败案例记录

> 每次 Agent 迁移出错，在这里记录。
> 格式：日期 | 问题 | 原因 | 修复方式 | 新增约束

| 日期 | 问题 | 原因 | 修复 |
|------|------|------|------|
| 2026-04-20 | ECharts 组件挂载报 TypeError | props.data 为 undefined 时直接访问 .values | updateChart 开头加 `if (!props.data) return` |
| 2026-04-20 | vue-seamless-scroll 报 _c undefined | Vue 2 版不兼容 Vue 3 | 替换为 vue3-seamless-scroll |
| 2026-04-20 | data-view 组件无法注册 | @jiaminghi/data-view 不兼容 Vue 3 | 替换为 @kjgl77/datav-vue3 |
| 2026-04-20 | CSS 背景图不显示 | `url('~assets/...')` Webpack 语法 | 改为 `url('@/assets/...')` |
| 2026-04-20 | cmp-echarts 模块找不到 | 自研包不可升级 | 改为引用本地子目录组件 |
| 2026-04-20 | process.env 未定义 | Vite 中无 process.env | 改为 import.meta.env（仅 Vite 场景） |

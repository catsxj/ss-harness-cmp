# 项目升级 Agent 约束文档

> 本文档是 Agent 操作本项目的唯一入口指南。
> 每一条规则都对应一个历史失败案例或架构决策。
> 本文档是活文档——每次 Agent 犯错，都应将教训补充到这里。

---

## 项目信息

- 包管理器：pnpm workspace（monorepo）
- 微前端框架：Qiankun
- 基座 + 6 个子应用
- 升级方向：Vue2 → Vue3, ElementUI → Element Plus, JS → TS
- 渐进式迁移：子应用逐个迁，基座最后

## pnpm 规则

```
- 所有依赖安装必须使用 pnpm，禁止 npm / yarn
- 子应用引用 shared 包统一用 workspace:* 协议
- 安装依赖到指定子应用：pnpm --filter @project/app-xxx add xxx
- 禁止在根目录安装业务依赖，根目录只放 devDependencies（lint/ts/构建工具）
- 不要手动修改 pnpm-lock.yaml
- 新增子应用后确认 pnpm-workspace.yaml 已包含其路径
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
# .sync 修饰符
旧: <el-dialog :visible.sync="show">
新: <el-dialog v-model="show">

# .native 修饰符
旧: <el-button @click.native="fn">
新: <el-button @click="fn">

# 全局方法改为显式 import
旧: this.$message({ message: 'ok', type: 'success' })
新: import { ElMessage } from 'element-plus'
    ElMessage.success('ok')

旧: this.$confirm('确定?', '提示')
新: import { ElMessageBox } from 'element-plus'
    ElMessageBox.confirm('确定?', '提示')

旧: this.$loading({ fullscreen: true })
新: import { ElLoading } from 'element-plus'
    ElLoading.service({ fullscreen: true })

# 图标
旧: <i class="el-icon-edit"></i>
新: import { Edit } from '@element-plus/icons-vue'
    <el-icon><Edit /></el-icon>

# 事件名统一 kebab-case
旧: @current-change  (大部分兼容)
新: @current-change  (确认每个组件的事件名)
```

### 容易遗漏的差异

```
- el-pagination: total 为 0 时默认不渲染，需要处理空状态
- el-table: selection 相关 API 返回值可能不同
- el-form: validate() 现在返回 Promise，不再需要回调
- el-upload: before-upload 返回 false 或 Promise.reject 来阻止上传
- el-select: 远程搜索的 remote-method 参数不变，但 filterable 行为微调
- el-date-picker: value-format 默认行为可能不同，显式指定
```

---

## TypeScript 规则

### 组件写法

```typescript
// 必须使用 <script setup lang="ts">
<script setup lang="ts">
import { ref, computed } from 'vue'

// props 必须带类型
const props = defineProps<{
  title: string
  count?: number
}>()

// emit 必须带类型
const emit = defineEmits<{
  update: [value: string]
  close: []
}>()

// ref 显式标注复杂类型
const form = ref<FormInstance>()
const list = ref<UserItem[]>([])
</script>
```

### 类型规范

```
- 禁止 any，允许 unknown
- API 返回值必须有 interface 定义
- 业务模型类型放 shared/types/ 或子应用 src/types/
- 枚举用 const enum 或字面量联合类型
- 第三方库缺类型定义时，写 .d.ts 补充，不要用 any 绕过
```

---

## Vue3 写法规则

### 禁止的写法（旧）

```
- this.xxx（setup 中无 this）
- this.$refs.xxx（用 ref<T>() 替代）
- this.$set / this.$delete（直接赋值）
- this.$on / this.$off / this.$bus（用 mitt 替代）
- Vue.prototype.xxx（用 app.config.globalProperties 替代）
- filters（用普通函数替代）
- mixins（用 Composables 替代）
- Options API 的 data/computed/methods/watch 选项
```

### 必须的写法（新）

```
- 组件必须用 <script setup lang="ts">
- 状态管理用 Pinia（defineStore）
- 路由用 vue-router 4（createRouter）
- 公共逻辑抽取为 useXxx() composable
- 异步操作统一用 async/await
```

---

## Qiankun 相关约束

```
- 子应用必须导出 bootstrap / mount / unmount 生命周期
- 子应用路由必须使用 base 前缀（与基座注册的 activeRule 一致）
- 子应用的静态资源必须配置 publicPath
- 子应用不要操作 document.body 的样式
- 全局状态通信统一使用 initGlobalState，不要用 window 全局变量
- 子应用卸载时必须清理所有副作用（定时器、事件监听、DOM 挂载）
```

---

## Agent 行为约束

### 必须遵守

```
1. 一次只迁移一个页面/组件，迁完立即验证
2. 不要试图一次性迁移整个子应用
3. 迁移组件时按顺序：先改模板（Element Plus），再改逻辑（Composition API），最后加类型（TS）
4. 每个文件改完后确保 vue-tsc --noEmit 通过
5. 不要引入新的第三方依赖，除非经过确认
6. 保持功能完全一致，不要顺手"优化"业务逻辑
7. CSS 类名和结构尽量保持一致，减少样式回归风险
```

### 禁止

```
1. 禁止跳过类型检查（// @ts-ignore, // @ts-nocheck）
2. 禁止使用 any 类型
3. 禁止修改 shared 包的接口签名（会影响其他子应用）
4. 禁止在子应用中直接访问其他子应用的内部状态
5. 禁止删除看起来没用的代码（可能被其他子应用引用）
6. 禁止修改基座代码（Phase 4 之前）
```

---

## 失败案例记录

> 每次 Agent 迁移出错，在这里记录原因和解决方案。
> 格式：日期 | 问题 | 原因 | 修复方式 | 新增约束

```
（待补充——随迁移过程持续更新）
```

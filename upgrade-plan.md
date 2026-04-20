# Vue2 + ElementUI + Qiankun 微前端升级计划

> 方法论参考：Harness Engineering（驾驭工程）
> 核心原则：人类掌舵，Agent 执行；每次失败都是环境设计的信号
> 创建日期：2026-04-17
> 更新日期：2026-04-20（基于项目实际情况重写）

---

## 项目概况（实际现状）

| 项目 | 现状 | 目标 |
|------|------|------|
| 基座 main-web | **Vue 3.2 + Vite 2.8 + Element Plus + Ant Design Vue + Vuex 4 + TS** | 保持，升级依赖版本 |
| 子应用 × 5 | **Vue 2.6 + Vue CLI 4 + ElementUI 2.13 + Vuex 3 + 部分 TS** | Vue 3 + Vite + Element Plus + TS |
| 微前端 | Qiankun 2.4.6 | Qiankun（保留） |
| 项目结构 | 各应用独立目录，无 monorepo | pnpm workspace monorepo |
| 包管理器 | 各应用独立 npm/pnpm | 统一 pnpm workspace |

### 实际应用清单

| 应用 | 类型 | Vue版本 | 构建工具 | .vue文件数 | 复杂度 | 特殊依赖 |
|------|------|---------|----------|-----------|--------|---------|
| main-web | 基座 | **Vue 3** ✓ | Vite 2.8 | 32 | 中 | Qiankun master, Ant Design Vue |
| scr-web | 子应用 | Vue 2.6 | Vue CLI 4.5 | **68** | 低 | Three.js, AntV G6/L7, Leaflet, ECharts |
| sms-web | 子应用 | Vue 2.6 | Vue CLI 4.4 + Vite 2.4 | **126** | 中 | AntV G6, vuedraggable |
| cmp-web | 子应用 | Vue 2.6 | Vue CLI 4.4 + Vite 2.4 | **521** | 高 | cmp-socket, cmp-echarts, cmp-element |
| cms-web | 子应用 | Vue 2.6 | Vue CLI 4.4 + Vite 2.4 | **521** | 高 | WangEditor, vue-i18n, vue-class-component |
| cos-web | 子应用 | Vue 2.6 | Vue CLI 4.4 + Vite 2.4 | **567** | 极高 | cmp-graph, cmp-topology, CodeMirror, ECharts |
| csc-web | 子应用 | Vue 2.6 | Vue CLI 4.4 + Vite 2.4 | **1,211** | 极高 | **不迁移** — 保持 Vue 2 现状 |

**总计：1,835 个 .vue 文件需迁移（基座已完成，csc-web 不迁移）**

### 关键发现

1. **基座 main-web 已经是 Vue 3** — 不需要 Phase 4（基座迁移），省掉最大风险
2. **6 个子应用**：cmp-web、cms-web、cos-web、csc-web、scr-web、sms-web
3. **csc-web 是最大的子应用**（1,211 个 .vue 文件），是企业级管理平台（计费、CMDB、仪表盘、数据库管理、资源申请）
4. **子应用已有部分 TS 支持**（TS 3.9，使用 @vue/composition-api）
5. **子应用已有双构建配置**（Vue CLI 主 + Vite 副）——部分迁移基础已存在
6. **scr-web 和 csc-web 都没有 Qiankun lifecycle** — 用的传统 new Vue() 模式，需特殊处理
7. **内部自研包**：cmp-socket、cmp-echarts、cmp-element、cmp-graph、cmp-graph-editor、cmp-topology — 这些包也需要适配 Vue 3
8. **main-web 混用 Element Plus + Ant Design Vue** — 需注意样式隔离

---

## 整体策略（修订版）

```
Phase 0  基础设施准备 — monorepo 搭建、CI、模板
Phase 1  共享层抽离 — 从各子应用提取公共代码
Phase 2  试点迁移 scr-web — 最小最简单（68 个 .vue）
Phase 3  批量迁移 sms → cmp → cms → cos
Phase 4  基座优化 + 清理收尾
```

**核心变化：基座已是 Vue 3，csc-web 不迁移（保持 Vue 2），重心在 5 个子应用。**

---

## Phase 0：基础设施准备

**目标：搭建 monorepo + 验证 Vue3 子应用能在现有基座中运行**
**预计周期：1-2 周**

### 0.1 搭建 pnpm workspace

当前项目是独立目录结构，需要重组为 monorepo：

```
ss-harness-cmp/                  # 项目根目录
├── pnpm-workspace.yaml
├── package.json                 # 根配置
├── .npmrc
├── CLAUDE.md
├── main-web/                    # 基座（Vue 3，已完成）
├── cmp-web/                     # 子应用（Vue 2 → Vue 3）
├── cms-web/
├── cos-web/
├── csc-web/                     # 最大子应用（1,211 .vue）
├── scr-web/
├── sms-web/
└── packages/
    └── shared/                  # 新建公共包
```

**`pnpm-workspace.yaml`：**

```yaml
packages:
  - 'main-web'
  - 'cmp-web'
  - 'cms-web'
  - 'cos-web'
  - 'csc-web'
  - 'scr-web'
  - 'sms-web'
  - 'packages/*'
```

> 注：当前项目各子应用直接在根目录下，不在 apps/ 子目录中，workspace 配置按实际目录结构编写。

**根 `package.json`：**

```json
{
  "private": true,
  "scripts": {
    "dev:main": "pnpm --filter main-web run dev",
    "dev:cmp": "pnpm --filter cmp-web run dev",
    "dev:cms": "pnpm --filter cms-web run dev",
    "dev:cos": "pnpm --filter cos-web run dev",
    "dev:csc": "pnpm --filter csc-web run dev",
    "dev:scr": "pnpm --filter scr-web run dev",
    "dev:sms": "pnpm --filter sms-web run dev",
    "build": "pnpm -r run build",
    "lint": "pnpm -r run lint",
    "typecheck": "pnpm -r run typecheck"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vue-tsc": "^2.0.0",
    "eslint": "^8.57.0"
  },
  "engines": {
    "node": ">=18",
    "pnpm": ">=9"
  }
}
```

**`.npmrc`：**

```ini
shamefully-hoist=true
strict-peer-dependencies=false
```

### 0.2 确认现有基座对 Vue3 子应用的兼容性

基座 main-web 已经是 Vue 3 + Qiankun 2.4.6，需要验证：

```
检查清单：
[ ] main-web 的 registerMicroApps 在 src/core/register.ts 中
    - 通过 getMicroApp() 从 /config/app.json 动态加载
    - 默认 proxy: ${protocol}//${hostname}:60003/
    - 确认能注册 Vite 构建的 Vue3 子应用
[ ] start({ prefetch: 'all' }) 与 Vite 子应用兼容
[ ] initGlobalState + actions.init 通信链路在 Vue3 子应用中可用
[ ] experimentalStyleIsolation 对 Element Plus 子应用样式隔离验证
[ ] main-web 的 Ant Design Vue 与子应用 Element Plus 无样式冲突
```

### 0.3 创建 Vue3 子应用模板

基于现有子应用的 Qiankun lifecycle 模式创建模板：

```typescript
// 子应用 main.ts 模板（匹配现有基座的 props 协议）
import { createApp } from 'vue'
import type { App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import AppComponent from './App.vue'
import router from './router'

let app: VueApp | null = null

function render(props: Record<string, unknown> = {}) {
  const { container, appPath, mainRouter } = props
  app = createApp(AppComponent)
  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus)

  // 与基座通信（匹配现有 actions.init 模式）
  if (props.onGlobalStateChange) {
    // 注册全局状态监听
  }

  const mountEl = container
    ? (container as Element).querySelector('#app')
    : document.querySelector('#app')
  app.mount(mountEl as Element)
}

export async function bootstrap() {
  // 初始化
}

export async function mount(props: Record<string, unknown>) {
  render(props)
}

export async function unmount() {
  app?.unmount()
  app = null
}

// 独立运行模式
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}
```

**关键：必须匹配基座传递的 props（appPath、mainRouter、container），以及 actions.init 通信模式。**

### 0.4 建立 CI 门禁

```yaml
checks:
  - name: 类型检查
    command: vue-tsc --noEmit
    blocking: true

  - name: ESLint
    command: eslint src/ --ext .ts,.vue
    blocking: true

  - name: 构建
    command: vite build
    blocking: true
```

### 0.5 处理内部自研包（不可升级）

**重要约束：以下自研包均不可升级源码，只能在子应用侧做适配。**

| 包名 | 版本 | 使用的子应用 | Vue3 兼容 | 处理方案 |
|------|------|-------------|----------|---------|
| cmp-socket | 1.0.0 | cmp, sms, csc | 待验证 | **方案 A**：如无 Vue 依赖可直接用；**方案 B**：写 Vue3 适配层包裹调用 |
| cmp-echarts | 2.0.0-5.6 | cmp, sms, csc | 待验证 | **方案 A**：直接引用试跑；**方案 B**：写 Composable 包裹，内部调用 cmp-echarts API |
| cmp-element | 1.0.0-5.6 | cmp, cms, cos, csc | **❌ 不兼容** | **见下方专项方案** |
| cmp-graph | 1.0.0 | cos, csc | 待验证 | **方案 A**：直接引用试跑；**方案 B**：写 Vue3 wrapper 组件 |
| cmp-graph-editor | 1.0.0-5.6 | cos, csc | 待验证 | 同 cmp-graph |
| cmp-topology | 1.0.1 | cos | 待验证 | 同 cmp-graph |

#### cmp-element 专项处理方案（核心难点）

cmp-element 是 ElementUI 的二次封装，基于 Vue 2 + ElementUI 2.x 构建，**无法在 Vue 3 + Element Plus 环境中直接使用**，且不可升级源码。

**方案选择：**

| 方案 | 做法 | 工作量 | 风险 |
|------|------|--------|------|
| **A. 写 Element Plus 替代层** | 分析 cmp-element 暴露的所有组件 API，用 Element Plus 重新实现同名组件，保持接口一致 | 高（需逆向全部 API） | 中（API 可能有未覆盖的边界情况） |
| **B. 直接替换为 Element Plus** | 不保留 cmp-element 的封装，在每个子应用中逐处将 cmp-element 组件替换为 Element Plus 原生组件 | 极高（涉及 4 个子应用） | 低（最彻底） |
| **C. 子应用内嵌 Vue2 微组件** | 对 cmp-element 重度依赖的区域，用 iframe 或 Web Components 嵌入 Vue2 渲染 | 中 | 高（性能、通信复杂） |

**推荐方案 B**：直接替换为 Element Plus。虽然工作量最大，但最彻底、风险最低。Codemod 脚本可以自动化大部分替换工作。

**Phase 0 必须完成：**
1. 列出 cmp-element 导出的所有组件清单
2. 逐个映射到 Element Plus 对应组件 + API 差异
3. 编写 Codemod 脚本覆盖高频替换模式

#### 其他自研包的 Vue3 验证流程

Phase 0 阶段，对每个自研包执行以下验证：

```
Step 1: 在 Vue3 模板子应用中 npm install 该包
Step 2: import 并尝试使用
Step 3: 根据结果分类：
  - ✅ 直接可用 → 无需处理
  - ⚠️ 部分可用 → 写 Vue3 wrapper/adapter
  - ❌ 完全不可用 → 写替代组件（不改原包）
```

### 0.6 Phase 0 验收标准

```
[ ] pnpm workspace 搭建完成，所有应用可通过 pnpm --filter 启动
[ ] Vue3 模板子应用能在现有基座 main-web 中正常加载/卸载
[ ] 路由切换正常（基座 ↔ 模板子应用）
[ ] 全局状态通信正常（actions.init 模式）
[ ] Element Plus 在沙箱下样式正常
[ ] CI 门禁配置完成
[ ] 6 个自研包 Vue3 兼容性逐一验证完成（分为可用/部分可用/不可用）
[ ] cmp-element 组件清单 + Element Plus 映射表完成
[ ] cmp-element Codemod 替换脚本初版完成
[ ] CLAUDE.md 更新为实际项目约束
```

---

## Phase 1：共享层抽离

**目标：从 5 个子应用中提取公共代码到 shared 包**
**预计周期：1-2 周**

### 1.1 待提取的公共代码

通过分析 5 个子应用，以下代码存在重复：

```
packages/shared/
├── package.json              # name: @ss-harness/shared
├── tsconfig.json
├── src/
│   ├── types/                # 公共 TS 类型
│   │   ├── api.ts            # 请求/响应类型
│   │   ├── business.ts       # 业务模型
│   │   └── index.ts
│   ├── utils/                # 工具函数（零框架依赖）
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── api/                  # axios 封装
│   │   ├── request.ts        # 拦截器、token、错误处理
│   │   └── index.ts
│   ├── constants/            # 常量
│   │   └── index.ts
│   └── hooks/                # Vue3 Composables（仅新子应用用）
│       └── index.ts
└── dist/
```

### 1.2 自研包适配层（packages/compat）

由于自研包不可升级，需要在 shared 同级创建适配层：

```
packages/
├── shared/                      # 公共工具/类型（与之前相同）
└── compat/                      # 自研包 Vue3 适配层
    ├── package.json             # name: @ss-harness/compat
    ├── src/
    │   ├── cmp-element/         # cmp-element → Element Plus 替代组件
    │   │   ├── index.ts         # 导出同名组件，内部用 Element Plus 实现
    │   │   └── components/      # 逐个替代组件
    │   ├── cmp-echarts/         # cmp-echarts Vue3 wrapper（如需要）
    │   ├── cmp-graph/           # cmp-graph Vue3 wrapper（如需要）
    │   └── cmp-socket/          # cmp-socket Vue3 wrapper（如需要）
    └── dist/
```

**核心思路：子应用迁移时，将 `import xxx from 'cmp-element'` 替换为 `import xxx from '@ss-harness/compat/cmp-element'`，接口保持一致，内部实现换成 Element Plus。**

### 1.3 关键原则

| 原则 | 说明 |
|------|------|
| 零框架依赖 | shared 主入口不 import vue / element |
| 双输出 | .js + .d.ts，旧子应用过渡期也能用 |
| hooks 单独入口 | `@ss-harness/shared/hooks` 可依赖 vue |
| 自研包不动源码 | 所有适配工作在 compat 层完成，原包零修改 |
| compat 层按需构建 | 只为 Vue3 不兼容的包写 wrapper，验证可直接用的不建 compat |

### 1.3 Agent 任务

```
Agent 做：
- 从各子应用的 utils/ 目录提取公共函数，转写为 TS
- 从各子应用的 api/ 层提取接口定义，生成 interface
- 补充类型和单测

人做：
- 决定公共代码边界
- 确认 api 模块拆分方式
- Review 类型准确性
```

### 1.4 Phase 1 验收标准

```
[ ] shared 包可被 main-web（Vue3）和旧子应用（Vue2）同时引用
[ ] API 层有完整的请求/响应类型
[ ] 工具函数有单测
[ ] 无循环依赖
```

---

## Phase 2：试点迁移 scr-web

**目标：用最小的子应用（68 个 .vue）验证完整迁移流程**
**预计周期：2-3 周**

### 2.1 为什么选 scr-web

| 标准 | scr-web 情况 |
|------|------------|
| 页面数量 | **68 个 .vue**（最少） |
| 业务复杂度 | 可视化展示为主，逻辑相对独立 |
| 耦合度 | 与其他子应用耦合最少 |
| 特殊情况 | **没有 Qiankun lifecycle**（需要额外添加） |
| 特殊依赖 | Three.js, AntV G6/L7, Leaflet, ECharts 4.9 |

### 2.2 scr-web 特殊处理

**问题 1：缺少 Qiankun lifecycle**

scr-web 和 csc-web 当前都用 `new Vue()` 直接挂载，没有 export bootstrap/mount/unmount。需要：

```
Step 0（scr-web + csc-web 都需要）：
├── 在 Vue 2 版本中先添加 Qiankun lifecycle 导出
├── 确认在基座中能正常加载/卸载
└── 再开始 Vue 3 迁移
```

**问题 2：可视化库升级**

| 当前 | 目标 | 说明 |
|------|------|------|
| ECharts 4.9.0 | ECharts 5.x | API 有 breaking change |
| Three.js 0.122.0 | Three.js 最新 | 类型定义改善 |
| AntV G6 (旧版) | @antv/g6 5.x 或保持 | 评估升级必要性 |
| Leaflet | 保持 | 基本兼容 |

**建议：可视化库升级可与 Vue3 迁移分开，先保持当前版本跑通 Vue3，再逐步升级。**

### 2.3 迁移步骤

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

### 2.4 组件迁移对照表

（同之前版本，保留 ElementUI → Element Plus 和 Vue2 → Vue3 对照表）

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

### 2.5 Phase 2 验收标准

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

---

## Phase 3：批量迁移剩余 5 个子应用

**目标：复用 Phase 2 经验，逐个迁移**
**预计周期：整体 18-34 周**

### 3.1 迁移顺序（按复杂度递增）

```
scr-web（试点，已完成）    ████████████ Done      68 .vue
sms-web（中等）            ████████░░░░           126 .vue    ~3 周
cmp-web（高）              ██████░░░░░░           521 .vue    ~5-6 周
cms-web（高+i18n）         █████░░░░░░░           521 .vue    ~5-6 周
cos-web（极高+graph）      ████░░░░░░░░           567 .vue    ~6-8 周
csc-web                    ────────────           不迁移（保持 Vue 2）

原则：一个迁完上线后，再开下一个。
```

### 3.2 各子应用特殊注意事项

#### sms-web（126 .vue，~3 周）

```
特殊依赖：
- AntV G6 4.6.0 → 评估是否升级到 5.x
- vuedraggable → 替换为 vue3 版本 vuedraggable@next
- vue-grid-layout 2.3.12 → 替换为 vue3 兼容版本
- cmp-socket → 不可升级，用 compat 层或直接引用（Phase 0 已验证）
- cmp-echarts → 不可升级，用 compat 层或直接引用（Phase 0 已验证）

Qiankun lifecycle：已有 ✓
```

#### cmp-web（521 .vue，~5-6 周）

```
特殊依赖：
- cmp-socket → 不可升级，用 compat 层或直接引用
- cmp-echarts → 不可升级，用 compat 层或直接引用
- cmp-element → ❌ 不可升级且不兼容 Vue3，使用 @ss-harness/compat/cmp-element 替代
- @vue/composition-api → 移除，使用原生 Vue 3

最大风险：cmp-element 的替换（import 路径全部改为 compat 层）
建议：用 Codemod 脚本批量替换 import 路径

Qiankun lifecycle：已有 ✓
```

#### cms-web（521 .vue，~5-6 周）

```
特殊依赖：
- vue-i18n 8.15.0 → 升级到 vue-i18n 9.x（Vue3 版本）
- WangEditor 4.6.16 → 升级到 wangeditor 5.x（Vue3 版本）
- vue-class-component → 全部改写为 <script setup>
- vue-property-decorator → 全部改写为 defineProps/defineEmits
- cmp-element → 不可升级，使用 @ss-harness/compat/cmp-element 替代

最大风险：
1. vue-class-component 装饰器写法的全面重写
2. vue-i18n 升级（API 变化较大）

Qiankun lifecycle：已有 ✓
```

#### cos-web（567 .vue，~6-8 周）

```
特殊依赖：
- cmp-graph → 不可升级，用 compat 层 wrapper（Phase 0 已验证兼容性）
- cmp-graph-editor → 不可升级，同上
- cmp-topology → 不可升级，同上
- CodeMirror 5.60.0 → 升级到 CodeMirror 6 或用 @codemirror/view
- echarts 5.3.1 → 基本兼容，确认 Vue3 集成方式
- Vue Draggable Resizable → 替换 Vue3 版本
- Vue Grid Layout → 替换 Vue3 版本
- mavon-editor 2.9.1 → 替换为 Vue3 markdown 编辑器
- cmp-element → 不可升级，使用 @ss-harness/compat/cmp-element 替代

最大风险：
1. 图/拓扑 3 个自研包不可升级 — 如 Vue3 下完全不可用则需在 compat 层重写 wrapper
2. 567 个组件的纯体力活
3. 多种编辑器（CodeMirror + mavon-editor）的 Vue3 适配

Qiankun lifecycle：已有 ✓
```

#### csc-web — 不迁移

```
决策：csc-web 保持 Vue 2 现状，不纳入本次迁移范围。
原因：体量过大（1,211 .vue），投入产出比低。
Qiankun 天然支持 Vue 2 + Vue 3 子应用共存，csc-web 可继续正常运行。
```

### 3.3 加速手段

#### Codemod 脚本（Phase 2 后编写）

```
codemod/
├── element-ui-to-plus.ts       # ElementUI → Element Plus
├── cmp-element-to-compat.ts    # cmp-element import → @ss-harness/compat/cmp-element
├── remove-this.ts              # 移除 this.xxx
├── options-to-setup.ts         # Options API → <script setup>
├── class-component-to-setup.ts # vue-class-component → <script setup>（cms-web 专用）
├── add-ts-types.ts             # 自动推断类型
├── vue-router-upgrade.ts       # 路由升级
└── i18n-upgrade.ts             # vue-i18n 8 → 9（cms-web 专用）
```

#### Agent 并行策略

```
同一子应用内，按目录拆分给不同 Agent：

Agent 1 → views/moduleA/
Agent 2 → views/moduleB/
Agent 3 → components/

前提：共享 CLAUDE.md，迁完人工 Review 合并。

pnpm 命令：
  pnpm --filter sms-web dev      # 只启动指定子应用
  pnpm --filter sms-web build    # 只构建
  pnpm --filter sms-web typecheck # 只检查类型
  pnpm -r run build              # 全量构建
```

### 3.4 每个子应用迁移后的检查清单

```
编译级验证（Agent 自动完成）：
[ ] vue-tsc --noEmit 通过
[ ] eslint 通过
[ ] vite build 成功
[ ] 无 any 类型（或已标注 TODO）

浏览器级验证（人工逐页确认，迁移完成的最终标准）：
[ ] 子应用在基座中正常加载，无白屏
[ ] 所有页面功能与旧版一致——逐页操作验证
[ ] 表单提交、列表查询、弹窗交互等核心功能正常
[ ] 与基座 main-web 通信正常（actions.init、全局状态）
[ ] 与其他子应用联动正常
[ ] Element Plus 样式在沙箱下正常（无泄漏、无错位）
[ ] 路由切换无白屏
[ ] 子应用独立运行正常（脱离基座可单独访问）

迁移完成 = 浏览器中所有功能正常运行。
编译通过只是前置门槛，不是完成标准。

[ ] 坑和经验已更新到 CLAUDE.md
```

---

## Phase 4：基座优化 + 清理收尾

**目标：基座 main-web 已经是 Vue 3，只做依赖升级和清理**
**预计周期：1-2 周**

### 4.1 基座优化（main-web 已是 Vue 3）

```
[ ] 升级 Element Plus 从 1.1.0-beta.9 → 最新稳定版 2.7+
[ ] 升级 Vite 从 2.8 → 5.x
[ ] 升级 vue-router 从 4.0 → 4.3+
[ ] 评估 Vuex 4 → Pinia 的必要性（基座较轻，可选）
[ ] 移除 Qiankun 中对 Vue2 子应用的兼容配置（所有子应用已迁完）
[ ] 确认 Ant Design Vue 与最新 Element Plus 无冲突
[ ] 全量回归测试（所有 6 个子应用联调）
```

### 4.2 全局清理

```
[ ] 删除旧子应用代码（Vue2 版本归档到 git tag）
[ ] 删除 ElementUI 依赖
[ ] 删除 Vuex 3 依赖
[ ] 删除 vue-router 3 依赖
[ ] 删除 @vue/composition-api
[ ] 删除 vue-class-component / vue-property-decorator
[ ] 删除 vue-cli-service 相关配置和依赖
[ ] 删除 vite-plugin-vue2（子应用旧的 Vue2 Vite 配置）
[ ] 废弃 cmp-element 包
[ ] 统一所有子应用 tsconfig 为 strict: true
[ ] ESLint 切换到纯 Vue3 + TS 规则集
[ ] .npmrc 尝试移除 shamefully-hoist=true
[ ] 更新项目 README
[ ] 更新部署文档
[ ] CLAUDE.md 更新为维护阶段版本
```

### 4.3 Phase 4 验收标准

```
[ ] 基座 + 5 个子应用 Vue 3 + Element Plus + TS（csc-web 保持 Vue 2）
[ ] 所有路由切换正常
[ ] 全局状态通信正常
[ ] 登录/权限/菜单正常
[ ] 无 Vue 2 相关依赖残留
[ ] CI 全量通过
```

---

## 人 vs Agent 分工

| 任务 | 谁干 | 原因 |
|------|------|------|
| pnpm workspace 搭建 | **人** | 基础设施，一次性 |
| CLAUDE.md 编写 | **人** | 需要业务理解 |
| 内部自研包兼容性评估 | **人** | 需要源码理解 |
| CI 配置 | **人** | 运维知识 |
| Codemod 脚本编写 | **Agent** | 模式化替换 |
| ElementUI → Element Plus 替换 | **Agent** | 体力活，对照表驱动 |
| Options API → Composition API | **Agent** | 结构化转换 |
| vue-class-component → setup | **Agent** | 模式化改写 |
| JS → TS 类型补全 | **Agent** | 擅长类型推断 |
| API 层类型定义 | **Agent** | 从返回值推断 |
| 路由迁移 | **人 + Agent** | 人定结构，Agent 写代码 |
| Vuex → Pinia | **人 + Agent** | 人定 store 拆分，Agent 转写 |
| 可视化组件迁移 | **人** | 需要理解业务逻辑和库 API |
| 联调 / 回归测试 | **人** | 真实环境 + 业务判断 |
| 样式调整 / UI 还原 | **人** | 视觉判断 |

---

## 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| **cmp-element 不可升级且不兼容 Element Plus** | 确定 | 高 | 在 compat 层用 Element Plus 重新实现同 API 组件，或逐处直接替换为 Element Plus |
| **cmp-graph/topology 不可升级，Vue3 兼容性未知** | 高 | 高 | Phase 0 验证；不兼容则在 compat 层写 Vue3 wrapper，原包零修改 |
| **vue-class-component 全面改写** (cms-web) | 确定 | 中 | Codemod 脚本自动转换骨架，人工调整细节 |
| **vue-i18n 8→9 破坏性变更** (cms-web) | 确定 | 中 | API 映射表 + Agent 批量替换 |
| Element Plus 样式隔离问题 | 中 | 高 | Phase 0 提前验证沙箱行为 |
| scr-web / csc-web 缺 Qiankun lifecycle | 确定 | 低 | 迁移前先补加 lifecycle |
| 可视化库升级导致渲染差异 | 中 | 中 | 先保持版本不变，Vue3 跑通后再升级 |
| **csc-web 体量巨大（1,211 .vue）** | 确定 | 高 | 按业务模块分批 + Agent 并行 4-6 路 |
| csc-web 大量 Vue2 专用第三方库 | 高 | 中 | 逐个评估替代方案，优先找 Vue3 版本 |
| 3,046 个 .vue 文件迁移周期过长 | 高 | 中 | Agent 并行 + Codemod 加速，串行→并行压缩 20-30% |
| main-web 的 Element Plus beta 版本过旧 | 低 | 低 | Phase 4 统一升级到稳定版 |

---

## 时间线估算

```
Phase 0：基础设施准备                  1-2 周
Phase 1：共享层抽离                    1-2 周
Phase 2：试点 scr-web（68 .vue）       2-3 周
Phase 3：
  ├── sms-web（126 .vue）              3 周
  ├── cmp-web（521 .vue）              5-6 周
  ├── cms-web（521 .vue）              5-6 周
  └── cos-web（567 .vue）              6-8 周
Phase 4：基座优化 + 清理                1-2 周
                                      ──────────
总计                                   19-30 周（约 5-7 个月）

注：
- csc-web 不迁移，保持 Vue 2（Qiankun 支持新旧共存）
- 基于 2-3 人团队 + Agent 辅助
- cmp-element 替换可能额外增加 1-2 周
- cmp-graph/topology 如需 compat wrapper 可能额外增加 2-4 周
- 以上为串行估算，Agent 并行可压缩 20-30%（约 13-21 周）
```

---

## 附录

### A. 内部自研包清单（均不可升级）

| 包名 | 版本 | 用途 | 使用者 | Vue3 兼容 | 处理策略 |
|------|------|------|--------|----------|---------|
| cmp-socket | 1.0.0 | WebSocket 封装 | cmp, sms, csc | 待验证 | 直接引用或 compat wrapper |
| cmp-echarts | 2.0.0-5.6 | ECharts 封装 | cmp, sms, csc | 待验证 | 直接引用或 compat wrapper |
| cmp-element | 1.0.0-5.6 | ElementUI 二次封装 | cmp, cms, cos, csc | **❌ 不兼容** | compat 层用 Element Plus 重新实现 |
| cmp-graph | 1.0.0 | 图可视化 | cos, csc | 待验证 | 直接引用或 compat wrapper |
| cmp-graph-editor | 1.0.0-5.6 | 图编辑器 | cos, csc | 待验证 | 直接引用或 compat wrapper |
| cmp-topology | 1.0.1 | 拓扑图 | cos | 待验证 | 直接引用或 compat wrapper |

**约束：所有自研包源码不可修改。所有适配工作在 packages/compat/ 完成。**

### B. 各子应用端口配置

| 应用 | 开发端口 | Qiankun activeRule | Qiankun lifecycle |
|------|---------|-------------------|-------------------|
| main-web | 配置中读取 | — （基座） | — |
| cmp-web | 配置中读取 | 从 app.json 动态加载 | ✓ 已有 |
| cms-web | 配置中读取 | 从 app.json 动态加载 | ✓ 已有 |
| cos-web | 配置中读取 | 从 app.json 动态加载 | ✓ 已有 |
| csc-web | 配置中读取 | 从 app.json 动态加载 | ❌ 缺失 |
| scr-web | 配置中读取 | 从 app.json 动态加载 | ❌ 缺失 |
| sms-web | 配置中读取 | 从 app.json 动态加载 | ✓ 已有 |

### C. csc-web 业务模块清单

| 模块 | 目录 | 说明 |
|------|------|------|
| 计费管理 | views/bill/ | 账单、费用统计 |
| CMDB | views/cmdb/ | 配置管理数据库 |
| 仪表盘 | views/dashboard/ | 数据概览、多租户 |
| 数据库管理 | views/datebase/ | 数据库运维 |
| 资源申请 | views/resource-apply/ | 资源开通审批 |
| 运维操作 | views/ops/ | 自动化运维 |
| 监控 | views/monitor/ | 监控告警 |
| 系统管理 | views/system/ | 用户、角色、权限 |

### D. 参考资料

- [Harness Engineering 原文](https://www.runoob.com/ai-agent/harness-engineering.html)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Element Plus 迁移](https://element-plus.org/en-US/guide/migration.html)
- [Qiankun 官方文档](https://qiankun.umijs.org/)
- [vue-i18n 9 迁移](https://vue-i18n.intlify.dev/guide/migration/vue3.html)
- [WangEditor 5 升级](https://www.wangeditor.com/v5/migration.html)

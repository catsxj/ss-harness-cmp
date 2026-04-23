# sms-web 并行迁移细化方案

> 基于 sms-web 实际目录结构的 Agent 拆分方案
> 总量：125 个 .vue 文件 + 39 个 API service 文件 + 3 个 store 模块
> 目标并行度：3 Agent

---

## sms-web 文件分布

```
src/
├── views/           94 .vue   ← 核心迁移量
├── layouts/         25 .vue   ← 布局层，需先行
├── common/           6 .vue   ← 公共组件，需先行
├── store/            3 模块   ← 串行前置
├── router/           2 模块   ← 串行前置
├── services/        39 文件   ← API 层，可并行
├── models/           6 .d.ts  ← 类型定义，串行前置
├── filters/          1 文件   ← 改为函数，串行前置
├── lang/             3 文件   ← i18n（当前已禁用）
├── icons/           32 SVG    ← 直接复制
└── mock/             3 文件   ← 直接复制或删除
```

### views/ 目录详细拆分

| 模块 | .vue 数量 | 业务域 | 复杂度 |
|------|----------|--------|--------|
| views/configs/ | **30** | 系统配置（字典/环境/迁移/通知/项目/设置） | 高（含 setting_dashboard 10个子组件） |
| views/permisson/ | **21** | 权限管理（部门/角色/用户/租户/插件） | 高（含租户 6 个子组件） |
| views/monitor/ | **10** | 监控（主机/服务/插件/日志） | 中 |
| views/login/ | **3** | 登录/SSO/锁屏 | 低 |
| views/log/ | **2** | 审计日志/登录日志 | 低 |
| views/about/ | **2** | 关于/活动日志 | 低 |
| views/errorPage/ | **2** | 401/404 | 低 |
| **合计** | **94** | | |

---

## 执行阶段

```
Stage 1  串行前置（人工 + 单 Agent）   ~3 天
Stage 2  并行迁移（3 Agent）            ~2 周
Stage 3  合并 + 联调（人工）            ~2 天
```

---

## Stage 1：串行前置（~3 天）

**必须在并行启动前完成，因为后续所有 Agent 都依赖这些基础文件。**

### 1.1 创建 Vue3 工程骨架（人工）

```
sms-web-v3/
├── index.html
├── vite.config.ts          # Vite + vite-plugin-qiankun
├── tsconfig.json
├── package.json            # Vue3 + Element Plus + Pinia + TS
├── src/
│   ├── main.ts             # Qiankun lifecycle（基于现有 main.ts 改写）
│   ├── App.vue             # 已有 Composition API，改动小
│   ├── env.d.ts            # 环境变量类型
│   └── public-path.ts      # Qiankun public path
```

### 1.2 迁移 store → Pinia（人工/Agent）

现有 3 个 Vuex 模块，逐个转写：

```
Vuex store/modules/         →  Pinia stores/
├── app.js                  →  useAppStore.ts
├── permission.js           →  usePermissionStore.ts
└── tagsView.js             →  useTagsViewStore.ts

+ store/getters.js          →  各 store 内的 getters
+ store/utils.js            →  stores/utils.ts
```

### 1.3 迁移 router（人工/Agent）

```
router/index.js             →  router/index.ts
router/module/constant.js   →  router/modules/constant.ts
router/module/system.js     →  router/modules/system.ts

关键改动：
- new Router() → createRouter()
- mode: 'history' → history: createWebHistory()
- asyncRouterMap 动态路由加载方式适配 Vue3
- VUE_APP_BASEURL → import.meta.env.VITE_BASE_URL
```

### 1.4 迁移 services/ API 层（Agent）

39 个 API 文件，纯函数调用，无 Vue 依赖，改动量小：

```
主要改动：
- .js → .ts
- 补充请求/响应类型（从 models/ 的 .d.ts 引入）
- axios instance 指向 shared/api/request.ts
- require → import
```

### 1.5 迁移基础设施文件（Agent）

```
- common/utils/*.js → TS 化
- common/hooks/*.ts → 直接迁移（已是 Composition API）
- common/directive/index.js → TS 化
- common/interface/index.ts → 直接迁移
- filters/common.js → 改为普通导出函数
- models/*.d.ts → 直接复制
- icons/ → 直接复制 + 改 SVG 加载方式（require.context → import.meta.glob）
- validate/index.js → TS 化
- config.js → config.ts
- errorLog.js → errorLog.ts
- permission.js → permission.ts
```

### 1.6 处理特殊依赖

| 依赖 | 处理 | 在哪个 Stage |
|------|------|-------------|
| cmp-element | import 路径批量替换为 @ss-harness/compat/cmp-element | Codemod 在 Stage 1 跑 |
| cmp-echarts | 验证 Vue3 兼容性，不兼容则用 compat wrapper | Stage 1 确认 |
| cmp-socket | 验证 Vue3 兼容性，不兼容则用 compat wrapper | Stage 1 确认 |
| vuedraggable | 替换为 vuedraggable@next（Vue3 版） | package.json 直接改 |
| vue-grid-layout | 替换为 vue-grid-layout@3（Vue3 版） | package.json 直接改 |
| wangeditor | 升级到 @wangeditor/editor + @wangeditor/editor-for-vue@next | package.json 直接改 |
| @antv/g6 | 4.6.0 基本兼容 Vue3，确认集成方式 | Stage 1 确认 |
| vue-class-component | 只有 3 个文件用了，手动改写为 setup | Stage 1 直接改 |
| vue-i18n | 当前已禁用，暂不迁移；如需启用则升级到 v9 | 跳过 |

### 1.7 Codemod 批量预处理

在 Stage 2 启动前，对所有 .vue 文件跑一遍 Codemod：

```
Codemod 处理内容：
1. import ElementUI 组件 → Element Plus（基础标签替换）
2. import cmp-element → @ss-harness/compat/cmp-element
3. :visible.sync= → v-model=
4. @click.native → @click
5. this.$message → ElMessage（添加 import）
6. this.$confirm → ElMessageBox.confirm（添加 import）
7. <i class="el-icon-xxx"> → <ElIconXxx />
8. slot="xxx" → #xxx（旧 slot 语法）

Codemod 不处理的（留给 Agent）：
- Options API → <script setup>（结构性改动太大）
- JS → TS 类型补全
- this.xxx 的具体替换（需要理解上下文）
- mixins → Composables
```

### Stage 1 验收

```
[ ] Vue3 工程骨架可独立启动（空页面）
[ ] Pinia store 3 个模块已转写
[ ] router 已迁移，路由结构一致
[ ] services/ 39 个 API 文件已 TS 化
[ ] common/ 基础文件已迁移
[ ] 特殊依赖已确认处理方案
[ ] Codemod 已对所有 .vue 文件跑过一遍
[ ] 在基座中加载空壳子应用正常
```

---

## Stage 2：并行迁移（3 Agent，~2 周）

### Agent 拆分方案

```
┌──────────────────────────────────────────────────────────────────┐
│                    sms-web Stage 2 并行                           │
│                                                                  │
│  Agent A                  Agent B                  Agent C       │
│  ─────────────            ─────────────            ────────────  │
│  views/configs/           views/permisson/          layouts/     │
│  views/monitor/           views/login/              common/      │
│                           views/log/                components/  │
│                           views/about/                           │
│                           views/errorPage/                       │
│                                                                  │
│  .vue 数量: 40            .vue 数量: 32            .vue 数量: 31 │
│  复杂度: 高               复杂度: 高               复杂度: 中    │
│  (configs 含 setting      (permisson 含租户         (layouts 是   │
│   dashboard 10 个组件)     管理 13 个组件)           全局依赖)    │
│                                                                  │
│  预计工期: 8-10 天         预计工期: 7-9 天          预计工期: 5-7天│
└──────────────────────────────────────────────────────────────────┘
```

### 为什么这样拆

| 决策 | 理由 |
|------|------|
| configs + monitor 归 Agent A | configs 是最大模块（30），monitor 较小（10），总量平衡 |
| permisson + 小模块归 Agent B | permisson 是第二大模块（21），加上 login/log/about/error 凑齐 32 |
| layouts + common 归 Agent C | 布局层和公共组件是其他两路的依赖，**Agent C 先完成可解锁 A/B** |
| 不按文件数平均切 | 按业务边界切更重要——同一模块的组件有大量内部引用 |

### Agent C 先行策略

```
Agent C（layouts + common）应该最先启动，比 A/B 提前 1-2 天。
原因：layouts/home.vue 是所有页面的外壳，layouts/components/ 里的
Header、Sidebar、TagsView 被所有页面引用。如果 A/B 先完成但
layouts 没迁好，页面无法在基座中正常渲染。

时序：
Day 1-2:  Agent C 启动（layouts + common）
Day 2:    Agent C 完成 layouts/ 核心组件后，启动 Agent A + B
Day 2-10: A/B/C 并行
Day 7:    Agent C 完成全部，转入辅助（帮 A 或 B 处理溢出）
Day 10:   A/B 完成
```

---

### Agent A 详细任务清单

**范围：views/configs/（30 .vue）+ views/monitor/（10 .vue）= 40 .vue**

```
views/configs/
├── index-level 页面（6）
│   dictionary.vue, environment.vue, migration.vue,
│   notice.vue, project.vue, tag.vue, platformTask.vue
├── business/（2）
│   business.vue, businessAdd.vue
├── component/（1）
│   addDialog.vue
├── migration/（2）
│   index.vue, migrationDetail.vue
├── notice/（2）
│   index.vue, noticeAdd.vue
├── project/（2 + 3 子组件）
│   index.vue, detail.vue
│   components/basicinfo.vue, member.vue, memberInfo.vue
├── setting/（1 + 子模块）
│   general.vue
│   components/（2）uploadButton.vue, uploadImage.vue
│   interface/（2）index.vue, xxx.vue
│   monitor/（2）index.vue, xxx.vue
│   page/（9）Alias, Banner, Browser, CMC, Content, CSC, Login, Screen, index
│   security/（2）index.vue, xxx.vue
└── setting_dashboard/（10）
    10 个资源仪表盘卡片组件

views/monitor/
├── index.vue
└── components/（9）
    Component.vue, Host.vue, HostOverview.vue,
    logDownload.vue, next.vue, Plug.vue,
    realLog.vue, Service.vue, userDefind.vue
```

**Agent A Prompt：**

```markdown
# 任务：迁移 sms-web 的 configs 和 monitor 模块

## 背景
sms-web 是 Qiankun 微前端子应用，正在从 Vue2+ElementUI 迁移到 Vue3+Element Plus+TS。
工程骨架（router/store/services/common）已在 Stage 1 完成。
Codemod 已对所有 .vue 文件跑过基础替换（ElementUI标签、.sync、.native 等）。

## 你的工作范围
只修改以下目录中的 .vue 文件：
- sms-web/src/views/configs/**（30 个 .vue）
- sms-web/src/views/monitor/**（10 个 .vue）

禁止修改：
- views/ 下的 permisson/、login/、log/、about/、errorPage/
- layouts/、common/、store/、router/、services/
- 其他子应用的任何文件

## 迁移规则
对每个 .vue 文件执行：
1. <template> 中 Codemod 遗漏的 ElementUI → Element Plus 修正
2. <script> 改为 <script setup lang="ts">
   - export default { data, computed, methods, watch } → ref/reactive/computed/watch
   - this.xxx → 直接引用
   - this.$refs → const ref = ref<T>()
   - this.$emit → defineEmits
   - props → defineProps<{}>()
   - Vuex mapState/mapActions → Pinia useXxxStore()
   - mixins → 抽取为 composable 或内联
3. 补充 TypeScript 类型（禁止 any）
4. filters 调用 → 直接调用函数

## 迁移顺序建议
先改叶子组件（无子组件依赖），再改容器组件：
1. views/monitor/components/ 下的 9 个子组件
2. views/monitor/index.vue
3. views/configs/ 下各子模块的叶子组件
4. views/configs/ 的 index 级页面

## 质量要求
- 每改完一个文件，确保 vue-tsc --noEmit 无报错
- 保持功能一致，不改业务逻辑
- 保持 CSS 类名不变

## 特殊注意
- configs/setting_dashboard/ 下有 10 个仪表盘卡片组件，可能使用 cmp-echarts
  → import 改为 @ss-harness/compat/cmp-echarts（如已有 compat wrapper）
  → 或直接使用 echarts（如 compat 验证可直接用）
- monitor/components/ 中 realLog.vue 可能用到 cmp-socket
  → 同理用 compat 层
```

---

### Agent B 详细任务清单

**范围：views/permisson/（21）+ login/（3）+ log/（2）+ about/（2）+ errorPage/（2）= 30 .vue**

```
views/permisson/
├── index-level（2）
│   depart.vue, role.vue
├── auth/（4 + 2 子组件）
│   index.vue, apiAuth.vue, addDialog.vue
│   console_auth/index.vue, addDialog.vue
├── manager/（6）
│   index.vue, AddDialog.vue, GrantRole.vue,
│   ResetPassword.vue, SubnetCidr.vue, UserDetail.vue
├── plugins/（2）
│   index.vue, pluginConfig.vue
└── tenant/（7 + 6 子组件 = 13）
    index.vue, tenantDetail.vue, ... 
    components/basicInfo.vue, LeftMenu.vue, quota.vue,
    QuotaItem.vue, ServiceItem.vue, transfer.vue

views/login/（3）
    index.vue, sso.vue, lockme.vue

views/log/（2）
    auditLog.vue, loginLog.vue

views/about/（2）
    index.vue, activityLog.vue

views/errorPage/（2）
    401.vue, 404.vue
```

**Agent B Prompt：**

```markdown
# 任务：迁移 sms-web 的 permisson 及其他小模块

## 你的工作范围
只修改以下目录：
- sms-web/src/views/permisson/**（21 个 .vue）
- sms-web/src/views/login/**（3 个 .vue）
- sms-web/src/views/log/**（2 个 .vue）
- sms-web/src/views/about/**（2 个 .vue）
- sms-web/src/views/errorPage/**（2 个 .vue）

禁止修改 views/configs/、views/monitor/、layouts/、common/ 等。

## 迁移规则
（同 Agent A）

## 特殊注意
- views/login/lockme.vue 使用了 vue-class-component 装饰器
  → 必须完全改写为 <script setup lang="ts">，不保留任何装饰器
- views/permisson/tenant/ 是最复杂的子模块（13 个 .vue）
  → 先迁移 components/ 下的 6 个子组件，再迁移 index/detail
- views/permisson/manager/ 有用户管理的增删改查
  → 注意 Vuex permission module → Pinia usePermissionStore 的替换
```

---

### Agent C 详细任务清单

**范围：layouts/（25 .vue）+ common/components/（6 .vue）= 31 .vue**

```
layouts/
├── 根组件（3）
│   app.vue, home.vue, redirect.vue
├── components/（10）
│   Header.vue, headerMenu.vue, LevelBar.vue,
│   langSelect.vue, lockScreen.vue, process.vue,
│   rightContent.vue, SiteMessage.vue, SystemTip.vue,
│   ThirdMenu.vue
├── components/sidebar/（7）
│   sidebar.vue, sidebarItem.vue, baseMenu.vue,
│   MenuItem.vue, Link.vue, OperateBtn.vue
├── components/TagsView/（4）
│   index.vue, index_backup.vue（可删除）,
│   ScrollPanel.vue, SelectRound.vue
└── components/personal/（2）
    index.vue, InfoDialog.vue

common/components/（6）
├── icon-select/index.vue
├── image-cropper/index.vue
├── import-data/index.vue
├── sku-table/index.vue
├── TimeSelect.vue
└── upload-file/index.vue
```

**Agent C Prompt：**

```markdown
# 任务：迁移 sms-web 的 layouts 和 common 公共组件

## 背景
你是 3 个并行 Agent 中最先启动的。你的产出（layouts）是其他两个 Agent 的依赖。
请优先完成 layouts/ 的核心组件。

## 你的工作范围
只修改：
- sms-web/src/layouts/**（25 个 .vue）
- sms-web/src/common/components/**（6 个 .vue）

禁止修改 views/、store/、router/、services/。

## 优先级顺序
1. layouts/app.vue（Qiankun 壳，最优先）
2. layouts/home.vue（主布局，Header + Sidebar + Content）
3. layouts/components/sidebar/*（7 个组件）
4. layouts/components/Header.vue + headerMenu.vue
5. layouts/components/TagsView/*（标签页）
6. layouts/components/ 其余组件
7. layouts/redirect.vue
8. common/components/ 6 个公共组件

## 特殊注意
- home.vue 是最重要的布局组件（4.8KB），包含整体结构
  → 仔细处理 Vuex → Pinia 的状态引用（sidebar 折叠、用户信息等）
- layouts/components/personal/index.vue 使用了 vue-class-component
  → 改写为 <script setup lang="ts">
- layouts/components/langSelect.vue 涉及 vue-i18n
  → 当前 i18n 已禁用，保留组件但注释掉 i18n 调用，标注 TODO
- layouts/components/TagsView/index_backup.vue 是备份文件
  → 直接删除，不迁移
- common/components/upload-file/ 和 image-cropper/ 可能用到 cmp-element
  → 替换为 Element Plus 原生 el-upload
```

---

## Stage 3：合并 + 联调（~2 天）

### 合并顺序

```
Step 1: 合并 Agent C（layouts + common）
        → 验证基座中能渲染空壳布局
        
Step 2: 合并 Agent B（permisson + 小模块）
        → 验证权限相关页面可访问
        
Step 3: 合并 Agent A（configs + monitor）
        → 验证配置和监控页面正常

Step 4: 全量回归测试
```

### 合并检查清单

```
[ ] vue-tsc --noEmit 全量通过
[ ] vite build 成功
[ ] ESLint 无报错
[ ] 在基座中加载 sms-web 正常
[ ] 侧边栏菜单渲染正常
[ ] 标签页（TagsView）切换正常
[ ] 以下核心页面逐一验证：
    [ ] 登录页
    [ ] 权限管理 → 租户列表 → 租户详情
    [ ] 权限管理 → 用户管理 → 新增/编辑
    [ ] 系统配置 → 项目管理
    [ ] 系统配置 → 设置 → 各子页面
    [ ] 系统配置 → 资源仪表盘（10 个卡片）
    [ ] 监控 → 主机/服务/日志
[ ] WebSocket 连接正常（如涉及 cmp-socket）
[ ] 图表渲染正常（如涉及 cmp-echarts / @antv/g6）
[ ] 与其他子应用的联动正常
[ ] 无 ElementUI / cmp-element 残留 import
[ ] 无 this.xxx 残留
[ ] 无 any 类型（或已标注 TODO）
```

### 发现问题后的处理

```
问题归属判断：
- layouts/sidebar 渲染异常 → 找 Agent C 的分支修复
- configs 页面功能异常 → 找 Agent A 的分支修复
- permisson 页面功能异常 → 找 Agent B 的分支修复
- 跨模块问题（如 store 状态不对）→ 回到 Stage 1 修复基础层

修复方式：
- 在对应 Agent 的 worktree 分支上修复
- 不要在主分支上直接改（保持分支可追溯）
- 修复后重新合并 + 回归
```

---

## 时间线总览

```
Day 1-3:   Stage 1 串行前置
           ├── 工程骨架 + store + router（人工）
           ├── services/ TS 化（Agent）
           ├── common/ 基础迁移（Agent）
           ├── 特殊依赖确认
           └── Codemod 跑一遍

Day 3:     Agent C 启动（layouts + common/components）

Day 4:     Agent A + B 启动

Day 4-12:  Stage 2 三路并行
           ├── Agent A: configs + monitor（40 .vue）
           ├── Agent B: permisson + 小模块（30 .vue）
           └── Agent C: layouts + common（31 .vue → Day 9 完成）

Day 13-14: Stage 3 合并 + 联调

总计：约 14 个工作日（~3 周）
```

---

## 风险点

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| home.vue 布局迁移后样式错乱 | 中 | 高 | Agent C 优先处理，人工快速验证 |
| cmp-echarts 在 setting_dashboard 不可用 | 中 | 中 | Phase 0 已验证，有 compat 方案 |
| 动态路由（permission.js）逻辑迁移出错 | 中 | 高 | Stage 1 由人工处理，非 Agent |
| vue-class-component 3 个文件改写不完整 | 低 | 低 | 只有 3 个文件，Stage 1 手动处理 |
| Agent A/B 产出的代码引用了未迁移的 layouts 组件 | 中 | 中 | Agent C 先行 1-2 天解决 |

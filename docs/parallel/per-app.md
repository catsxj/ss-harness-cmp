# 各子应用 Agent 并行方案总览

> sms-web 细化方案见 [sms-web.md](sms-web.md)
> 本文档覆盖：cmp-web、cms-web、cos-web
> csc-web 不迁移（保持 Vue 2，**已移出本仓库单独维护**，2026-04-22）

---

## 总体节奏

```
scr-web (68)   ████ Done（试点）
sms-web (125)  ████████  3 Agent, ~3 周
cmp-web (521)  ████████████████  5 Agent, ~5-6 周
cms-web (521)  ████████████████  5 Agent, ~5-6 周
cos-web (567)  ██████████████████  5 Agent, ~6-8 周
csc-web (1211) ──── 不迁移（保持 Vue 2）& 已移出本仓库
```

每个子应用内部分为：
- **Stage 1 串行前置**（主 Agent 做）：骨架 + store + router + services + Codemod
- **Stage 2 并行迁移**（子 Agent 做）：.vue 文件按目录拆分
- **Stage 3 验证**（自动 CI + 人工浏览器）

---

## cmp-web（521 .vue，5 Agent）

### 项目特征
- 最大特殊依赖：cmp-socket、cmp-echarts、**cmp-element**（不可升级）
- 已有 @vue/composition-api
- 已有 Qiankun lifecycle
- 已有 vite.config.ts（Vue2 模式）

### Stage 1 串行前置（~3 天）

```
主 Agent 完成：
1. package.json → Vue3 + Element Plus + Pinia + Vite
2. vite.config.ts 改为 Vue3 模式
3. main.ts → Vue3 + Qiankun lifecycle
4. store/ → Pinia（读取各 module 后逐个转写）
5. router/ → vue-router 4
6. services/ 和 utils/ → TS 化
7. common/hooks/ → 直接迁移（已是 Composition API）
8. common/mixins/ → 转为 composables
9. Codemod 预处理：
   - ElementUI → Element Plus 标签
   - cmp-element import → 直接用 Element Plus
   - .sync → v-model
   - this.$message → ElMessage
```

### Stage 2 并行拆分（5 Agent）

需要先了解 views/ 下的模块结构。按经验，521 个 .vue 应分布在 15-25 个子目录中。

```
┌──────────────────────────────────────────────────────────────────┐
│                     cmp-web 并行迁移                              │
│                                                                  │
│  Agent A          Agent B          Agent C          Agent D      │
│  ──────────       ──────────       ──────────       ──────────   │
│  views/           views/           views/           views/       │
│  模块组1          模块组2          模块组3          模块组4       │
│  ~130 .vue        ~130 .vue        ~130 .vue        ~130 .vue    │
│                                                                  │
│                          Agent E                                 │
│                          ──────────                              │
│                          common/components/                      │
│                          + layouts/                              │
│                          + components/                           │
│                          (~50 .vue)                              │
│                                                                  │
│  Agent E 先行 1 天（layouts 是其他 Agent 的依赖）                  │
└──────────────────────────────────────────────────────────────────┘
```

**拆分原则：**
- Agent E 负责公共层（layouts + common/components），先行启动
- Agent A-D 按 views/ 子目录均分，每路 ~130 个 .vue
- 具体哪些目录归哪个 Agent，需在 Stage 1 时根据实际目录结构决定

### cmp-element 处理策略

```
由于 cmp-element 不可升级，两种处理方式：

方案 1（推荐）：Codemod 在 Stage 1 批量将所有 cmp-element 组件替换为 Element Plus 原生组件
  - 需要先分析 cmp-element 导出了哪些组件
  - 逐个映射到 Element Plus 对应组件
  - 大部分是简单封装，替换成本可控

方案 2：在 compat 层重新实现
  - 创建 @ss-harness/compat/cmp-element
  - 用 Element Plus 实现同名同 API 组件
  - 子应用只改 import 路径
```

---

## cms-web（521 .vue，5 Agent）

### 项目特征
- **vue-class-component + vue-property-decorator**（装饰器写法，改写量大）
- **vue-i18n 8.15.0**（需升级到 v9）
- **WangEditor 4.6.16**（需升级到 v5）
- cmp-element（不可升级）
- 已有 Qiankun lifecycle

### Stage 1 串行前置（~4 天，比其他多 1 天）

```
额外工作：
1. vue-i18n 8 → 9 迁移
   - new VueI18n() → createI18n()
   - $t() 用法基本兼容，但插件注册方式变了
   - 语言文件结构可能需要调整

2. WangEditor 4 → 5 迁移
   - 导入方式变化：import { createEditor } from '@wangeditor/editor'
   - Vue 组件包：@wangeditor/editor-for-vue@next
   - API 有 breaking change

3. Codemod 额外覆盖：
   - @Component 装饰器 → <script setup> 骨架
   - @Prop → defineProps
   - @Emit → defineEmits
   - @Watch → watch()
   - 类成员方法 → 普通函数
   - get xxx() → computed()
```

### Stage 2 并行拆分（5 Agent）

```
┌──────────────────────────────────────────────────────────────────┐
│                     cms-web 并行迁移                              │
│                                                                  │
│  Agent A          Agent B          Agent C          Agent D      │
│  ──────────       ──────────       ──────────       ──────────   │
│  views/           views/           views/           views/       │
│  模块组1          模块组2          模块组3          模块组4       │
│  ~130 .vue        ~130 .vue        ~130 .vue        ~130 .vue    │
│                                                                  │
│                          Agent E                                 │
│                          ──────────                              │
│                          layouts/ + common/                      │
│                          + i18n 集成验证                          │
│                          (~50 .vue)                              │
└──────────────────────────────────────────────────────────────────┘
```

### 特殊 Prompt 要求

```
所有 Agent 的 Prompt 中需额外说明：

## vue-class-component 改写规则
- @Component({ name: 'Xxx' }) → 删除，<script setup> 不需要 name
- @Prop({ default: '' }) title!: string → const props = defineProps<{ title?: string }>()
- @Emit('update') → const emit = defineEmits<{ update: [value: string] }>()
- @Watch('value') → watch(() => props.value, (newVal) => { ... })
- get computedProp() → const computedProp = computed(() => ...)
- 类方法 handleClick() → function handleClick()
- data 成员 → const xxx = ref(initialValue)
- created() → 直接写在 setup 顶层
- mounted() → onMounted(() => { ... })

## i18n 用法
- $t('key') → import { useI18n } from 'vue-i18n'; const { t } = useI18n(); t('key')
- 或在 template 中直接用 $t('key')（vue-i18n 9 仍支持）
```

---

## cos-web（567 .vue，5 Agent）

### 项目特征
- **cmp-graph + cmp-graph-editor + cmp-topology**（不可升级，图/拓扑核心依赖）
- CodeMirror 5.60 → 需评估是否升级
- mavon-editor 2.9 → 需替换 Vue3 版本
- echarts 5.3（已是 v5，好消息）
- Vue Draggable Resizable、Vue Grid Layout → 需替换 Vue3 版本
- **最复杂的可视化子应用**

### Stage 1 串行前置（~4 天）

```
额外工作：
1. 验证 cmp-graph / cmp-graph-editor / cmp-topology 的 Vue3 兼容性
   - 如果它们只是 JS 库（无 Vue 依赖）→ 直接用
   - 如果依赖 Vue 2 → 写 Vue3 wrapper 组件在 compat 层

2. 第三方库替换：
   - vue-draggable-resizable → vue-draggable-resizable@3（Vue3 版）
   - vue-grid-layout → vue-grid-layout@3.0.0-beta
   - mavon-editor → md-editor-v3 或 @kangc/v-md-editor@next
   - CodeMirror 5 → 暂保持（与 Vue3 无直接依赖，可延后升级）

3. Codemod 标准预处理
```

### Stage 2 并行拆分（5 Agent）

```
┌──────────────────────────────────────────────────────────────────┐
│                     cos-web 并行迁移                              │
│                                                                  │
│  Agent A          Agent B          Agent C          Agent D      │
│  ──────────       ──────────       ──────────       ──────────   │
│  views/           views/           views/           views/       │
│  模块组1          模块组2          模块组3          模块组4       │
│  ~115 .vue        ~115 .vue        ~115 .vue        ~115 .vue    │
│                                                                  │
│                          Agent E                                 │
│                          ──────────                              │
│                          layouts/ + common/                      │
│                          + components/                           │
│                          (~110 .vue)                             │
└──────────────────────────────────────────────────────────────────┘

⚠️ 关键分工原则：
- 图/拓扑相关的页面集中分给 1 个 Agent（保持上下文一致）
- CodeMirror 相关页面集中分给 1 个 Agent
- 普通 CRUD 页面均分给其他 Agent
```

### 图/拓扑组件的特殊处理

```
如果 cmp-graph 等包在 Vue3 下可用：
  → Agent Prompt 中说明直接 import 使用

如果不可用：
  → Stage 1 中在 compat 层写 wrapper：
    <template>
      <div ref="container"></div>
    </template>
    <script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue'
    import CmpGraph from 'cmp-graph'  // 原包

    const container = ref<HTMLDivElement>()
    let instance: any = null

    onMounted(() => {
      instance = new CmpGraph(container.value, options)
    })
    onUnmounted(() => {
      instance?.destroy()
    })
    </script>
```

---

---

## 各子应用对比

| | sms-web | cmp-web | cms-web | cos-web |
|--|---------|---------|---------|---------|
| .vue 数量 | 125 | 521 | 521 | 567 |
| Agent 数 | 3 | 5 | 5 | 5 |
| Stage 1 天数 | 3 | 3 | 4 | 4 |
| Stage 2 天数 | 8-10 | 12-15 | 12-15 | 15-18 |
| Stage 3 天数 | 2 | 3 | 3 | 4 |
| 总计天数 | 13-15 | 18-21 | 19-22 | 23-26 |
| 特殊难点 | vue-grid-layout | cmp-element | class-component + i18n | 图/拓扑 3 包 |
| 先行 Agent | layouts | layouts | layouts + i18n | layouts + 图 wrapper |

> csc-web 不迁移，保持 Vue 2，已移出本仓库单独维护（2026-04-22）。Qiankun 天然支持 Vue 2 + Vue 3 子应用跨仓库 / 跨部署共存。

## Codemod 脚本复用矩阵

```
                      sms  cmp  cms  cos
element-ui-to-plus     ✓    ✓    ✓    ✓
cmp-element-replace    ✗    ✓    ✓    ✓
remove-this            ✓    ✓    ✓    ✓
options-to-setup       ✓    ✓    ✓    ✓
class-component-setup  ✗    ✗    ✓    ✗
vue-router-upgrade     ✓    ✓    ✓    ✓
i18n-upgrade           ✗    ✗    ✓    ✗

每完成一个子应用，Codemod 脚本会更完善，后续子应用受益。
这就是串行迁移的优势——经验编码化。
```

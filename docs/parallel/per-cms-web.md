# cms-web 并行迁移方案（521 .vue，5 Agent）

> 从 per-app.md 拆出。

## 项目特征

- **vue-class-component + vue-property-decorator**（装饰器写法，改写量大）
- **vue-i18n 8.15.0**（需升级到 v9）
- **WangEditor 4.6.16**（需升级到 v5）
- cmp-element（不可升级，用 `@ss-cmp/cmp-element`）
- 已有 Qiankun lifecycle

## Stage 1 串行前置（~4 天，比其他多 1 天）

额外工作：

### 1. vue-i18n 8 → 9 迁移

- `new VueI18n()` → `createI18n()`
- `$t()` 用法基本兼容，但插件注册方式变了
- 语言文件结构可能需要调整

### 2. WangEditor 4 → 5 迁移

- 导入方式变化：`import { createEditor } from '@wangeditor/editor'`
- Vue 组件包：`@wangeditor/editor-for-vue@next`
- API 有 breaking change

### 3. Codemod 额外覆盖

- `@Component` 装饰器 → `<script setup>` 骨架
- `@Prop` → `defineProps`
- `@Emit` → `defineEmits`
- `@Watch` → `watch()`
- 类成员方法 → 普通函数
- `get xxx()` → `computed()`

## Stage 2 并行拆分（5 Agent）

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

## 特殊 Prompt 要求

所有 Agent 的 Prompt 中需额外说明：

### vue-class-component 改写规则

```
- @Component({ name: 'Xxx' }) → 删除，<script setup> 不需要 name
- @Prop({ default: '' }) title!: string
  → const props = defineProps<{ title?: string }>()
- @Emit('update')
  → const emit = defineEmits<{ update: [value: string] }>()
- @Watch('value')
  → watch(() => props.value, (newVal) => { ... })
- get computedProp() → const computedProp = computed(() => ...)
- 类方法 handleClick() → function handleClick()
- data 成员 → const xxx = ref(initialValue)
- created() → 直接写在 setup 顶层
- mounted() → onMounted(() => { ... })
```

### i18n 用法

```
- $t('key') → import { useI18n } from 'vue-i18n'
               const { t } = useI18n()
               t('key')
- 或在 template 中直接用 $t('key')（vue-i18n 9 仍支持）
```

## 踩坑参考（sms-web 迁移时已出现）

- pitfall 20（.claude/memory/project_cmp_pitfalls.md）：`vue-class-component / vue-property-decorator` 必须移除；Vue 3 没有这两个包的对应实现
- sms-web 只涉及 3 个文件用了这些装饰器；cms-web 预计几十到上百个，Codemod 必须在 Stage 1 彻底跑完

# Vue 3 写法规则

> 禁止的旧写法 / 必须的新写法。写 script 部分时对照。

---

## 禁止（旧写法）

```
this.xxx / this.$refs / this.$set / this.$on / this.$bus
Vue.prototype.xxx / filters / mixins / Options API
vue-class-component / vue-property-decorator（@Component / @Prop / @Watch / extends Vue）
```

## 必须（新写法）

```
<script setup lang="ts">
Pinia
vue-router 4
Composables（useXxx）
async/await
```

## 常见迁移模式

| 旧写法 | 新写法 |
|--------|--------|
| `mixins: [xxx]` | `const { ... } = useXxx(props, callback)` |
| `this.chart` | composable 返回的 `chart` ref |
| `this.$refs.foo` | 用 `ref<FormInstance>()` 显式声明 + defineExpose 子组件 |
| `this.$emit('x', v)` | `defineEmits<{ x: [val: typeof v] }>()` + `emit('x', v)` |
| `this.$bus` / `$on` | 用 Pinia store 或 mitt（外部事件总线） |
| `filters` | 普通函数，在 script setup 里 import 或定义 |

## 相关

- [typescript-rules.md](typescript-rules.md) — TS 约束（包括必须 lang="ts"）
- [element-plus-mapping.md](element-plus-mapping.md) — UI 组件 API 迁移
- [../history/knowledge-base/vue3-migration/](../history/knowledge-base/vue3-migration/) — Vue 3 迁移知识库

# 开发者迁移指南（人读版）

> 面向参与迁移的其他团队成员，介绍迁移后的代码风格变化

---

## 迁移后你需要知道的变化

### 1. 组件写法变了

```vue
<!-- 旧：Vue 2 Options API -->
<script>
export default {
  data() { return { count: 0 } },
  computed: { double() { return this.count * 2 } },
  methods: { add() { this.count++ } },
  mounted() { console.log('mounted') }
}
</script>

<!-- 新：Vue 3 Composition API + script setup -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
function add() { count.value++ }
onMounted(() => { console.log('mounted') })
</script>
```

### 2. 状态管理从 Vuex 换成 Pinia

```typescript
// 旧：Vuex
this.$store.state.foo
this.$store.commit('SET_FOO', value)
this.$store.dispatch('getFoo')
...mapState(['foo'])
...mapActions(['getFoo'])

// 新：Pinia
import { useFooStore } from '@/stores/foo'
const store = useFooStore()
store.foo           // 直接访问
store.getFoo()      // 直接调用 action
```

### 3. 路由用法变了

```typescript
// 旧
this.$router.push('/path')
this.$route.params.id

// 新
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
router.push('/path')
route.params.id
```

### 4. UI 组件库换了

```
ElementUI → Element Plus

主要差异：
- this.$message() → import { ElMessage } from 'element-plus'; ElMessage()
- :visible.sync → v-model
- @click.native → @click
- 图标从内置改为独立包 @element-plus/icons-vue
```

### 5. 不能用的写法

```
❌ this.xxx          → 在 setup 中无 this
❌ this.$refs        → const ref = ref<T>()
❌ filters           → 用普通函数
❌ mixins            → 用 composables (useXxx)
❌ Vue.prototype     → app.config.globalProperties
❌ this.$set         → 直接赋值
❌ this.$on/$off     → 用 mitt 或 provide/inject
```

### 6. TypeScript 是必须的

```
- 所有新写/改写的文件用 .ts 或 <script lang="ts">
- props 和 emits 需要类型标注
- 禁止使用 any
```

---

## 本地开发

```bash
# 进入子应用目录
cd sms-web

# 安装依赖
pnpm install

# 启动开发
pnpm serve    # 或 vue-cli-service serve

# 构建
pnpm build
```

## 分支规范

```
develop           ← 迁移主分支
feature/migrate-* ← 各子应用迁移分支，完成后合并回 develop
main              ← 基线，不直接修改
```

## 遇到问题

1. 查看 `docs/history/migration-notes/{app-name}.md` 中的踩坑记录
2. 查看 `docs/history/failure-cases.md` 中的失败案例记录
3. 查看 `.claude/memory/project_cmp_pitfalls.md` 中的详细踩坑（38+ 条）

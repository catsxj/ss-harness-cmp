# 架构约束 Linter 规则

> 将分层依赖规则编码为 ESLint 规则，自动拦截违规 import

---

## 分层依赖模型

```
types → constants → utils → api → stores → components → views → router → main
         ↑ 下层不能反向依赖上层
```

**违规示例：**
```typescript
// ❌ utils 不能 import vue 组件
// src/utils/helper.ts
import MyComponent from '@/components/MyComponent.vue'

// ❌ api 不能 import store
// src/api/user.ts
import { useUserStore } from '@/stores/user'

// ❌ components 不能 import views
// src/components/Header.vue
import Dashboard from '@/views/dashboard/index.vue'

// ❌ stores 不能 import components
// src/stores/app.ts
import Dialog from '@/components/Dialog.vue'
```

---

## ESLint 规则配置

使用 `eslint-plugin-import` 的 `no-restricted-paths` 规则：

```javascript
// .eslintrc.js（各子应用）
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-restricted-paths': ['error', {
      zones: [
        // utils 不能 import components/views/stores/router
        {
          target: './src/utils/**',
          from: './src/components/**',
          message: '分层违规：utils 不能 import components'
        },
        {
          target: './src/utils/**',
          from: './src/views/**',
          message: '分层违规：utils 不能 import views'
        },
        {
          target: './src/utils/**',
          from: './src/stores/**',
          message: '分层违规：utils 不能 import stores'
        },
        // api 不能 import stores/components/views
        {
          target: './src/services/**',
          from: './src/stores/**',
          message: '分层违规：api/services 不能 import stores'
        },
        {
          target: './src/services/**',
          from: './src/components/**',
          message: '分层违规：api/services 不能 import components'
        },
        {
          target: './src/services/**',
          from: './src/views/**',
          message: '分层违规：api/services 不能 import views'
        },
        // stores 不能 import components/views
        {
          target: './src/stores/**',
          from: './src/components/**',
          message: '分层违规：stores 不能 import components'
        },
        {
          target: './src/stores/**',
          from: './src/views/**',
          message: '分层违规：stores 不能 import views'
        },
        // components 不能 import views
        {
          target: './src/components/**',
          from: './src/views/**',
          message: '分层违规：components 不能 import views'
        }
      ]
    }]
  }
}
```

---

## 安装依赖

```bash
# 各子应用中安装
pnpm add -D eslint-plugin-import
```

---

## 部署策略

1. **迁移期间**：先设为 `warn`，不阻断构建，但在控制台可见
2. **迁移完成后**：改为 `error`，CI 强制阻断

```javascript
// 迁移期间
'import/no-restricted-paths': ['warn', { zones: [...] }]

// 迁移完成后
'import/no-restricted-paths': ['error', { zones: [...] }]
```

---

## Linter 错误信息即上下文工程

错误信息本身就是给 Agent/开发者的指导：

```
分层违规：utils 不能 import stores
↑ 直接告诉你哪条规则被违反了
```

这就是 Harness Engineering 的核心理念：**把约束编码为自动化检查，让机器执行而非依赖人工 Review。**

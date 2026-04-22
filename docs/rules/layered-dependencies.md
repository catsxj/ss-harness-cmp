# 分层依赖规则

> 代码组织骨架：import 方向严格分层，禁反向。

---

## 分层

```
types → constants → utils → api → stores → components → views → router → main
```

## 严禁反向依赖

例如：
- utils 不能 import 任何 vue 组件
- api 不能 import store
- components 不能 import views
- stores 不能 import components

## 自动化执行

通过 `eslint-plugin-import` 的 `no-restricted-paths` 规则编码为 Linter 检查。
详见 [architecture-lint.md](architecture-lint.md)。

## 技术债追踪

迁移中的 TODO / any 残留 / 兼容代码统一用 `// TODO: {type} - {描述}` 格式标记。
详见 [../developer/tech-debt-tracking.md](../developer/tech-debt-tracking.md)。

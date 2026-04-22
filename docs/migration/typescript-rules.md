# TypeScript 规则

> TS 硬约束。禁 any、必带类型、第三方库缺类型写 .d.ts。

---

## 组件必须用 `<script setup lang="ts">`

props / emit 必须带类型：

```typescript
const props = defineProps<{ title: string; count?: number }>()
const emit = defineEmits<{ update: [value: string] }>()

// ref 显式标注复杂类型
const form = ref<FormInstance>()
```

## 硬约束

```
- 禁止 any，允许 unknown
- API 返回值必须有 interface
- 第三方库缺类型时写 .d.ts，不用 any 绕过
```

## 延伸规则

- 禁止 `// @ts-ignore` / `// @ts-nocheck` —— 见 [../rules/agent-constraints.md](../rules/agent-constraints.md)
- TS 迁移相关踩坑（如 moduleResolution `node` → `bundler`）：[`.claude/memory/project_cmp_pitfalls.md`](../../.claude/memory/project_cmp_pitfalls.md) 第 26 条

## 相关

- [vue3-syntax.md](vue3-syntax.md) — script setup 必选
- [../rules/agent-constraints.md](../rules/agent-constraints.md) — "禁止 any" 源出处

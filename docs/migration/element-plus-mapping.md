# Element Plus 迁移规则

> ElementUI → Element Plus 的 API 映射 + 容易遗漏的差异。改 .vue 模板时常翻。

---

## 组件 API 映射

```
:visible.sync="show"              → v-model="show"
@click.native                     → @click
this.$message()                   → import { ElMessage } from 'element-plus'; ElMessage()
this.$confirm()                   → ElMessageBox.confirm()
this.$loading()                   → ElLoading.service()
<i class="el-icon-edit">          → import { Edit } from '@element-plus/icons-vue'; <el-icon><Edit /></el-icon>
<template slot="xxx">             → <template #xxx>
el-radio-button label=            → el-radio-button value=
```

## 容易遗漏的差异

```
- el-pagination: total 为 0 时默认不渲染
- el-table: selection API 返回值可能不同
- el-form: validate() 返回 Promise
- el-upload: before-upload 返回 false 或 Promise.reject 阻止上传
- el-date-picker: value-format 默认行为可能不同，显式指定
```

---

## 延伸踩坑（历史沉淀）

更深入的 Element Plus 实际踩坑（submenu 改名、date-picker picker-options 拆分、value-format 大小写、el-tabs 的 model-value 等）：
- [../history/failure-cases.md](../history/failure-cases.md) — 失败案例登记表
- [`.claude/memory/project_cmp_pitfalls.md`](../../.claude/memory/project_cmp_pitfalls.md) — Claude 私有详细记忆（11-18, 23, 30, 35 等条）

## 相关

- [vue3-syntax.md](vue3-syntax.md) — Vue 3 写法规则
- [compat-layer.md](compat-layer.md) — cmp-element 自研包 compat 策略

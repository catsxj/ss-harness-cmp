# migration — 迁移规范与流程

> Vue 2 + ElementUI + Vuex + JS → Vue 3 + Element Plus + Pinia + TS。
> 本区文件覆盖流程（Phase A-D）+ 各技术栈映射规则 + compat 层做法。
> 开始迁一个子应用前至少读 lifecycle.md。

---

## 文件清单

| 文件 | 说明 | 何时读 |
|------|------|--------|
| [lifecycle.md](lifecycle.md) | 单个子应用迁移完整生命周期 Phase A-D | 开始一个子应用前 |
| [element-plus-mapping.md](element-plus-mapping.md) | ElementUI → Element Plus API 映射 + 容易遗漏差异 | 改 .vue 模板时 |
| [vue3-syntax.md](vue3-syntax.md) | 禁止的旧写法 / 必须的新写法 | 写 script 部分时 |
| [typescript-rules.md](typescript-rules.md) | TS 硬约束（禁 any、必带类型、.d.ts 补第三方） | 写 .ts / .tsx 时 |
| [qiankun-constraints.md](qiankun-constraints.md) | 子应用 Qiankun 集成约束 | 改 main.ts / router 时 |
| [compat-layer.md](compat-layer.md) | cmp-element / cmp-echarts 自研包 compat 层策略 + 组件清单 | 遇到自研包组件时 |

---

## 推荐读的次序（首次迁移一个新子应用）

1. **lifecycle.md** —— Phase A 到 D 全景
2. **qiankun-constraints.md** —— 子应用边界
3. **vue3-syntax.md** + **typescript-rules.md** —— 代码风格
4. **element-plus-mapping.md** —— 改模板时常翻
5. **compat-layer.md** —— 碰到 cmp-* 自研组件时查

---

**状态说明**：本区 6 个文件中 5 个将在 Step 2 从 CLAUDE.md 拆出；`compat-layer.md` 在 Step 3 新建（提炼自 `.claude/memory/project_cmp_pitfalls.md` 的 25-26 条）。

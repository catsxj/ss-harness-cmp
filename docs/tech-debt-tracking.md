# 技术债追踪（熵管理）

> 迁移过程中产生的技术债必须被追踪，避免"后续处理"变成"永远不处理"

---

## 技术债类型

| 类型 | 标记方式 | 示例 |
|------|---------|------|
| 待补类型 | `// TODO: type` | `const data: any // TODO: type - 补充 API 返回类型` |
| ECharts v4 语法 | `// TODO: echarts5` | `itemStyle: { normal: { color } } // TODO: echarts5 - 移除 normal 层级` |
| 临时兼容代码 | `// TODO: compat` | `// TODO: compat - 迁移完成后移除此兼容层` |
| 待替换依赖 | `// TODO: replace` | `import xxx from 'vue-seamless-scroll' // TODO: replace - 已有 vue3 版但未验证` |
| 待重构逻辑 | `// TODO: refactor` | `// TODO: refactor - 此函数过长（>100行），应拆分` |

**统一格式：`// TODO: {type} - {描述}`**

---

## 定期扫描命令

```bash
# 统计各类技术债数量
echo "=== 技术债统计 ==="
echo "待补类型:"; grep -rn "// TODO: type" src/ --include="*.vue" --include="*.ts" | wc -l
echo "ECharts v4 语法:"; grep -rn "// TODO: echarts5" src/ --include="*.vue" --include="*.ts" | wc -l
echo "临时兼容:"; grep -rn "// TODO: compat" src/ --include="*.vue" --include="*.ts" | wc -l
echo "待替换依赖:"; grep -rn "// TODO: replace" src/ --include="*.vue" --include="*.ts" | wc -l
echo "待重构:"; grep -rn "// TODO: refactor" src/ --include="*.vue" --include="*.ts" | wc -l
echo "---"
echo "any 残留:"; grep -rn ": any\b" src/ --include="*.vue" --include="*.ts" | wc -l
echo "ts-ignore:"; grep -rn "@ts-ignore\|@ts-nocheck" src/ --include="*.vue" --include="*.ts" | wc -l
echo "总 TODO:"; grep -rn "// TODO" src/ --include="*.vue" --include="*.ts" | wc -l
```

---

## 技术债记录表

每个子应用迁移完后记录：

### scr-web

| 类型 | 数量 | 说明 |
|------|------|------|
| ECharts v4 语法 | ~20+ | DEPRECATED 警告，功能不受影响，后续统一清理 |
| any 残留 | 待统计 | tsconfig 中 noImplicitAny: false（过渡期） |

### sms-web（基座联调完成 2026-04-21）

| 类型 | 数量 | 状态 / 说明 |
|------|------|------|
| TODO: cmp-element | 82 | **已由 compat 层解决**（`src/common/compat/` 全量注册），业务代码 TODO 标记可渐进删除 |
| TODO: cmp-echarts | 7 | **已由 compat 层解决**（echarts@5 + echarts-liquidfill），TODO 标记可渐进删除 |
| TODO: i18n | 199 | vue-i18n@8 不兼容 Vue 3；业务硬编码中文，需升级 vue-i18n@9 统一处理 |
| TODO: type | 55 | 自研组件 ref 实例（BasicForm ref 的 validate/resetFields 已有推断，可进一步细化） |
| `: any` | 515 | 部分来自接口返回、cmp-socket/vuedraggable 无类型；可逐步用 zod 或 io-ts 推断 |
| `@ts-expect-error` | 1 | crypto-js 缺 @types |
| 临时 parent.refs | 3 | configs/AddDialog、component/AddDialog、tenant/AddDialog `getCurrentInstance().parent.refs` 过渡 |

**清理优先级**：
1. 批量删除 `TODO: cmp-element` / `TODO: cmp-echarts` 注释（compat 层已接管）
2. 补齐核心表单 ref 类型（BasicForm 的 validate/resetFields 已有类型可推断）
3. vue-i18n@9 迁移（单独任务）

**运行时验证** ✅：eslint 0 errors / build 通过 / dev server / Qiankun 基座挂载全过

### cmp-web

| 类型 | 数量 | 说明 |
|------|------|------|
| 待记录 | | |

### cms-web

| 类型 | 数量 | 说明 |
|------|------|------|
| 待记录 | | |

### cos-web

| 类型 | 数量 | 说明 |
|------|------|------|
| 待记录 | | |

---

## 偿还策略

参考 Harness Engineering 的"持续小额偿还"原则：

```
1. 每次迁移新子应用时：
   - 顺手修复上一个子应用遗留的 1-2 个 TODO（如果改动小）
   - 不要一次性清理所有债务

2. 所有子应用迁移完成后（Phase 4）：
   - 集中清理 ECharts v4 语法（全局 Codemod）
   - 开启 noImplicitAny: true，逐步补全类型
   - 移除所有 // TODO: compat 兼容代码

3. 每月/每季度：
   - 跑一次扫描命令，统计债务总量
   - 债务量应随时间递减，如果递增则需要专项清理
```

---

## 与文档同步（Doc-gardening）

迁移过程中文档容易过时。定期检查：

```
[ ] CLAUDE.md 的"迁移顺序与状态"是否与实际一致
[ ] docs/migration-notes/ 是否每个迁完的子应用都有总结
[ ] .claude/memory/ 中的信息是否与代码现状一致
[ ] upgrade-plan.md 的时间线估算是否需要更新
[ ] 失败案例记录是否包含了最新的踩坑
```

**建议：每迁完一个子应用后，花 10 分钟更新以上文档。**

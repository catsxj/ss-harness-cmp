# Phase 3：批量迁移剩余 5 个子应用

**目标：复用 Phase 2 经验，逐个迁移**
**预计周期：整体 18-34 周**

## 执行状态

⏳ **进行中**：sms-web ✅（2026-04-22）· cmp-web / cms-web / cos-web ⬜

---

## 3.1 迁移顺序（按复杂度递增）

```
scr-web（试点，已完成）    ████████████ Done      68 .vue
sms-web（中等，已完成）    ████████████ Done      126 .vue
cmp-web（高）              ██████░░░░░░           521 .vue    ~5-6 周
cms-web（高+i18n）         █████░░░░░░░           521 .vue    ~5-6 周
cos-web（极高+graph）      ████░░░░░░░░           567 .vue    ~6-8 周
csc-web                    ────────────           不迁移（保持 Vue 2）

原则：一个迁完上线后，再开下一个。
```

## 3.2 各子应用特殊注意事项

### sms-web（126 .vue，~3 周）— ✅ 已完成

```
特殊依赖：
- AntV G6 4.6.0 → 评估是否升级到 5.x
- vuedraggable → 替换为 vue3 版本 vuedraggable@next
- vue-grid-layout 2.3.12 → grid-layout-plus（Vue 3 兼容）
- cmp-socket → 不可升级，用 compat 层或直接引用
- cmp-echarts / cmp-element → 见 @ss-cmp/* 包

Qiankun lifecycle：已有 ✓
实际交付：commit a0927ef merge（Phase 0-3 workspace）
```

### cmp-web（521 .vue，~5-6 周）

```
特殊依赖：
- cmp-socket → 不可升级，用 compat 层或直接引用
- cmp-echarts → @ss-cmp/cmp-echarts（6 chart + useChart）
- cmp-element → @ss-cmp/cmp-element（10 重写 + 3 A 档 port，按需 import）
- @vue/composition-api → 移除，使用原生 Vue 3

最大风险：cmp-element 的替换（import 路径全部改为 @ss-cmp/*）
建议：用 Codemod 脚本批量替换 import 路径

Qiankun lifecycle：已有 ✓

启动前必读：
- [.claude/memory/project_cmp_workspace_flow.md](../../.claude/memory/project_cmp_workspace_flow.md)
  "未验证组件清单"章节（3 个 cmp-element port + 5 个 cmp-graph port 仅编译）
- vue.config.js 必须加 vue / element-plus / @element-plus/icons-vue 三条 alias（pitfall 39）
```

### cms-web（521 .vue，~5-6 周）

```
特殊依赖：
- vue-i18n 8.15.0 → 升级到 vue-i18n 9.x（Vue3 版本）
- WangEditor 4.6.16 → 升级到 wangeditor 5.x（Vue3 版本）
- vue-class-component → 全部改写为 <script setup>
- vue-property-decorator → 全部改写为 defineProps/defineEmits
- cmp-element → @ss-cmp/cmp-element

最大风险：
1. vue-class-component 装饰器写法的全面重写
2. vue-i18n 升级（API 变化较大）

Qiankun lifecycle：已有 ✓
```

### cos-web（567 .vue，~6-8 周）

```
特殊依赖：
- cmp-graph → @ss-cmp/cmp-graph（5 A 档 port，runtime 未验证）
- cmp-graph-editor → 原包（无源，待评估）
- cmp-topology → @ss-cmp/cmp-topology（Phase 4 重新实现）
- CodeMirror 5.60.0 → @ss-cmp/cmp-element 的 CodeMirror（codemirror@5）
- echarts 5.3.1 → 基本兼容
- Vue Draggable Resizable → Vue3 版本
- Vue Grid Layout → grid-layout-plus
- mavon-editor 2.9.1 → Vue3 markdown 编辑器
- cmp-element → @ss-cmp/cmp-element

最大风险：
1. 图/拓扑 3 个自研包 —— cmp-graph 已做 5 个 A 档 port 但 runtime 未验证
   （Editor.vue + @antv/g6-editor@^1.2.0 + Vue 3 的兼容性待证）
2. 567 个组件的纯体力活
3. iconfont scoped style 路径解析（Editor.vue）

Qiankun lifecycle：已有 ✓
```

### csc-web — 不迁移

```
决策：csc-web 保持 Vue 2 现状，不纳入本次迁移范围。
原因：体量过大（1,211 .vue），投入产出比低。
Qiankun 天然支持 Vue 2 + Vue 3 子应用共存，csc-web 可继续正常运行。
2026-04-22：已从本仓库移出，单独维护。
```

## 3.3 加速手段

### Codemod 脚本（Phase 2 后编写）

```
codemod/
├── element-ui-to-plus.ts       # ElementUI → Element Plus
├── cmp-element-to-compat.ts    # cmp-element import → @ss-cmp/cmp-element
├── remove-this.ts              # 移除 this.xxx
├── options-to-setup.ts         # Options API → <script setup>
├── class-component-to-setup.ts # vue-class-component → <script setup>（cms-web 专用）
├── add-ts-types.ts             # 自动推断类型
├── vue-router-upgrade.ts       # 路由升级
└── i18n-upgrade.ts             # vue-i18n 8 → 9（cms-web 专用）
```

### Agent 并行策略

```
同一子应用内，按目录拆分给不同 Agent：

Agent 1 → views/moduleA/
Agent 2 → views/moduleB/
Agent 3 → components/

前提：共享 CLAUDE.md，迁完人工 Review 合并。

pnpm 命令：
  pnpm --filter sms-web dev       # 只启动指定子应用
  pnpm --filter sms-web build     # 只构建
  pnpm --filter sms-web typecheck # 只检查类型
  pnpm -r run build               # 全量构建
```

## 3.4 每个子应用迁移后的检查清单

```
编译级验证（Agent 自动完成）：
[ ] vue-tsc --noEmit 通过
[ ] eslint 通过
[ ] vite build 成功
[ ] 无 any 类型（或已标注 TODO）

浏览器级验证（人工逐页确认，迁移完成的最终标准）：
[ ] 子应用在基座中正常加载，无白屏
[ ] 所有页面功能与旧版一致——逐页操作验证
[ ] 表单提交、列表查询、弹窗交互等核心功能正常
[ ] 与基座 main-web 通信正常（actions.init、全局状态）
[ ] 与其他子应用联动正常
[ ] Element Plus 样式在沙箱下正常（无泄漏、无错位）
[ ] 路由切换无白屏
[ ] 子应用独立运行正常（脱离基座可单独访问）

迁移完成 = 浏览器中所有功能正常运行。
编译通过只是前置门槛，不是完成标准。

[ ] 坑和经验已更新到 CLAUDE.md
```

---
name: sms-web workspace 抽取流程 + 遗留问题
description: 2026-04-22/23 把 sms-web compat/utils/validate 抽到仓库根 packages/ 的全流程节点 + 遇到的真实问题 + follow-up A 档 port 的未验证组件清单。Phase 4 cmp-web 迁移启动前必读。
type: project
---

## 流程节点（按时间顺序）

### Phase 0 — 准备（Task 1）
- develop @ `05822f0`（含 cop-web scaffold）+ `bc031ef`（gitignore build 产物）
- 打 tag `before-workspace` 作为回滚基线（已推 origin）
- 切 `chore/introduce-workspace` 分支
- 记录 sms-web build baseline：**7.1 MB output**（`sms-web/sms-web/` dir）+ hash `4d5080dd8fc6d1e3`

### Phase 1 — workspace 骨架（Task 2-4）
- commit `d46a596`：`pnpm-workspace.yaml` + root `package.json` (`pnpm@10.14.0`) + `.npmrc` (`shared-workspace-lockfile=false` + `auto-install-peers=true`) + 6 个空 `packages/` 骨架
- 首次 pnpm install **失败**（EPERM on cos-web/.pnpm/@antv+util；几十个 .bin ENOENT on sms-web）→ **核清方案**：删所有 7 个 sub-app + root 的 node_modules 后重装（19m 57s）
- sub-app 旧 pnpm v6 lockfile 被 pnpm 10 标记 broken 自动重写（cmp/cms/cop/cos/main），sms-web/scr-web 的 lockfile 已 pnpm 10 兼容不变

### Phase 2 — 抽取 + 消费方改造（Task 5-11）
- commit `5278359`：53 files changed，大部分 rename 100% 相似度（git history 保留完整）
- 抽出：tokens.scss / global-ui.scss → design-tokens；6 utils → @ss-cmp/utils；10 UI .vue + validate/index.ts → cmp-element；6 charts + useChart.ts → cmp-echarts
- sms-web 消费方改造：`package.json` 加 4 个 `workspace:*`；`main.ts` 用 `registerCmpElement` + `registerCmpEcharts` + `configureAuth` + `configureRequest`；`vue.config.js` 加 `transpileDependencies: [/@ss-cmp\//]`；`tsconfig.json include` 扩 `../packages/*/src/**/*`

### Phase 3 — 浏览器验收 + 运行时修复（Task 12-13）
- 浏览器 smoke test 发现 2 个 runtime bug，commit `892418d` 修：
  - **Vue 多实例**（`null.ce` 崩溃，见 pitfall 39）→ webpack `resolve.alias` 强制 `vue$ / element-plus$ / @element-plus/icons-vue$` 单实例
  - 重复 `empty` 注册 warning → 删 `registerCmpElement` 末尾多余的 `app.component('empty', Empty)`
- commit `6a800e7`：memory 3 条 + `docs/migration/compat-layer.md` 章节
- merge `a0927ef` → develop → push origin develop + tag `before-workspace`

### Follow-up — A 档 port 真源码组件（commit `64739ac`，Task 14-17）
- 触发点：用户发现 README 写 "A 档升级" 但实际多是重新实现
- 审计 original/ 得到真源码清单：cmp-element 3 个 + cmp-graph 5 个
- cmp-element port：CodeMirror / FullScreen / JsonView + fullScreenUtils.ts（加 codemirror@^5.65 dep）
- cmp-graph port：Editor / ContextMenu / MiniMap / Toolbar / ToolbarSimple + fonts/iconfont.*
- CodeMirror / FullScreen / JsonView 从 `COMPONENTS` 注册表移除，仅保留 named export（避免 sms-web 无谓 bundle codemirror ~200KB）
- sms-web build 验证：7.4 MB vs baseline 7.1 MB（+4.2% within ±5%），hash `58959a06feb18a3c`

## 浏览器验证过的 vs 未验证的

| 类别 | 验证级别 | 备注 |
|------|---------|------|
| Phase 2 sms-web qiankun 挂载 + smoke test | ✅ 浏览器验收通过 | 用户 2026-04-22 确认"显示无误" |
| Follow-up cmp-element 3 个 A 档 port | ✅ **runtime 验证通过**（2026-04-24） | sms-web `/dev/compat-smoke-test` 逐个"启用"渲染 OK |
| Follow-up cmp-graph 5 个 A 档 port | ✅ **runtime 验证通过**（2026-04-24） | @antv/g6-editor@1.2.0 × Vue 3 实测兼容，canvas 正常起 |

### 2026-04-24 smoke test 结论

- **CodeMirror / JsonView / FullScreen** 都能正常实例化和响应。
- **Editor (cmp-graph)**：g6-editor 在 Vue 3 下 `new G6Editor()` / `new G6Editor.Flow({ container: 'page' })` 正常工作，canvas 渲染到 `#page` 容器。没接 `addPanel()` 和数据，所以没节点；不是 bug。
- **ContextMenu**：`<style>` 不是 scoped，`#Contextmenu { display: none }` 是原版设计（g6-editor 右键时 DOM 切换显示），smoke test 里 "点启用按钮看不到" 是正常。
- **Toolbar / MiniMap / ToolbarSimple**：都能渲染。
- **iconfont 路径**：Editor.vue scoped style `@import './fonts/iconfont.css'` 在 webpack 下解析正常，**未复现 404 / 字体缺失**（之前的风险预警 overcautious）。

### smoke test 组件与路由

- `sms-web/src/views/dev/CompatSmokeTest.vue` — 8 组件逐个启用
- 路由：`/dev/compat-smoke-test`（constant.ts 常量路由 + permission.ts whitelist）
- sms-web package.json 新增 `@ss-cmp/cmp-graph: workspace:*`（只为 smoke test；cmp-web 启动时 cmp-web 自身加依赖即可）
- **保留这个 dev 路由**作为未来所有 workspace 组件改动后的回归测试入口

### 不再需要做的工作

原先"Phase 4 cmp-web 启动前必须先跑 smoke test 的组件"这一节已完成，下面保留作为历史记录。

**cmp-element（风险中）**：
- `CodeMirror.vue` — codemirror@5 + Vue 3 watch/reactivity 交互；`onBeforeUnmount` 里 `editor.toTextArea()` 释放
- `JsonView.vue` — 同上 + deep watch 对象类 value 的序列化
- `FullScreen.vue` — defineExpose 的 toggle / enter / exit 方法通过父组件 template ref 调用

**cmp-graph（风险高）**：
- `Editor.vue` — `new G6Editor.Flow({ graph: { container: 'page', ... } })` 挂载点 `#page` 必须父模板提供；`defineExpose` 暴露 `save / addPanel / changeEdge / changeZoom / update / nodeHasBeenLinked`。`@antv/g6-editor@^1.2.0` 是 2018 年 Vue 2 时代包，**Vue 3 下未验证**
- `Toolbar.vue` / `MiniMap.vue` — Element Plus 2.7 的 `el-radio size="small"` / `el-radio value="x"`（原 `label="x"` 已废）；`el-slider @change` 回调 `number | number[]`
- `ContextMenu.vue` / `ToolbarSimple.vue` — 纯模板，g6-editor 通过 `data-status / data-command` DOM 查询
- **iconfont 路径风险**：Editor.vue scoped style 里 `@import './fonts/iconfont.css'`。webpack 在 scoped style 下解析相对路径常有坑，**到时候很可能 404 / 字体不显示**；若出问题改 `@import '@ss-cmp/cmp-graph/src/fonts/iconfont.css';` 或预加载到全局

## 关键设计决策（follow-up 时再考虑）

1. **stub 文件兼容层**：sms-web `src/common/utils/{auth,crypto,day,request,resolvePath,uploadFile}.ts` 留了 re-export stub，保留 `utils/*` alias 的 60+ 业务 import 不动。cmp-web 迁移时**直接 `from '@ss-cmp/utils'`**，不要再走 stub。stub 层可以在所有子应用迁完后统一删
2. **CSS 令牌引入**：用 `@import '@ss-cmp/design-tokens/src/tokens.scss';`（**不能用 `@use`**，与 `vue.config.js` additionalData 冲突 —— pitfall 40）
3. **vue 单实例 alias**：所有引用 `@ss-cmp/cmp-*` 的子应用 vue.config.js 必须加 `resolve.alias { vue$, element-plus$, @element-plus/icons-vue$ }`（pitfall 39）
4. **CodeMirror / JsonView / FullScreen 要用时 explicit import**：不在 `registerCmpElement` 全局注册表内，避免 codemirror 被强制打入不用它们的子应用 bundle
5. **packages/cmp-socket 不建**：CLAUDE.md 说 cmp-socket 保持 B 档不升级，直接用原包

## 回滚手段

- `git reset --hard before-workspace`（tag 已推 origin）—— 回到 Phase 0 起点
- 或 `git revert <merge-commit a0927ef>` + `git revert 64739ac` —— 只撤 workspace 提交，保留其他工作

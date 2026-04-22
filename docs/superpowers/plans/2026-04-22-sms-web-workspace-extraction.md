# sms-web Workspace Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 sms-web 的 `src/common/compat/` + `src/common/utils/` 抽成 pnpm workspace 下 4 个 `@ss-cmp/*` 公共包，仓库转为 workspace 结构；sms-web 通过 workspace 引用这些包继续工作；为 cmp-web / cms-web / cos-web 后续迁移铺路。

**Architecture:** 仓库根引入 pnpm workspace（`pnpm-workspace.yaml` + root `package.json` + `.npmrc`）。packages/ 下建 6 个目录：design-tokens / utils / cmp-element / cmp-echarts / cmp-topology / cmp-graph（Phase 2 只填充前 4 个；cmp-topology / cmp-graph 保留空骨架给 Phase 4 cmp-web 填）。sms-web 改为 `workspace:*` 引用，原 `src/common/compat/` 删除。

**Tech Stack:** pnpm@9 workspace / Vue 3.4 / Element Plus 2.7 / echarts 5.5 / TypeScript 5.4 / Vue CLI 5 (webpack 5) / SCSS with @use

**Scope:** 本 plan 覆盖 spec 的 Phase 0-3（`docs/superpowers/specs/2026-04-22-common-compat-workspace-design.md`）。Phase 4+ (cmp-web / cms-web / cos-web / npm publish) 超出本 plan。

---

## 前置要求

- 当前分支 develop @ `1993cbd` 或更新（spec 已 push）
- sms-web Phase D 已完成（migration 已合并入 develop）
- `original/` 目录下 6 个自研包源码就绪（user 已放）
- 本地可 `pnpm --filter sms-web build` 成功（Phase 0 先验）

---

## Task 1: Phase 0 — 准备分支 + 打 tag + 记录基线

**Files:**
- 无文件变更（git 元操作）

- [ ] **Step 1: 确认当前在 develop 且工作树干净**

```bash
git status --short
git branch --show-current
```
Expected: working tree 干净（只有 `.claude/scheduled_tasks.lock` / `.tgitconfig` 未跟踪），branch = develop

- [ ] **Step 2: 记录 sms-web build 基线（Phase 3 对比用）**

```bash
cd sms-web && npx vue-cli-service build
du -sh sms-web/ | tee /tmp/phase0-sms-web-size.txt
cd ..
```
Expected: build 通过；`sms-web/` 目录体积记录到 `/tmp/phase0-sms-web-size.txt`

- [ ] **Step 3: 打回滚 tag**

```bash
git tag before-workspace
git tag --list | grep before-workspace
```
Expected: 输出 `before-workspace`

- [ ] **Step 4: 从 develop 切出 chore 分支**

```bash
git checkout -b chore/introduce-workspace
git branch --show-current
```
Expected: `chore/introduce-workspace`

- [ ] **Step 5: 本 task 不产生 commit（纯准备）**

---

## Task 2: Phase 1.a — 创建 root workspace 配置文件

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`（root）
- Create: `.npmrc`

- [ ] **Step 1: 创建 `pnpm-workspace.yaml`**

File content:
```yaml
packages:
  - 'packages/*'
  - 'main-web'
  - 'scr-web'
  - 'sms-web'
  - 'cmp-web'
  - 'cms-web'
  - 'cos-web'
  - 'cop-web'
```

- [ ] **Step 2: 创建 root `package.json`**

File content:
```json
{
  "name": "ss-harness-cmp",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev:sms": "pnpm --filter sms-web serve",
    "build:sms": "pnpm --filter sms-web build",
    "lint:sms": "pnpm --filter sms-web lint"
  },
  "devDependencies": {
    "typescript": "~5.4.0"
  }
}
```

- [ ] **Step 3: 创建 `.npmrc`**

File content:
```
shared-workspace-lockfile=false
auto-install-peers=true
```

- [ ] **Step 4: 从 root 跑 pnpm install 首次验证**

```bash
pnpm install
```
Expected: 安装成功；产生 root `pnpm-lock.yaml`（新）+ 各子应用 lockfile 保持独立

- [ ] **Step 5: 验证 sms-web 独立 install 不破**

```bash
cd sms-web && pnpm install && cd ..
```
Expected: 安装成功；`sms-web/pnpm-lock.yaml` 和 commit 前对比只有 `packageManager` 等小变化

- [ ] **Step 6: 验证 sms-web build 未受影响**

```bash
cd sms-web && npx vue-cli-service build && cd ..
```
Expected: build 通过，产物体积 ±5% within baseline

---

## Task 3: Phase 1.b — 创建 6 个空 packages/ 骨架

**Files:**
- Create: `packages/design-tokens/{package.json,README.md,src/index.ts}`
- Create: `packages/utils/{package.json,README.md,src/index.ts}`
- Create: `packages/cmp-element/{package.json,README.md,src/index.ts}`
- Create: `packages/cmp-echarts/{package.json,README.md,src/index.ts}`
- Create: `packages/cmp-topology/{package.json,README.md,src/index.ts}`
- Create: `packages/cmp-graph/{package.json,README.md,src/index.ts}`

- [ ] **Step 1: 创建 `packages/design-tokens/package.json`**

File content:
```json
{
  "name": "@ss-cmp/design-tokens",
  "version": "0.1.0",
  "description": "Design tokens (SCSS variables + Element Plus CSS var overrides) for ss-harness-cmp sub-apps",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./src/*": "./src/*"
  },
  "files": ["src"],
  "private": true
}
```

- [ ] **Step 2: 创建 `packages/design-tokens/src/index.ts`（stub）**

File content:
```ts
// SCSS 变量见 ./tokens.scss，Element Plus CSS 覆盖见 ./element-plus.scss
// Phase 2 会从 sms-web 搬入实际内容
export const accent = '#2563eb'
export const bgSurface = '#ffffff'
```

- [ ] **Step 3: 创建 `packages/design-tokens/README.md`**

File content:
```markdown
# @ss-cmp/design-tokens

设计令牌：SCSS 变量 + Element Plus CSS 变量覆盖。

## 使用

```scss
@import '@ss-cmp/design-tokens/src/element-plus.scss';
@use   '@ss-cmp/design-tokens/src/tokens.scss' as *;

.foo { color: $accent; }
```

## 覆盖清单（Phase 2 后填）

- [ ] Phase 2: 从 sms-web/src/common/compat/tokens.scss 搬入
- [ ] Phase 2: 抽出 Element Plus CSS 变量覆盖到 element-plus.scss
```

- [ ] **Step 4: 创建 `packages/utils/package.json`**

File content:
```json
{
  "name": "@ss-cmp/utils",
  "version": "0.1.0",
  "description": "Shared utility functions (request / crypto / day / auth / resolvePath)",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "files": ["src"],
  "private": true,
  "dependencies": {
    "axios": "^1.7.0",
    "crypto-js": "^4.2.0",
    "dayjs": "^1.11.0",
    "js-cookie": "^3.0.5"
  }
}
```

- [ ] **Step 5: 创建 `packages/utils/src/index.ts`（stub）**

File content:
```ts
// Phase 2 从 sms-web/src/common/utils/ 搬入实际实现
export {}
```

- [ ] **Step 6: 创建 `packages/utils/README.md`**

File content:
```markdown
# @ss-cmp/utils

跨应用共享工具函数。纯 TS，无 Vue / DOM 依赖。

## 覆盖清单（Phase 2 后填）

- [ ] request.ts — axios 封装 + 拦截器
- [ ] crypto.ts — crypto-js 封装
- [ ] day.ts — dayjs 封装
- [ ] auth.ts — cookie 封装（getToken / setToken / removeToken）
- [ ] resolvePath.ts — 路径解析
- [ ] uploadFile.ts — 文件上传
```

- [ ] **Step 7: 创建 `packages/cmp-element/package.json`**

File content:
```json
{
  "name": "@ss-cmp/cmp-element",
  "version": "0.1.0",
  "description": "Vue 3 + Element Plus upgrade of cmp-element@1.0.0-5.6-release (A 档升级)",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./src/*": "./src/*"
  },
  "files": ["src"],
  "private": true,
  "dependencies": {
    "@ss-cmp/design-tokens": "workspace:*"
  },
  "peerDependencies": {
    "vue": "^3.4.0",
    "element-plus": "^2.7.0",
    "@element-plus/icons-vue": "^2.3.0"
  }
}
```

- [ ] **Step 8: 创建 `packages/cmp-element/src/index.ts`（stub）**

File content:
```ts
import type { App } from 'vue'

// Phase 2 从 sms-web/src/common/compat/ 搬入：
// BasicForm / BasicFormItem / BasicTable / AdvanceTable / TableSearch
// CommonDetail / CommonDetailItem / StatusIcon / SvgIcon / Empty
export function registerCmpElement(app: App): void {
  // no-op until Phase 2
  void app
}
```

- [ ] **Step 9: 创建 `packages/cmp-element/README.md`**

File content:
```markdown
# @ss-cmp/cmp-element

原 `cmp-element@1.0.0-5.6-release`（Vue 2 + ElementUI）的 Vue 3 + Element Plus 升级版（A 档）。

## 对齐清单（原版 16 个组件）

| 原 packages/ 路径 | 组件 | 状态 |
|------------------|------|------|
| basic-form/ | BasicForm, BasicFormItem | ⬜ Phase 2 |
| common-detail/ | CommonDetail, CommonDetailItem | ⬜ Phase 2 |
| common-detail/ | CommonDetailRight, DetailContent | ⬜ 按需补 |
| empty/ | Empty | ⬜ Phase 2 |
| layout/ | CardLayout, PageLayout | ⬜ 按需补 |
| smart-table/ | SmartTable | ⬜ 对照原版重做 |
| status-icon/ | StatusIcon | ⬜ Phase 2 |
| svg-icon/ | SvgIcon | ⬜ Phase 2 |
| table/ | BasicTable, AdvanceTable, AdvanceTableColumn | ⬜ Phase 2（不含 Column） |
| table-search/ | TableSearch | ⬜ Phase 2 |
| components/code-mirror/ | CodeMirror | ⬜ 按需补 |
| components/full-screen/ | FullScreen | ⬜ 按需补 |
| components/json-view/ | JsonView | ⬜ 按需补 |

Ground truth: `original/cmp-element/` 源码（部分 .vue + lib/common.js webpack concat 反编译）。

## 与原版差异

Phase 2 完成后填。
```

- [ ] **Step 10: 创建 `packages/cmp-echarts/package.json`**

File content:
```json
{
  "name": "@ss-cmp/cmp-echarts",
  "version": "0.1.0",
  "description": "Vue 3 + echarts 5 upgrade of cmp-echarts@2.0.0-5.6-release (A 档升级)",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./src/*": "./src/*"
  },
  "files": ["src"],
  "private": true,
  "dependencies": {
    "@ss-cmp/design-tokens": "workspace:*",
    "echarts": "^5.5.0",
    "echarts-liquidfill": "^3.1.0"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

- [ ] **Step 11: 创建 `packages/cmp-echarts/src/index.ts`（stub）**

File content:
```ts
import type { App } from 'vue'

// Phase 2 搬入：BarCharts / BarReverseCharts / LineCharts / PieCharts /
// GaugeCharts / LiquidFillCharts + LoopCharts 别名 + useChart
export function registerCmpEcharts(app: App): void {
  void app
}
```

- [ ] **Step 12: 创建 `packages/cmp-echarts/README.md`**

File content:
```markdown
# @ss-cmp/cmp-echarts

原 `cmp-echarts@2.0.0-5.6-release` 的 Vue 3 + echarts v5 升级版（A 档）。

## 对齐清单

| 原路径 | 组件 | 状态 |
|--------|------|------|
| bar-charts/ | BarCharts | ⬜ Phase 2 |
| bar-reverse-charts/ | BarReverseCharts | ⬜ Phase 2 |
| line-charts/ | LineCharts | ⬜ Phase 2 |
| pie-charts/ | PieCharts | ⬜ Phase 2 |
| gauge-charts/ | GaugeCharts | ⬜ Phase 2 |
| liquid-fill-charts/ | LiquidFillCharts | ⬜ Phase 2 |
| loop-charts/ | LoopCharts | ⚠️ 对照原版确认；sms-web 当前别名到 PieCharts |
| graph-charts/ | GraphCharts | ⬜ 按需补 |

Ground truth: `original/cmp-echarts/hooks/` (useChart / 主题) + `lib/common.js`。
```

- [ ] **Step 13: 创建 `packages/cmp-topology/package.json`（骨架，Phase 4 填）**

File content:
```json
{
  "name": "@ss-cmp/cmp-topology",
  "version": "0.1.0",
  "description": "Vue 3 upgrade of cmp-topology@1.0.0 (G6 v3 based graph wrapper; Phase 4 will populate)",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./src/*": "./src/*"
  },
  "files": ["src"],
  "private": true,
  "dependencies": {
    "@ss-cmp/design-tokens": "workspace:*",
    "@antv/g6": "^3.5.12"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

- [ ] **Step 14: 创建 `packages/cmp-topology/src/index.ts`（stub）**

File content:
```ts
import type { App } from 'vue'

// Phase 4 cmp-web 迁移期填：Graph, TreeGraph + config + registerDefault
export function registerCmpTopology(app: App): void {
  void app
}
```

- [ ] **Step 15: 创建 `packages/cmp-topology/README.md`**

File content:
```markdown
# @ss-cmp/cmp-topology

原 `cmp-topology@1.0.0` 的 Vue 3 升级（A 档）。保持 `@antv/g6@^3.5`，不升级到 G6 v4/v5。

## 对齐清单

| 原 packages/graph/ | 模块 | 状态 |
|-------------------|------|------|
| Graph.vue | Graph（通用关系图） | ⬜ Phase 4 |
| TreeGraph.vue | TreeGraph（树形图） | ⬜ Phase 4 |
| config.js | 默认节点/边样式 | ⬜ Phase 4 |
| registerDefault.js | G6 自定义节点/边注册 | ⬜ Phase 4 |

Ground truth: `original/cmp-topology/lib/cmp-topology.common.js`（webpack concat 反编译）。
```

- [ ] **Step 16: 创建 `packages/cmp-graph/package.json`（骨架，Phase 4 填）**

File content:
```json
{
  "name": "@ss-cmp/cmp-graph",
  "version": "0.1.0",
  "description": "Vue 3 upgrade of cmp-graph@1.0.0 (g6-editor based; Phase 4 will populate)",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./src/*": "./src/*"
  },
  "files": ["src"],
  "private": true,
  "dependencies": {
    "@ss-cmp/design-tokens": "workspace:*",
    "@antv/g6-editor": "^1.2.0"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

- [ ] **Step 17: 创建 `packages/cmp-graph/src/index.ts`（stub）**

File content:
```ts
import type { App } from 'vue'

// Phase 4 cmp-web 迁移期填：ContextMenu / Editor / MiniMap / Toolbar / ToolbarSimple
export function registerCmpGraph(app: App): void {
  void app
}
```

- [ ] **Step 18: 创建 `packages/cmp-graph/README.md`**

File content:
```markdown
# @ss-cmp/cmp-graph

原 `cmp-graph@1.0.0`（@antv/g6-editor 老版图编辑器壳）的 Vue 3 升级（A 档）。保留 `@antv/g6-editor@^1.2.0`，不升级图库。

## 对齐清单

| 原 src/components/ | 组件 | 状态 |
|-------------------|------|------|
| ContextMenu.vue | 右键菜单 | ⬜ Phase 4 |
| Editor.vue | 编辑器壳 | ⬜ Phase 4 |
| MiniMap.vue | 缩略图 | ⬜ Phase 4 |
| Toolbar.vue | 工具栏 | ⬜ Phase 4 |
| ToolbarSimple.vue | 精简工具栏 | ⬜ Phase 4 |

Ground truth: `original/cmp-graph/src/components/` (完整源码)。
```

- [ ] **Step 19: pnpm install 连通 workspace 包**

```bash
pnpm install
```
Expected: packages/* 被识别为 workspace 成员；生成根 `pnpm-lock.yaml`

- [ ] **Step 20: 验证 workspace 链接生效**

```bash
ls sms-web/node_modules/@ss-cmp 2>&1 || echo "not linked yet (normal — sms-web 还没声明 @ss-cmp/* 依赖)"
```
Expected: 输出 "not linked yet" —— sms-web 此 Task 没改依赖，Task 9 才关联

---

## Task 4: Phase 1 验收 + commit

**Files:**
- 无新文件（本 task 只验证前两个 task 的成果）

- [ ] **Step 1: eslint sms-web 通过**

```bash
cd sms-web && npx eslint src/ --ext .ts,.vue && cd ..
```
Expected: 0 errors

- [ ] **Step 2: sms-web build 通过（体积对比基线）**

```bash
cd sms-web && npx vue-cli-service build && du -sh sms-web/ && cd ..
cat /tmp/phase0-sms-web-size.txt
```
Expected: build 通过；体积与 Phase 0 基线接近（±5%）

- [ ] **Step 3: 查看 git status 确认只有新增文件**

```bash
git status --short
```
Expected: 列表内容限于：
- `?? package.json`
- `?? pnpm-workspace.yaml`
- `?? .npmrc`
- `?? packages/`
- `?? pnpm-lock.yaml`（root 新生成）
- 可能有 `M` 各子应用 `pnpm-lock.yaml`（pnpm 可能重算哈希）

- [ ] **Step 4: stage 新文件**

```bash
git add package.json pnpm-workspace.yaml .npmrc packages/ pnpm-lock.yaml
git add sms-web/pnpm-lock.yaml main-web/pnpm-lock.yaml cmp-web/pnpm-lock.yaml cms-web/pnpm-lock.yaml cos-web/pnpm-lock.yaml scr-web/pnpm-lock.yaml 2>/dev/null || true
git status --short
```
Expected: 以上列表全部 `A` 或 `M`；无 unstaged

- [ ] **Step 5: commit Phase 1**

```bash
git commit -m "chore(workspace): introduce pnpm workspace scaffold (empty packages)

Phase 1 of docs/superpowers/specs/2026-04-22-common-compat-workspace-design.md.

Add root pnpm-workspace.yaml + package.json + .npmrc; create 6 empty
package scaffolds under packages/:
- design-tokens, utils: new abstractions
- cmp-element, cmp-echarts: A-档 upgrades (Phase 2 populate from sms-web)
- cmp-topology, cmp-graph: A-档 upgrades (Phase 4 populate during cmp-web)

sms-web unchanged (verified build parity with Phase 0 baseline).
cmp-socket stays as original (B-档).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```
Expected: commit 成功

- [ ] **Step 6: 验证 sms-web 依然正常（不重启也能 dev）**

```bash
cd sms-web && npx vue-cli-service build && cd ..
```
Expected: 通过

---

## Task 5: Phase 2.a — 抽 design-tokens 包

**Files:**
- Git move: `sms-web/src/common/compat/tokens.scss` → `packages/design-tokens/src/tokens.scss`
- Create: `packages/design-tokens/src/element-plus.scss`
- Modify: `packages/design-tokens/src/index.ts`

- [ ] **Step 1: 阅读原 tokens.scss 内容**

```bash
cat sms-web/src/common/compat/tokens.scss | head -30
```
Expected: 看到 `$bg-page`, `$accent`, `$font-body` 等定义

- [ ] **Step 2: 用 git mv 搬到 packages**

```bash
git mv sms-web/src/common/compat/tokens.scss packages/design-tokens/src/tokens.scss
```
Expected: 无输出；`git status` 显示 rename

- [ ] **Step 3: 查找 sms-web 里的 Element Plus CSS 变量覆盖（:root 块）**

```bash
grep -rn "\-\-el-color-primary\|\-\-el-component-size" sms-web/src --include="*.scss" --include="*.vue" | head -10
```
Expected: 至少一处（通常在 main.ts 或 common/css/ 下）

- [ ] **Step 4: 创建 `packages/design-tokens/src/element-plus.scss`**

把 Step 3 找到的 :root 覆盖搬入。若找不到，用下面默认值（对齐 sms-web 设计）：

File content:
```scss
@use './tokens.scss' as *;

:root {
  --el-component-size: 32px;
  --el-color-primary: #{$accent};
  --el-color-primary-light-3: #{$accent-hover};
  --el-border-color: #{$border-hairline};
  --el-border-color-hover: #{$border-solid};
  --el-text-color-primary: #{$text-primary};
  --el-text-color-regular: #{$text-secondary};
  --el-text-color-secondary: #{$text-muted};
  --el-bg-color: #{$bg-surface};
  --el-bg-color-page: #{$bg-page};
  --el-font-family: #{$font-body};
}
```

- [ ] **Step 5: 更新 `packages/design-tokens/src/index.ts` 用 tokens 实际值**

```ts
// 仅导出 JS 可访问的常量（SCSS 用 @use ./tokens.scss 直接拿）
export const tokens = {
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  bgSurface: '#ffffff',
  bgSubtle: '#f1f4f8',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8'
} as const

export type Tokens = typeof tokens
```

- [ ] **Step 6: 更新 README 标记完成**

在 `packages/design-tokens/README.md` 覆盖清单把两条改为 `[x]`：
```markdown
- [x] Phase 2: 从 sms-web/src/common/compat/tokens.scss 搬入
- [x] Phase 2: 抽出 Element Plus CSS 变量覆盖到 element-plus.scss
```

- [ ] **Step 7: 本 task 不 commit，延到 Task 11 原子提交**

---

## Task 6: Phase 2.b — 抽 utils 包

**Files:**
- Git move: `sms-web/src/common/utils/{auth,crypto,day,request,resolvePath,uploadFile}.ts` → `packages/utils/src/`
- Modify: `packages/utils/src/index.ts`

- [ ] **Step 1: 列出 sms-web 当前 utils 文件**

```bash
ls sms-web/src/common/utils/
```
Expected: 至少 `auth.ts crypto.ts day.ts index.ts request.ts resolvePath.ts uploadFile.ts autoImport.ts`（具体以实际为准）

- [ ] **Step 2: 用 git mv 搬运（autoImport.ts 和 index.ts 留在 sms-web，因其可能引用 sms-web 特定内容）**

```bash
git mv sms-web/src/common/utils/auth.ts packages/utils/src/auth.ts
git mv sms-web/src/common/utils/crypto.ts packages/utils/src/crypto.ts
git mv sms-web/src/common/utils/day.ts packages/utils/src/day.ts
git mv sms-web/src/common/utils/request.ts packages/utils/src/request.ts
git mv sms-web/src/common/utils/resolvePath.ts packages/utils/src/resolvePath.ts
git mv sms-web/src/common/utils/uploadFile.ts packages/utils/src/uploadFile.ts
```
Expected: 每条 0 输出

- [ ] **Step 3: 检查是否有 `import` sms-web 特定路径**

```bash
grep -rn "from ['\"]@/\|from ['\"]\.\./\.\./" packages/utils/src/ 2>&1
```
Expected: 空输出。如非空，需把被引用的模块也搬 / 或改为包内相对路径 / 或 peerDep

- [ ] **Step 4: 更新 `packages/utils/src/index.ts` 统一导出**

File content:
```ts
export * from './auth'
export * from './crypto'
export * from './day'
export * from './request'
export * from './resolvePath'
export * from './uploadFile'
```

- [ ] **Step 5: 更新 README 标记完成**

在 `packages/utils/README.md` 覆盖清单全部 `[x]`。

- [ ] **Step 6: 本 task 不 commit，延到 Task 11**

---

## Task 7: Phase 2.c — 抽 cmp-element 包

**Files:**
- Git move: sms-web 10 个 UI 组件 → `packages/cmp-element/src/`
- Modify: `packages/cmp-element/src/index.ts`

- [ ] **Step 1: 列出 sms-web 当前 compat 下的 UI 组件**

```bash
ls sms-web/src/common/compat/*.vue | grep -v Charts
```
Expected: 10 个 .vue：BasicForm, BasicFormItem, BasicTable, AdvanceTable, TableSearch, CommonDetail, CommonDetailItem, StatusIcon, SvgIcon, Empty

- [ ] **Step 2: git mv 10 个 UI 组件**

```bash
for f in BasicForm BasicFormItem BasicTable AdvanceTable TableSearch CommonDetail CommonDetailItem StatusIcon SvgIcon Empty; do
  git mv sms-web/src/common/compat/${f}.vue packages/cmp-element/src/${f}.vue
done
```
Expected: 10 个文件 move 成功

- [ ] **Step 3: 检查每个组件里的 `@import './tokens'` 路径**

```bash
grep -rn "@import ['\"]\./tokens" packages/cmp-element/src/
```
Expected: 若组件 scoped style 引了 tokens，改为：`@use '@ss-cmp/design-tokens/src/tokens.scss' as *;`

- [ ] **Step 4: 批量改 `@import './tokens'` → `@use '@ss-cmp/design-tokens/src/tokens.scss' as *`**

用 sed 批量替换（Windows bash 也支持）：
```bash
find packages/cmp-element/src -name "*.vue" -exec sed -i "s|@import ['\"]./tokens['\"];|@use '@ss-cmp/design-tokens/src/tokens.scss' as *;|g" {} \;
grep -rn "@import.*tokens" packages/cmp-element/src/ 2>&1 || echo "all replaced"
```
Expected: 输出 `all replaced`

- [ ] **Step 5: 检查组件内 import 是否有跨包相对路径问题**

```bash
grep -rn "from ['\"]\.\./\.\.\|from ['\"]@/" packages/cmp-element/src/ 2>&1 | head -10
```
Expected: 空或只有包内相对 import。若有跨 sms-web 引用需单独处理（多数没有，因为 compat 已是自给自足）

- [ ] **Step 6: 写 `packages/cmp-element/src/index.ts`**

File content:
```ts
import type { App } from 'vue'
import BasicForm from './BasicForm.vue'
import BasicFormItem from './BasicFormItem.vue'
import BasicTable from './BasicTable.vue'
import AdvanceTable from './AdvanceTable.vue'
import TableSearch from './TableSearch.vue'
import CommonDetail from './CommonDetail.vue'
import CommonDetailItem from './CommonDetailItem.vue'
import StatusIcon from './StatusIcon.vue'
import SvgIcon from './SvgIcon.vue'
import Empty from './Empty.vue'

export {
  BasicForm,
  BasicFormItem,
  BasicTable,
  AdvanceTable,
  TableSearch,
  CommonDetail,
  CommonDetailItem,
  StatusIcon,
  SvgIcon,
  Empty
}

const COMPONENTS = {
  BasicForm,
  BasicFormItem,
  BasicTable,
  AdvanceTable,
  SmartTable: AdvanceTable,
  TableSearch,
  CommonDetail,
  CommonDetailRight: CommonDetail,
  CommonDetailItem,
  StatusIcon,
  SvgIcon,
  Icon: SvgIcon,
  Empty
} as const

function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/^([A-Z])/, (_, c: string) => c.toLowerCase())
    .toLowerCase()
}

export function registerCmpElement(app: App): void {
  for (const [name, comp] of Object.entries(COMPONENTS)) {
    app.component(name, comp)
    app.component(toKebab(name), comp)
  }
  // 历史兼容：'empty' 小写
  app.component('empty', Empty)
}
```

- [ ] **Step 7: 更新 README 覆盖清单**

在 `packages/cmp-element/README.md` 把已搬入的 10 个组件状态改为 `[x]`。

- [ ] **Step 8: 本 task 不 commit**

---

## Task 8: Phase 2.d — 抽 cmp-echarts 包

**Files:**
- Git move: `sms-web/src/common/compat/{BarCharts,BarReverseCharts,LineCharts,PieCharts,GaugeCharts,LiquidFillCharts}.vue` → `packages/cmp-echarts/src/`
- Git move: `sms-web/src/common/compat/useChart.ts` → `packages/cmp-echarts/src/useChart.ts`
- Modify: `packages/cmp-echarts/src/index.ts`

- [ ] **Step 1: 列出 sms-web 当前图表组件**

```bash
ls sms-web/src/common/compat/*Charts.vue
ls sms-web/src/common/compat/useChart.ts
```
Expected: 6 个 *.Charts.vue + useChart.ts

- [ ] **Step 2: git mv 图表组件 + useChart**

```bash
git mv sms-web/src/common/compat/BarCharts.vue packages/cmp-echarts/src/BarCharts.vue
git mv sms-web/src/common/compat/BarReverseCharts.vue packages/cmp-echarts/src/BarReverseCharts.vue
git mv sms-web/src/common/compat/LineCharts.vue packages/cmp-echarts/src/LineCharts.vue
git mv sms-web/src/common/compat/PieCharts.vue packages/cmp-echarts/src/PieCharts.vue
git mv sms-web/src/common/compat/GaugeCharts.vue packages/cmp-echarts/src/GaugeCharts.vue
git mv sms-web/src/common/compat/LiquidFillCharts.vue packages/cmp-echarts/src/LiquidFillCharts.vue
git mv sms-web/src/common/compat/useChart.ts packages/cmp-echarts/src/useChart.ts
```
Expected: 7 次 0 输出

- [ ] **Step 3: 改 `@import './tokens'` → `@use '@ss-cmp/design-tokens/src/tokens.scss' as *`**

```bash
find packages/cmp-echarts/src -name "*.vue" -exec sed -i "s|@import ['\"]./tokens['\"];|@use '@ss-cmp/design-tokens/src/tokens.scss' as *;|g" {} \;
```

- [ ] **Step 4: 改 useChart.ts 里若有 `from './tokens'` 引用**

```bash
grep -rn "from ['\"]\.\./" packages/cmp-echarts/src/ | head -5
```
Expected: 若非空，按相对路径调整或 import from '@ss-cmp/design-tokens'

- [ ] **Step 5: 写 `packages/cmp-echarts/src/index.ts`**

File content:
```ts
import type { App } from 'vue'
import BarCharts from './BarCharts.vue'
import BarReverseCharts from './BarReverseCharts.vue'
import LineCharts from './LineCharts.vue'
import PieCharts from './PieCharts.vue'
import GaugeCharts from './GaugeCharts.vue'
import LiquidFillCharts from './LiquidFillCharts.vue'

export {
  BarCharts,
  BarReverseCharts,
  LineCharts,
  PieCharts,
  GaugeCharts,
  LiquidFillCharts
}
export { useChart } from './useChart'

const COMPONENTS = {
  BarCharts,
  BarReverseCharts,
  LineCharts,
  PieCharts,
  GaugeCharts,
  LiquidFillCharts,
  LoopCharts: PieCharts  // sms-web 别名，Phase 4 cmp-web 扫后如需独立实现再改
} as const

function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/^([A-Z])/, (_, c: string) => c.toLowerCase())
    .toLowerCase()
}

export function registerCmpEcharts(app: App): void {
  for (const [name, comp] of Object.entries(COMPONENTS)) {
    app.component(name, comp)
    app.component(toKebab(name), comp)
  }
}
```

- [ ] **Step 6: 更新 README 覆盖清单**

在 `packages/cmp-echarts/README.md` 把 6 个 `[x]`；LoopCharts 保持 ⚠️ 标注。

- [ ] **Step 7: 本 task 不 commit**

---

## Task 9: Phase 2.e — sms-web 消费方改造

**Files:**
- Modify: `sms-web/package.json`
- Modify: `sms-web/src/main.ts`
- Modify: `sms-web/vue.config.js`
- Modify: `sms-web/tsconfig.json`

- [ ] **Step 1: 更新 `sms-web/package.json` 加 workspace 依赖**

在 `dependencies` 块中加入（按字母序插入）：
```json
"@ss-cmp/design-tokens": "workspace:*",
"@ss-cmp/utils": "workspace:*",
"@ss-cmp/cmp-element": "workspace:*",
"@ss-cmp/cmp-echarts": "workspace:*",
```

- [ ] **Step 2: 改 `sms-web/src/main.ts` import**

先读现有 main.ts 找到注册 compat 的行：
```bash
grep -n "registerCompat\|common/compat" sms-web/src/main.ts
```

把原来的：
```ts
import { registerCompatComponents } from './common/compat'
// ...
registerCompatComponents(app)
```

改为：
```ts
import '@ss-cmp/design-tokens/src/element-plus.scss'
import { registerCmpElement } from '@ss-cmp/cmp-element'
import { registerCmpEcharts } from '@ss-cmp/cmp-echarts'
// ...
registerCmpElement(app)
registerCmpEcharts(app)
```

（具体 import 块的位置按现有 main.ts 结构合理插入。）

- [ ] **Step 3: 改 `sms-web/vue.config.js` 加 transpileDependencies**

先读当前文件：
```bash
cat sms-web/vue.config.js | head -20
```

预期看到形如 `module.exports = { publicPath, assetsDir: 'static', outputDir: 'sms-web', ... }`。

在 `publicPath,` 这一行之后插入：
```js
  transpileDependencies: [/@ss-cmp\//],
```

生成的文件应类似：
```js
module.exports = {
  publicPath,
  transpileDependencies: [/@ss-cmp\//],
  assetsDir: 'static',
  outputDir: 'sms-web',
  // ...
}
```

验证：
```bash
grep -n "transpileDependencies" sms-web/vue.config.js
```
Expected: 输出 `X: transpileDependencies: [/@ss-cmp\//],`

- [ ] **Step 4: 改 `sms-web/tsconfig.json` 扩 include**

找到 `"include": [...]` 数组，追加 `"../packages/*/src/**/*"`。若没有 include 字段，加入：
```json
"include": ["src/**/*", "src/**/*.vue", "../packages/*/src/**/*"]
```

- [ ] **Step 5: 本 task 不 commit**

---

## Task 10: Phase 2.f — 批量替换 sms-web 业务代码 import 路径

**Files:**
- Modify: 所有 `sms-web/src/**/*.ts` 和 `sms-web/src/**/*.vue` 中引用 `@/common/compat` 的行

- [ ] **Step 1: 定位所有直接 import 位置**

```bash
grep -rn "from ['\"]@/common/compat\|from ['\"]\.\./common/compat" sms-web/src --include="*.ts" --include="*.vue" | tee /tmp/compat-imports.txt
wc -l /tmp/compat-imports.txt
```
Expected: 列出若干行（通常 10-30 处）

- [ ] **Step 2: 分类—UI 组件 vs 图表**

```bash
cat /tmp/compat-imports.txt | grep -iE "Table|Form|Detail|Status|Svg|Empty" | tee /tmp/ui-imports.txt
cat /tmp/compat-imports.txt | grep -iE "Charts|useChart" | tee /tmp/chart-imports.txt
```
每个文件可能两类都有，需要分别处理。

- [ ] **Step 3: 批量替换 UI 组件 import（使用脚本或逐文件 sed）**

对每个 `/tmp/ui-imports.txt` 中的文件：
```bash
# 替换指向 cmp-element 的 import
sed -i 's|from [\"'"'"']@/common/compat[\"'"'"']|from "@ss-cmp/cmp-element"|g' <file>
sed -i 's|from [\"'"'"']\.\./common/compat[\"'"'"']|from "@ss-cmp/cmp-element"|g' <file>
```

对图表 import 同理改为 `@ss-cmp/cmp-echarts`。

- [ ] **Step 4: 批量替换 @/common/utils 引用**

```bash
grep -rn "from ['\"]@/common/utils/" sms-web/src --include="*.ts" --include="*.vue" > /tmp/utils-imports.txt
cat /tmp/utils-imports.txt | head -10
```
把 `from '@/common/utils/request'` 改为 `from '@ss-cmp/utils'`（或具体的 `/request` 子路径）。

策略：若每个文件只 import 一个 util，用 `import { request } from '@ss-cmp/utils'`（包已一次性导出所有）；若 import 多个，合并为一行。

- [ ] **Step 5: 批量改 SCSS @import './tokens' → @use**

```bash
find sms-web/src -name "*.vue" -exec sed -i "s|@import ['\"]@/common/compat/tokens['\"];|@use '@ss-cmp/design-tokens/src/tokens.scss' as *;|g" {} \;
find sms-web/src -name "*.scss" -exec sed -i "s|@import ['\"]@/common/compat/tokens['\"];|@use '@ss-cmp/design-tokens/src/tokens.scss' as *;|g" {} \;
```

- [ ] **Step 6: 检查替换残余**

```bash
grep -rn "@/common/compat\|@/common/utils/request\|@/common/utils/crypto\|@/common/utils/day\|@/common/utils/auth\|@/common/utils/resolvePath\|@/common/utils/uploadFile" sms-web/src --include="*.ts" --include="*.vue" 2>&1 | head -5
```
Expected: 空输出。如非空，逐条手动修正

- [ ] **Step 7: 删除空的 `sms-web/src/common/compat/` 目录（若已无文件）**

```bash
ls sms-web/src/common/compat/ 2>&1
```
如果返回 `ls: cannot access ...` 或 empty，跳过；否则检查剩余文件（应该只剩 `index.ts` 或 `tokens` 的 scss 残迹）：
```bash
rmdir sms-web/src/common/compat 2>&1 || git rm -r sms-web/src/common/compat/
```

---

## Task 11: Phase 2 — 原子提交

**Files:**
- 本 task 不产生新文件，只 stage + commit + install

- [ ] **Step 1: 在 sms-web 下跑 pnpm install（触发 workspace link 生效）**

```bash
pnpm --filter sms-web install
```
Expected: 安装成功；`sms-web/node_modules/@ss-cmp/` 出现 symlink 到 `packages/*`

- [ ] **Step 2: 验证 workspace 链接**

```bash
ls sms-web/node_modules/@ss-cmp/
```
Expected: `cmp-element  cmp-echarts  design-tokens  utils`（4 个 symlink）

- [ ] **Step 3: eslint 检查 sms-web + packages**

```bash
cd sms-web && npx eslint src/ --ext .ts,.vue 2>&1 | tail -5; cd ..
```
Expected: 0 errors

- [ ] **Step 4: vue-tsc 类型检查**

```bash
cd sms-web && npx vue-tsc --noEmit 2>&1 | tail -10; cd ..
```
Expected: 0 errors（可能有若干 warnings 属于迁移前遗留）

- [ ] **Step 5: sms-web build 通过**

```bash
cd sms-web && npx vue-cli-service build 2>&1 | tail -10; cd ..
```
Expected: "DONE Build complete"；产物体积 ±5% within Phase 0 baseline

- [ ] **Step 6: 查 git status 确认范围**

```bash
git status --short | head -50
```
Expected: 大量 `R` (rename) 指向 packages/ + `M` sms-web/{package.json, main.ts, vue.config.js, tsconfig.json, *.vue, *.scss}

- [ ] **Step 7: 原子 commit**

```bash
git add -A
git reset HEAD .claude/scheduled_tasks.lock .tgitconfig 2>/dev/null || true
git commit -m "feat(workspace): extract sms-web compat into @ss-cmp/* packages

Phase 2 of docs/superpowers/specs/2026-04-22-common-compat-workspace-design.md.

Move sms-web/src/common/compat/ and utils/ to packages/:
- tokens.scss → @ss-cmp/design-tokens
- 6 util .ts → @ss-cmp/utils
- 10 UI components → @ss-cmp/cmp-element
- 6 echarts components + useChart → @ss-cmp/cmp-echarts

sms-web consumer changes:
- package.json adds 4 workspace:* deps
- main.ts uses registerCmpElement + registerCmpEcharts
- vue.config.js adds transpileDependencies [/@ss-cmp\\//]
- tsconfig.json include extends to ../packages/*/src/**/*
- business imports grep-replaced: @/common/compat → @ss-cmp/cmp-*,
  @/common/utils/* → @ss-cmp/utils
- SCSS @import './tokens' → @use '@ss-cmp/design-tokens/src/tokens.scss'

cmp-socket unchanged (B 档). cmp-topology / cmp-graph packages stay as
empty scaffolds (Phase 4 will populate).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```
Expected: commit 成功

---

## Task 12: Phase 3 — sms-web 验收

**Files:**
- 本 task 不产生新文件，验证 Phase 2 commit 的正确性

- [ ] **Step 1: clean build 验证**

```bash
cd sms-web && rm -rf node_modules && cd ..
pnpm --filter sms-web install
cd sms-web && npx vue-cli-service build 2>&1 | tail -5
cd ..
```
Expected: clean install + build 通过

- [ ] **Step 2: bundle size vs Phase 0 baseline**

```bash
cd sms-web && du -sh sms-web/ | tee /tmp/phase3-sms-web-size.txt && cd ..
cat /tmp/phase0-sms-web-size.txt
cat /tmp/phase3-sms-web-size.txt
```
Expected: 差异 ±5%（typically <3% since 是 workspace link，不影响产物）

- [ ] **Step 3: 启动 sms-web dev server**

```bash
cd sms-web && npx vue-cli-service serve --port 8091 &
cd ..
# 等待启动
sleep 20
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8091/
```
Expected: HTTP 200

- [ ] **Step 4: 启动 main-web dev server（基座）**

需要先临时把 `main-web/public/config/app.json` 改成只有 sms-web + 8091 entry（同之前 Phase D 做过）：

```bash
cat > main-web/public/config/app.json <<EOF
{
    "deployAddress": "//localhost:60003/",
    "configs": [
        {
            "name": "sms-web",
            "entry": "//localhost:8091/"
        }
    ]
}
EOF

cd main-web && npx vite &
cd ..
sleep 15
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/
```
Expected: HTTP 200

- [ ] **Step 5: 浏览器手测（USER ACTION REQUIRED）**

打开 http://localhost:8080，跑 smoke test：
- [ ] 登录进入 sms-web 资源总览：页面渲染正常，图表（ECharts）展示
- [ ] 导航 → 租户管理 → 点名字进详情：CommonDetail 显示，列表隐藏；返回按钮工作
- [ ] 导航 → 日志 → 审计日志 → 点"归档记录"：对话框里 TableSearch 可搜索
- [ ] 导航 → 监控 → 任一子页面：各类图表正常
- [ ] Chrome DevTools console：无红色 error（可忽略 404 API 错误，若后端未起）

若任一不通过 → 回到 Task 11 调查，可能漏了 import 或 peerDep

- [ ] **Step 6: 关闭 dev servers，恢复 app.json**

```bash
# 关闭后台 node 进程（8080 + 8091 端口）
# PowerShell: Get-NetTCPConnection -LocalPort 8080,8091 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
# 或直接手动 Ctrl-C 各 terminal

# 恢复 app.json
git checkout HEAD -- main-web/public/config/app.json
```

- [ ] **Step 7: 本 task 不产生 commit（纯验收）**

---

## Task 13: Phase 3 收尾 — merge develop + 文档更新

**Files:**
- Modify: `.claude/memory/project_cmp_harness.md`
- Modify: `docs/migration/compat-layer.md`

- [ ] **Step 1: 更新 `.claude/memory/project_cmp_harness.md` 加 workspace 就绪说明**

在"关键约束"章节下追加一行：
```markdown
- **sms-web 已通过 pnpm workspace 引用 `@ss-cmp/*` 公共包**（2026-04-22，packages/ 下 4 个包就绪）
```

- [ ] **Step 2: 更新 `docs/migration/compat-layer.md` 加"workspace 章节"**

追加章节：
```markdown
---

## 2026-04-22 更新：迁至 pnpm workspace

sms-web Phase D 完成后，所有自研包兼容实现从 `sms-web/src/common/compat/` 抽到仓库根 `packages/` 下：

- `@ss-cmp/design-tokens` — 设计令牌
- `@ss-cmp/utils` — 工具函数
- `@ss-cmp/cmp-element` — Element Plus 组件兼容（原 cmp-element 的 Vue 3 升级版）
- `@ss-cmp/cmp-echarts` — ECharts 图表组件（原 cmp-echarts 的 Vue 3 升级版）
- `@ss-cmp/cmp-topology` / `@ss-cmp/cmp-graph` — 空骨架，Phase 4 cmp-web 迁移期填
- `cmp-socket` 保留原包（B 档）

cmp-web / cms-web / cos-web 迁移时：
1. package.json 加 workspace:* 依赖（参考 spec § 3）
2. vue.config.js 加 `transpileDependencies: [/@ss-cmp\//]`
3. tsconfig.json include `../packages/*/src/**/*`
4. main.ts 用 `registerCmpElement / registerCmpEcharts` 注册

详细设计见 [docs/superpowers/specs/2026-04-22-common-compat-workspace-design.md](../../superpowers/specs/2026-04-22-common-compat-workspace-design.md)。
```

- [ ] **Step 3: 在 chore 分支 commit 这两处 doc 改动**

```bash
git status --short
git add .claude/memory/project_cmp_harness.md docs/migration/compat-layer.md
git commit -m "docs: record workspace scaffold + sms-web migration in memory and compat-layer notes

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```
Expected: 1 commit 成功

- [ ] **Step 4: 切回 develop 并合并 chore/introduce-workspace**

```bash
git checkout develop
git merge chore/introduce-workspace --no-ff -m "merge: sms-web workspace extraction (Phase 0-3)"
```
Expected: merge 成功

- [ ] **Step 5: push develop**

```bash
git push origin develop
```
Expected: push 成功，`chore/introduce-workspace` commits 上 origin

- [ ] **Step 6: 可选：删除 feature 分支（保留也行）**

```bash
git branch -d chore/introduce-workspace
```

- [ ] **Step 7: 最终验证**

```bash
git log --oneline -3
git status --short
pnpm --filter sms-web build | tail -3
```
Expected: develop 顶端是 merge commit；working tree 干净；sms-web build 通过

---

## 完成后状态

- `origin/develop` 包含 Phase 0-3 所有变更
- sms-web 不再有 `src/common/compat/`，业务代码改用 `@ss-cmp/*`
- `packages/` 6 个包骨架就绪（4 个已填充 + 2 个 Phase 4 空占位）
- CLAUDE.md / memory / docs 同步说明 workspace 就绪
- 下一步迁移 cmp-web 时可直接 `pnpm add @ss-cmp/cmp-element ...`（见 spec § 4 Phase 4）

---

## 回滚

若 Task 5-11 中任何一步失败且无法快速修复：
```bash
git checkout develop
git branch -D chore/introduce-workspace
git tag -l | grep before-workspace  # 验证 tag 存在
# 若要彻底回到 tag 状态
# git reset --hard before-workspace && git push --force  # 危险，需用户确认
```

若 Task 13 merge 后发现 sms-web 有回归：
```bash
git revert <merge-commit>  # 反向 revert merge
git push origin develop
```

---

## 与 spec 的对应

- Task 1 → Phase 0
- Task 2-4 → Phase 1
- Task 5-11 → Phase 2
- Task 12 → Phase 3（验收）
- Task 13 → Phase 3（收尾）

Phase 4/5/6 超出本 plan，另开计划。

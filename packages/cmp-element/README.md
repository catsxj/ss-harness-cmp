# @ss-cmp/cmp-element

原 `cmp-element@1.0.0-5.6-release`（Vue 2 + ElementUI）的 Vue 3 替代包。混合模式：

- **API-兼容重新实现**（10 个主要组件）—— 原版无 `.vue` 源码（`lib/cmp-element.common.js` 压缩输出），sms-web Phase D 按业务用法 + 原 prop/slot/event API 在 Element Plus 上从头写
- **A 档升级**（3 个组件）—— 原版有完整 `.vue` 源码，直接 Vue 2 → Vue 3 + TypeScript port，行为保持一致

## 组件清单

| 组件 | 原路径 | 类别 | Ground truth |
|------|--------|------|--------------|
| BasicForm, BasicFormItem | `lib/cmp-element.common.js` basic-form/ | 重新实现 | 仅 bundled 输出 |
| BasicTable, AdvanceTable, SmartTable (alias) | `lib/cmp-element.common.js` table/ | 重新实现 | 仅 bundled 输出 |
| TableSearch | `lib/cmp-element.common.js` table-search/ | 重新实现 | 仅 bundled 输出 |
| CommonDetail, CommonDetailRight (alias), CommonDetailItem | `lib/cmp-element.common.js` common-detail/ | 重新实现 | 仅 bundled 输出 |
| StatusIcon | `lib/cmp-element.common.js` status-icon/ | 重新实现 | 仅 bundled 输出 |
| SvgIcon, Icon (alias) | `lib/cmp-element.common.js` svg-icon/ | 重新实现 | 仅 bundled 输出 |
| Empty | `lib/cmp-element.common.js` empty/ | 重新实现 | 仅 bundled 输出 |
| **CodeMirror** | `components/code-mirror/CodeMirror.vue` | **A 档 port** | Vue 2 options API → Vue 3 script setup |
| **FullScreen** | `components/full-screen/FullScreen.vue` + `utils.js` | **A 档 port** | Vue 2 → Vue 3；utils.js → fullScreenUtils.ts |
| **JsonView** | `components/json-view/JsonView.vue` | **A 档 port** | Vue 2 options API → Vue 3 script setup |

## 内部模块

- `validate.ts` — FormItemRule 预设（required / email / ip / mac / port 等），BasicFormItem 内部用。原为 sms-web `src/validate/index.ts`
- `fullScreenUtils.ts` — 全屏浏览器 API 的多厂商 polyfill（从 `original/cmp-element/components/full-screen/utils.js` port）

## 与原版差异

- BasicFormItem 原 `import rules from '@/validate'` 改为 `import validationPresets from './validate'`，变量重命名解决 Vue 3 `script setup` 作用域里组件 prop `rules` 和导入 `rules` 冲突（eslint vue/no-dupe-keys）
- A 档 port 的 3 个组件：原 `this.$refs` + `this.$emit` 改 Composition API `ref` + `emit`；`onBeforeUnmount` 补 editor.toTextArea() 防内存泄漏

## 原版尚未 port 的组件

这些 `original/cmp-element/` 下有源码但 sms-web 暂不用，按需再港：

- `layout/CardLayout, PageLayout`（只有 bundled 输出）
- `components/code-mirror` 相关 mode/theme 扩展

## 外部依赖

- `codemirror@^5.65` — CodeMirror / JsonView 依赖（保持 5.x，不升 6.x 因 API 破坏性）
- `element-plus / @element-plus/icons-vue / vue` — peerDep

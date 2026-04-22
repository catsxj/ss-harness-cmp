# @ss-cmp/cmp-element

原 `cmp-element@1.0.0-5.6-release`（Vue 2 + ElementUI）的 Vue 3 + Element Plus 升级版（A 档）。

## 对齐清单（原版 16 个组件）

| 原 packages/ 路径 | 组件 | 状态 |
|------------------|------|------|
| basic-form/ | BasicForm, BasicFormItem | ✅ Phase 2 |
| common-detail/ | CommonDetail, CommonDetailItem | ✅ Phase 2 |
| common-detail/ | CommonDetailRight, DetailContent | ⬜ CommonDetailRight 做 alias 到 CommonDetail |
| empty/ | Empty | ✅ Phase 2 |
| layout/ | CardLayout, PageLayout | ⬜ 按需补 |
| smart-table/ | SmartTable | ✅ Phase 2（alias 到 AdvanceTable） |
| status-icon/ | StatusIcon | ✅ Phase 2 |
| svg-icon/ | SvgIcon | ✅ Phase 2（SvgIcon + Icon alias） |
| table/ | BasicTable, AdvanceTable, AdvanceTableColumn | ✅ Phase 2（不含 Column） |
| table-search/ | TableSearch | ✅ Phase 2 |
| components/code-mirror/ | CodeMirror | ⬜ 按需补 |
| components/full-screen/ | FullScreen | ⬜ 按需补 |
| components/json-view/ | JsonView | ⬜ 按需补 |

Ground truth: `original/cmp-element/` 源码（部分 .vue + lib/common.js webpack concat 反编译）。

## 内部模块

- `validate.ts` — FormItemRule 预设（required/email/ip/mac/port 等），BasicFormItem 内部用。原为 sms-web `src/validate/index.ts`。

## 与原版差异

- BasicFormItem 原 `import rules from '@/validate'` 改为 `import validationPresets from './validate'`，变量重命名解决 Vue 3 `script setup` 作用域里组件 prop `rules` 和导入 `rules` 冲突（eslint vue/no-dupe-keys）。

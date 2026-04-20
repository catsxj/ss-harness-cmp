---
name: CMP Harness 升级项目
description: Vue2+ElementUI 微前端升级到 Vue3+Element Plus+TS 的大型项目，7 个应用，3046 个 .vue 文件
type: project
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
## 项目信息
- 仓库：github.com/catsxj/ss-harness-cmp
- 本地路径：D:\harnes-test\ss-harness-cmp
- 分支策略：main（基线）→ develop（迁移主分支）→ feature/* 切出迁移

## 应用清单
| 应用 | Vue版本 | .vue数 | 状态 |
|------|---------|--------|------|
| main-web | Vue 3 ✓ | 32 | 已完成，不需迁移 |
| scr-web | Vue 2 | 68 | 待迁移（试点） |
| sms-web | Vue 2 | 125 | 代码迁移完成 🟡（待 npm install + build + 浏览器验收）|
| cmp-web | Vue 2 | 521 | 待迁移 |
| cms-web | Vue 2 | 521 | 待迁移 |
| cos-web | Vue 2 | 567 | 待迁移 |
| csc-web | Vue 2 | 1,211 | **不迁移**，保持 Vue 2 |

## 关键约束
- 自研包（cmp-element/cmp-echarts/cmp-socket/cmp-graph/cmp-graph-editor/cmp-topology）**不可升级源码**
- cmp-element 基于 ElementUI，与 Element Plus 不兼容，需在 compat 层重新实现
- scr-web 和 csc-web 缺少 Qiankun lifecycle，需先补加
- 迁移完成标准 = 浏览器中所有功能正常运行，不只是编译通过

## 迁移顺序
scr-web → sms-web → cmp-web → cms-web → cos-web（csc-web 不迁移）

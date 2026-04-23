---
name: cmp-basic 样式基准参考（表格 / 表单 / 详情）
description: 2026-04-23 用户指定 @ss-cmp/cmp-element 的表格、表单、详情组件视觉以 original/cmp5.0/cmp-basic 为基准。存留关键色值/尺寸/选择器清单，避免下次改样式时重新 Explore。
type: reference
---

## 基准位置

`D:\harnes-test\ss-harness-cmp\original\cmp5.0\cmp-basic\src\`

- `components/basic-table` / `smart-table` / `tree-table` / `table-search` / `cmp-form` / `common-detail`
- `css/index.scss` · `theme.scss` · `common.scss` · `element-ui.scss` · `components/*.scss`

这是 Vue 2 + Element UI 2.x 时代的源码（2018 年，peerDep vue@^2.5）。比 `original/cmp-element/` 完整得多（后者只剩 3 个组件源）。

## 色卡 / 尺寸常量（Vue 3 workspace 要对齐的数值）

### 色彩

- 主色：`#1890ff`（高亮 / 激活） · `#409eff`（Element 蓝，logo-text 用）
- 表头背景：**`#F5F7FA`**
- 行 hover 底色：**`#EAF3FD`**（浅蓝，强视觉特征）
- 默认边框：`#DCDFE6` · `#e6e6e6` · `#dee5e7`
- 搜索框边框：`#ddd` · 按钮 ghost border：`#d9d9d9`
- 正文字色：`#333` · 辅助：`#666` · 弱化：`#98a6ad`
- 幽灵按钮 hover：字 + 边 → `#2b85e4`
- 返回链接：`#46abf1`
- 对话框头深色：`#21242e`
- 对话框底：`#F0F3FA`

### 排版 / 间距

- 基础字号：14px（html/body） · 分页统一 **12px**
- 表单项 `margin-bottom: 15px`（Element 默认 22px，被全局覆盖）
- FormItem label 默认 `label-width: 100px` / `label-position: right`
- FormItem label 启用 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`
- 搜索容器 `.search-container`：`padding: 15px; border: 1px solid #ddd; margin-bottom: 15px`；内 legend 绝对定位 `top: -10px; left: 15px; background: #fff; width: 78px`
- 搜索项宽度：`.search-item { width: 20% }`（5 项一行）
- 表格顶部仅 border-top 1px `#DCDFE6`（非完整边框）
- `.el-table .cell { white-space: nowrap }`（禁换行）
- 树表缩进单位：`.ms-tree-space { width: 18px; height: 14px; display: inline-block }`，展开动画 `slideInSelf 0.3s`
- 卡片：`box-shadow: none !important; border-radius: 0 !important`
- 菜单项高度：`48px`（非默认 40px）

### 按钮尺寸

- `.el-button--mini`: `padding: 4px 15px`
- `.el-button--small`: `padding: 0 16px; height: 32px; line-height: 32px`
- `.el-button--ghost`: `color: #666; border-color: #d9d9d9`；hover → `#2b85e4`

### CommonDetail 专属

- 根容器：`position: absolute; width: 100%; border: 1px solid #e6e6e6; background: #fff; z-index: 2`
- `.detail-header`: `height: 44px; line-height: 44px; padding: 0 20px; border-bottom: 1px solid #e6e6e6`
- `.detail-back`: `#46abf1` + `.line` 分隔线 `height: 20px; width: 1px; background: #b5b5b5`
- `.detail-table td`: `padding: 6px 8px; border: 1px solid #ddd; min-width: 85px`；`.title` 列 `width: 85px; font-weight: bold; font-size: 12px`
- `.detail-title`: `font-size: 14px; font-weight: 600; border-left: 3px solid #88B7E0; text-indent: 8px`
- logo-text: `font-size: 24px; font-weight: 600; color: #409eff; padding: 15px 0 25px`

## 表格关键行为样式

- BasicTable 表头强制 class：`header-cell-class-name="custom-header"` → 对应 `.custom-header { background: #F5F7FA; color: #333; border-bottom: 1px solid #DCDFE6 }`
- `.pagination-container`：`margin-top: 10px; text-align: right`；SmartTable 内用 `el-pagination small` + `layout="total,prev,pager,next"`（无 size 切换）
- TreeTable 操作列：宽 200px，前 2 项直显，后续进 dropdown「更多」；`.action-divider { width: 1px; background: #e8e8e8 }`

## Top 10 复刻优先级（对齐 @ss-cmp/cmp-element）

1. 表头背景 `#F5F7FA`
2. 行 hover `#EAF3FD`
3. 表格仅顶部边框 1px `#DCDFE6`
4. 表单项间距 15px（非 Element 默认 22px）
5. FormItem label 省略号截断
6. TableSearch 白底 + 1px `#ddd` 边框 + legend 绝对定位
7. ghost 按钮 `#666 / #d9d9d9`，hover `#2b85e4`
8. 分页字号统一 12px
9. 卡片去阴影 / 去圆角
10. 对话框头 `#21242e` 深色

## 使用建议

不要把 `cmp-basic` 的 SCSS 直接抄进 workspace —— 它里面有大量 Element UI 1.x 选择器（`.el-table__*` 等 Element UI 样式，部分 Element Plus 选择器已变）。对齐路线：

- 在 `@ss-cmp/design-tokens` 里加 `tokens.scss` 的 CMP 色卡 section（表头 bg / hover bg / 边框 / 字色等）
- 在 `@ss-cmp/cmp-element/src/styles/` 新增 `table.scss` / `form.scss` / `detail.scss`，写针对 Element Plus 选择器的覆盖
- 不要覆盖全局 Element Plus（污染面太大），用 `:deep()` 在组件 scope 内覆写

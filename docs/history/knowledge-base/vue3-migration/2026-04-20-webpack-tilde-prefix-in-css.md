# CSS url() 中 ~ 前缀在 Vite/新版 Webpack 下失效

## 问题描述

背景图片不显示，无报错但图片 404。

```scss
// 这行在 Vite 下无法解析
background: url('~assets/img/screen_bg.png') no-repeat;
```

## 原因分析

`~` 是 Webpack 的 css-loader 特有语法，表示从 node_modules 或别名路径解析。Vite 不支持此语法。新版 Webpack（css-loader v6+）也已弃用。

## 解决方案

```scss
// 改为 @ 别名（Vite 和 Webpack 都支持）
background: url('@/assets/img/screen_bg.png') no-repeat;
```

## 批量检查命令

```bash
grep -rn "url('~\|url(\"~" src/ --include="*.vue" --include="*.scss"
```

## 适用范围

- 所有在 CSS 中引用 assets 的组件
- Vite 项目必须修复，Vue CLI 项目建议同步修复（兼容性更好）

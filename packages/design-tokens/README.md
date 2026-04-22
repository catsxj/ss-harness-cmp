# @ss-cmp/design-tokens

设计令牌：SCSS 变量 + Element Plus CSS 变量覆盖。

## 使用

```scss
@import '@ss-cmp/design-tokens/src/element-plus.scss';
@use   '@ss-cmp/design-tokens/src/tokens.scss' as *;

.foo { color: $accent; }
```

## 覆盖清单

- [x] Phase 2: 从 sms-web/src/common/compat/tokens.scss 搬入（`git mv`，保留 history）
- [x] Phase 2: 从 sms-web/src/common/css/global-ui.scss 搬入为 element-plus.scss（含 Element Plus CSS 变量覆盖 + 32px 统一尺寸组件规则）

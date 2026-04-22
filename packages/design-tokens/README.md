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

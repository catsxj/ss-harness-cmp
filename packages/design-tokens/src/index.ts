// SCSS 令牌见 ./tokens.scss；Element Plus CSS 变量覆盖见 ./element-plus.scss
// 仅导出 JS 可访问的常量（SCSS 用 @use ./tokens.scss 直接拿）
export const tokens = {
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  accentSoft: '#eff6ff',
  bgPage: '#f7f8fa',
  bgSurface: '#ffffff',
  bgSubtle: '#f1f4f8',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  borderHairline: '#e4e7eb',
  borderSolid: '#cbd2da'
} as const

export type Tokens = typeof tokens

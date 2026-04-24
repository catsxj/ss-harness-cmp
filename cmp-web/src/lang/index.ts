import { createI18n } from 'vue-i18n'
// Element Plus 的 i18n locale 由 ElementPlus 插件自身在 main.ts use 时处理，
// 这里只保留业务 locale。业务 en.js / zh.js 保持原文件（内容不变），
// 等 Codemod 后如需要 TS 化再处理。
// @ts-ignore 业务语言文件还是 .js
import enLocale from './en'
// @ts-ignore
import zhLocale from './zh'

const messages = {
  en: { ...enLocale },
  zh: { ...zhLocale }
}

export function getLanguage(): string {
  const chooseLanguage = localStorage.getItem('language')
  return chooseLanguage || 'zh'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getLanguage(),
  messages
})

export default i18n

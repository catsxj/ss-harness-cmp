// TODO: i18n - vue-i18n@8 不兼容 Vue 3；如需重启国际化需升级到 vue-i18n@9 并改写 messages
// 当前 sms-web 实际未启用 i18n，仅保留 getLanguage 作为 store 初始化入口
export function getLanguage(): string {
  return localStorage.getItem('language') || 'zh'
}
